#!/usr/bin/env node
/**
 * Hook: validate-new-rules
 * Event: PostToolUse
 * Matcher: Edit|Write
 * Purpose: Enforce patterns from the 10 new rules added in 2026-03:
 *   - error-handling.md       → timeouts on HTTP calls, logged exceptions
 *   - concurrency-safety.md   → no threading.Lock in async, fire-and-forget tasks
 *   - performance-constraints → no .all() without limit, no time.sleep in async
 *   - configuration-management → no bare os.environ.get() on required keys
 *   - dependency-management   → version specifiers in pyproject.toml
 *   - ci-cd-pipeline.md       → pinned GitHub Actions versions
 *   - data-validation.md      → unvalidated dict access on API inputs
 *
 * Exit Codes:
 *   0 = success / warn-only
 *   2 = blocking error
 */

const fs = require("fs");
const path = require("path");

const TIMEOUT_MS = 5000;
const timeout = setTimeout(() => {
  console.error("[HOOK TIMEOUT] validate-new-rules exceeded 5s limit");
  console.log(JSON.stringify({ continue: true }));
  process.exit(1);
}, TIMEOUT_MS);

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  clearTimeout(timeout);
  try {
    const data = JSON.parse(input);
    const result = validateFile(data);
    console.log(
      JSON.stringify({
        continue: result.continue,
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          validation: result.messages,
        },
      })
    );
    process.exit(result.exitCode);
  } catch (error) {
    console.error(`[HOOK ERROR] ${error.message}`);
    console.log(JSON.stringify({ continue: true }));
    process.exit(1);
  }
});

// =====================================================================
// Main dispatcher
// =====================================================================

function validateFile(data) {
  const filePath = data.tool_input?.file_path || "";
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath);

  const isPy = ext === ".py";
  const isToml = ext === ".toml" && basename === "pyproject.toml";
  const isYaml =
    (ext === ".yml" || ext === ".yaml") &&
    filePath.includes(".github/workflows");

  if (!isPy && !isToml && !isYaml) {
    return { continue: true, exitCode: 0, messages: ["Not a monitored file type -- skipped"] };
  }

  let content;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    return { continue: true, exitCode: 0, messages: ["Could not read file"] };
  }

  const messages = [];
  let shouldBlock = false;

  if (isPy) {
    checkHttpTimeouts(content, filePath, messages);
    checkAsyncConcurrency(content, filePath, messages);
    checkUnboundedQueries(content, filePath, messages);
    checkSleepInAsync(content, filePath, messages);
    checkBareEnvGet(content, filePath, messages);
    checkUnloggedExceptions(content, filePath, messages);
    checkFireAndForgetTasks(content, filePath, messages);
  }

  if (isToml) {
    checkDependencyVersions(content, filePath, messages);
  }

  if (isYaml) {
    checkUnpinnedActions(content, filePath, messages);
    checkHardcodedSecretsInCi(content, filePath, messages);
  }

  if (messages.length === 0) {
    messages.push("All new-rule patterns validated");
  }

  return {
    continue: !shouldBlock,
    exitCode: shouldBlock ? 2 : 0,
    messages,
  };
}

// =====================================================================
// error-handling.md — HTTP calls must have timeouts
// =====================================================================

function checkHttpTimeouts(content, filePath, messages) {
  if (isTestFile(filePath)) return;

  const lines = content.split("\n");
  // Match requests.get/post/put/patch/delete/head/request( without timeout
  const httpCallPattern = /\brequests\.(get|post|put|patch|delete|head|request)\s*\(/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (httpCallPattern.test(line)) {
      // Check if timeout appears on this line or the next 3 lines (multi-line calls)
      const nearby = lines.slice(i, Math.min(i + 4, lines.length)).join(" ");
      if (!/\btimeout\s*=/.test(nearby)) {
        messages.push(
          `WARNING [error-handling]: requests call without timeout at ` +
            `${path.basename(filePath)}:${i + 1}. ` +
            `Add timeout=(connect, read) e.g. timeout=(3.05, 27). ` +
            `See rules/error-handling.md Rule 4.`
        );
      }
    }
  }
}

// =====================================================================
// concurrency-safety.md — threading.Lock in async def, fire-and-forget
// =====================================================================

function checkAsyncConcurrency(content, filePath, messages) {
  if (isTestFile(filePath)) return;

  const lines = content.split("\n");
  let inAsyncDef = false;
  let asyncIndent = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Track entry into async def
    if (/^\s*async\s+def\s+/.test(line)) {
      inAsyncDef = true;
      asyncIndent = line.search(/\S/); // indent level of async def
      continue;
    }

    // Track exit from async def (dedent back to or beyond async def level)
    if (inAsyncDef && line.trim() !== "" && !line.startsWith(" ".repeat(asyncIndent + 1)) && !line.startsWith("\t")) {
      inAsyncDef = false;
      asyncIndent = -1;
    }

    if (inAsyncDef) {
      // threading.Lock() used inside async def — blocks event loop
      if (/\bthreading\.(Lock|RLock|Semaphore|Event|Condition)\s*\(\)/.test(line)) {
        messages.push(
          `WARNING [concurrency-safety]: threading primitive in async def at ` +
            `${path.basename(filePath)}:${i + 1}. ` +
            `Use asyncio.Lock/Semaphore/Event instead. ` +
            `See rules/concurrency-safety.md Rule 3.`
        );
      }

      // time.sleep() inside async def — blocks event loop
      if (/\btime\.sleep\s*\(/.test(line) && !/#.*ok|#.*intentional/i.test(line)) {
        messages.push(
          `WARNING [performance-constraints]: time.sleep() in async def at ` +
            `${path.basename(filePath)}:${i + 1}. ` +
            `Use await asyncio.sleep() instead. ` +
            `See rules/performance-constraints.md MUST NOT Rule 1.`
        );
      }
    }
  }
}

// =====================================================================
// performance-constraints.md — unbounded .all() / SELECT * without limit
// =====================================================================

function checkUnboundedQueries(content, filePath, messages) {
  if (isTestFile(filePath)) return;

  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("#")) continue;

    // ORM .all() without a preceding .limit() or .paginate() in nearby chain
    if (/\)\.all\(\)/.test(line)) {
      const preceding = lines.slice(Math.max(0, i - 5), i + 1).join(" ");
      if (!/\.(limit|paginate|first|count|exists)\s*\(/.test(preceding)) {
        messages.push(
          `WARNING [performance-constraints]: .all() without .limit() at ` +
            `${path.basename(filePath)}:${i + 1}. ` +
            `This may load unbounded rows into memory. ` +
            `See rules/performance-constraints.md Rule 2.`
        );
      }
    }

    // SELECT * without LIMIT in raw SQL strings
    if (/["']SELECT\s+\*\s+FROM/i.test(line)) {
      const nearby = lines.slice(i, Math.min(i + 5, lines.length)).join(" ");
      if (!/\bLIMIT\b/i.test(nearby)) {
        messages.push(
          `WARNING [performance-constraints]: SELECT * without LIMIT at ` +
            `${path.basename(filePath)}:${i + 1}. ` +
            `Unbounded query may return all rows. Add LIMIT or paginate. ` +
            `See rules/performance-constraints.md Rule 2.`
        );
      }
    }
  }
}

// =====================================================================
// performance-constraints.md — time.sleep in async (standalone check)
// =====================================================================

function checkSleepInAsync(content, filePath, messages) {
  // Already covered inside checkAsyncConcurrency — no-op here to avoid duplicate
}

// =====================================================================
// configuration-management.md — bare os.environ.get() with no default
// =====================================================================

function checkBareEnvGet(content, filePath, messages) {
  if (isTestFile(filePath)) return;

  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("#")) continue;

    // os.environ.get("KEY") with no default AND assigned to a variable
    // Flag only when the result is used directly (assigned or returned)
    // Pattern: variable = os.environ.get("KEY")  ← no second arg = None return
    if (/=\s*os\.environ\.get\s*\(\s*["'][^"']+["']\s*\)/.test(line)) {
      // Check that there is no second argument (default value)
      // os.environ.get("KEY") has exactly one arg — look for closing paren after the key
      const match = line.match(/os\.environ\.get\s*\(\s*["'][^"']+["']\s*\)/);
      if (match) {
        messages.push(
          `WARNING [configuration-management]: os.environ.get() with no default at ` +
            `${path.basename(filePath)}:${i + 1}. ` +
            `Returns None silently if key is missing. ` +
            `Use require_env() for required keys or provide an explicit default. ` +
            `See rules/configuration-management.md Rule 2.`
        );
      }
    }
  }
}

// =====================================================================
// error-handling.md — except blocks without logging
// =====================================================================

function checkUnloggedExceptions(content, filePath, messages) {
  if (isTestFile(filePath)) return;

  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for except clauses
    if (/^\s*except\s/.test(line)) {
      // Check the next 1-4 lines for a log/raise/return with error info
      const body = lines.slice(i + 1, Math.min(i + 5, lines.length)).join("\n");

      const hasLogging =
        /\blog(ger)?\.(debug|info|warning|warn|error|critical|exception)\s*\(/.test(body) ||
        /\bstructlog\b/.test(body) ||
        /\bprint\s*\(/.test(body); // print is poor practice but is observability

      const hasRaise = /\braise\b/.test(body);
      const isEmpty = /^\s*(pass\b|\.{3})/.test(body.trimStart());

      // Only warn if: body is not just raising, not logging, and not empty (empty already caught by zero-tolerance)
      if (!hasLogging && !hasRaise && !isEmpty) {
        messages.push(
          `REVIEW [error-handling]: except block at ${path.basename(filePath)}:${i + 1} ` +
            `appears to handle the exception without logging. ` +
            `Add logger.exception() or re-raise. ` +
            `See rules/error-handling.md Rule 1.`
        );
      }
    }
  }
}

// =====================================================================
// concurrency-safety.md — asyncio.create_task without done callback
// =====================================================================

function checkFireAndForgetTasks(content, filePath, messages) {
  if (isTestFile(filePath)) return;

  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/\basyncio\.create_task\s*\(/.test(line)) {
      // Check next 3 lines for .add_done_callback or variable assignment for later awaiting
      const nearby = lines.slice(i, Math.min(i + 4, lines.length)).join("\n");

      const isAssigned = /\w+\s*=\s*asyncio\.create_task/.test(line);
      const hasCallback = /\.add_done_callback\s*\(/.test(nearby);

      if (!isAssigned && !hasCallback) {
        messages.push(
          `WARNING [concurrency-safety]: fire-and-forget asyncio.create_task() at ` +
            `${path.basename(filePath)}:${i + 1}. ` +
            `Unhandled task exceptions are silently discarded. ` +
            `Assign to a variable and add .add_done_callback(handle_task_exception). ` +
            `See rules/concurrency-safety.md MUST NOT Rule 2.`
        );
      }
    }
  }
}

// =====================================================================
// dependency-management.md — pyproject.toml version specifiers
// =====================================================================

function checkDependencyVersions(content, filePath, messages) {
  const lines = content.split("\n");
  let inDependencies = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track [project.dependencies] or [project.optional-dependencies.*] sections
    if (/^\s*\[project(\.optional-dependencies\.\w+)?\]/.test(line)) {
      inDependencies = true;
      continue;
    }
    if (/^\s*\[/.test(line) && inDependencies) {
      // Check if we're still in a dependencies section
      if (!/^\s*\[project\.optional-dependencies/.test(line)) {
        inDependencies = false;
      }
    }

    // Also check inline dependencies = [...] format
    const depsMatch = line.match(/^\s*dependencies\s*=\s*\[/);
    if (depsMatch) {
      inDependencies = true;
    }

    if (inDependencies) {
      // Match a quoted dependency string (strip extras like [security])
      const depMatch = line.match(/["']\s*([a-zA-Z0-9_\-]+)(?:\[[^\]]+\])?\s*["']/);
      if (depMatch) {
        const dep = depMatch[0];
        // Check if the dependency string has any version specifier
        const hasVersion = /[><=!~^]/.test(dep);
        if (!hasVersion) {
          messages.push(
            `WARNING [dependency-management]: dependency ${depMatch[1]} has no version specifier at ` +
              `${path.basename(filePath)}:${i + 1}. ` +
              `Add a version constraint e.g. "${depMatch[1]}>=1.0,<2". ` +
              `See rules/dependency-management.md Rule 1.`
          );
        }
      }
    }
  }
}

// =====================================================================
// ci-cd-pipeline.md — unpinned GitHub Actions
// =====================================================================

function checkUnpinnedActions(content, filePath, messages) {
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match: uses: actions/something@<ref>
    const usesMatch = line.match(/^\s*uses:\s*([a-zA-Z0-9_\-./]+)@([^\s#]+)/);
    if (usesMatch) {
      const action = usesMatch[1];
      const ref = usesMatch[2];

      // Unpinned: @main, @master, @latest, @HEAD, or no version at all
      if (/^(main|master|latest|HEAD|develop)$/.test(ref)) {
        messages.push(
          `WARNING [ci-cd-pipeline]: unpinned GitHub Action "${action}@${ref}" at ` +
            `${path.basename(filePath)}:${i + 1}. ` +
            `Pin to a specific version tag (e.g. @v4) or SHA. ` +
            `See rules/ci-cd-pipeline.md MUST NOT Rule 2.`
        );
      }
    }
  }
}

// =====================================================================
// ci-cd-pipeline.md — hardcoded secrets in workflow files
// =====================================================================

function checkHardcodedSecretsInCi(content, filePath, messages) {
  const lines = content.split("\n");
  // Rough detection: env var set to a value that looks like a real key
  const secretValuePattern = /:\s*["']?(sk-ant-|sk-proj-|ghp_|AIzaSy|AKIA)[a-zA-Z0-9_\-]{10,}/;

  for (let i = 0; i < lines.length; i++) {
    if (secretValuePattern.test(lines[i])) {
      messages.push(
        `CRITICAL [ci-cd-pipeline]: possible hardcoded secret in CI workflow at ` +
          `${path.basename(filePath)}:${i + 1}. ` +
          `Use \${{ secrets.YOUR_SECRET }} instead. ` +
          `See rules/ci-cd-pipeline.md Rule 4.`
      );
    }
  }
}

// =====================================================================
// Helpers
// =====================================================================

function isTestFile(filePath) {
  const basename = path.basename(filePath).toLowerCase();
  return (
    /^test_|_test\.|\.test\.|\.spec\./.test(basename) ||
    filePath.includes("__tests__") ||
    filePath.includes("/tests/") ||
    filePath.includes("/test/")
  );
}
