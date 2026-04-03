# API Documentation Standards Rules

## Scope
These rules apply to ALL public APIs — Python public functions/classes, Nexus REST endpoints, Kaizen agent interfaces, and DataFlow model definitions. They do NOT apply to private/internal functions (prefixed with `_`).

---

## Core Principle: The API IS the Documentation

A public API without documentation is a trap for consumers. Documentation is not separate from the code — it is part of the contract. Incomplete docs are a bug.

---

## MUST Rules

### 1. Docstrings for All Public Functions and Classes
Every public function, method, and class MUST have a docstring.

**Required docstring sections**:
- One-line summary (imperative mood: "Return X", "Execute Y")
- `Args:` — all parameters with types and description
- `Returns:` — return type and what it means
- `Raises:` — exceptions that callers should handle

**Correct Pattern** (Google style — matches Kailash SDK convention):
```python
✅ def execute_workflow(workflow: Workflow, inputs: dict | None = None) -> tuple[dict, str]:
    """Execute a workflow and return results with a run identifier.

    Args:
        workflow: The built workflow to execute. Must be constructed with
            ``workflow.build()`` before passing.
        inputs: Optional input values to inject into the workflow's entry
            nodes. Keys are node IDs, values are input dicts.

    Returns:
        A tuple of (results, run_id) where ``results`` is a dict mapping
        node ID to output, and ``run_id`` is a unique identifier for this
        execution that can be used for debugging and tracing.

    Raises:
        WorkflowExecutionError: If any node fails and the workflow is
            configured to fail fast (default behavior).
        ValidationError: If ``workflow`` has not been built via ``.build()``.

    Example:
        >>> runtime = LocalRuntime()
        >>> results, run_id = runtime.execute(workflow.build(), inputs={"start": {"x": 1}})
        >>> print(results["output_node"]["value"])
    """
```

**Detection Patterns**:
```
❌ def execute_workflow(workflow, inputs=None):
       # no docstring
       ...

❌ def execute_workflow(workflow, inputs=None):
       """Execute."""  # one-word summary — not useful
```

**Enforced by**: intermediate-reviewer agent on public API changes
**Violation**: MEDIUM priority fix

---

### 2. Changelog Entries for User-Facing Changes
Every PR that adds, changes, or removes a public API MUST include a CHANGELOG entry (enforced by `api-versioning.md`). Repeated here as a documentation standard.

**Correct format**:
```markdown
### Added
- `LocalRuntime.execute()` now accepts `timeout` parameter (seconds, default: None).

### Changed
- `WorkflowBuilder.add_node()` parameter `node_type` renamed to `type` for consistency.
  Old name still works but emits `DeprecationWarning`.

### Deprecated
- `workflow.run()` — use `runtime.execute(workflow.build())` instead. Removed in v2.0.

### Removed
- `SyncRuntime` class removed (deprecated since v1.0). Use `LocalRuntime`.
```

**Enforced by**: deployment.md checklist, intermediate-reviewer
**Violation**: PR blocked until CHANGELOG updated

---

### 3. Code Examples in Docstrings for Complex APIs
Public APIs with non-obvious usage MUST include a working code example in their docstring.

**"Non-obvious" means**:
- Multi-step setup required
- Parameter interactions that aren't clear from types alone
- Common gotchas (e.g., must call `.build()` before `.execute()`)
- The correct pattern differs from what a developer would intuitively try

**Correct Pattern**:
```python
✅ class WorkflowBuilder:
    """Build a Kailash workflow by composing nodes and edges.

    The builder is mutable until ``build()`` is called. After building,
    the workflow is immutable and can be executed multiple times.

    Example:
        Basic two-node workflow::

            workflow = WorkflowBuilder()
            workflow.add_node("PythonCodeNode", "transform", {
                "code": "result = {'output': input['value'] * 2}"
            })
            workflow.add_node("OutputNode", "output", {})
            workflow.add_edge("transform", "output")

            runtime = LocalRuntime()
            results, run_id = runtime.execute(workflow.build())
    """
```

**Enforced by**: intermediate-reviewer agent
**Violation**: LOW priority fix

---

### 4. REST Endpoint Documentation
All Nexus REST endpoints MUST have OpenAPI documentation (auto-generated from Pydantic models + docstrings is acceptable).

**Required per endpoint**:
- Summary and description
- Request body schema (from Pydantic model)
- Response schema (from Pydantic model)
- Possible error codes and their meaning

**Correct Pattern**:
```python
✅ @app.post(
       "/api/v1/workflows",
       summary="Create and execute a workflow",
       response_model=WorkflowResponse,
       responses={
           400: {"description": "Invalid workflow definition"},
           422: {"description": "Validation error in request body"},
           500: {"description": "Workflow execution failed"},
       },
   )
   async def create_workflow(request: WorkflowRequest) -> WorkflowResponse:
       """Execute a workflow definition and return results.

       Accepts a workflow definition as JSON, executes it, and returns
       the output of all terminal nodes.
       """
```

**Enforced by**: nexus-specialist agent, intermediate-reviewer
**Violation**: MEDIUM priority fix

---

### 5. `.env.example` Must Document All Config Keys
Every key in `.env.example` MUST have a comment explaining what it does, its expected format, and where to get the value.

**Correct Pattern**:
```bash
✅ # Anthropic API key for LLM calls.
   # Get from: https://console.anthropic.com/
   # Required for: all agent and workflow LLM nodes
   ANTHROPIC_API_KEY=your-anthropic-api-key-here

   # Default LLM model for workflow nodes.
   # Options: claude-sonnet-4-6, claude-haiku-4-5-20251001, claude-opus-4-6
   # Default: claude-sonnet-4-6
   KAILASH_MODEL=claude-sonnet-4-6

   # PostgreSQL connection string.
   # Format: postgres://user:password@host:port/dbname
   # Required for: DataFlow, PACT governance
   DATABASE_URL=postgres://localhost/dev_db
```

**Enforced by**: intermediate-reviewer agent on `.env.example` changes
**Violation**: LOW priority fix

---

## MUST NOT Rules

### 1. No Auto-Generated Docstrings Without Content
MUST NOT use empty or template docstrings that don't provide real information.

```
❌ def get_user(user_id: str) -> User:
       """Get user.

       Args:
           user_id: The user id.

       Returns:
           The user.
       """
       # This adds no information beyond the type signature
```

**Correct** — only document what isn't obvious from the signature:
```python
✅ def get_user(user_id: str) -> User:
       """Fetch a user by their stable internal ID.

       Args:
           user_id: The user's internal UUID, not their username or email.

       Returns:
           The User object with all fields populated from the database.

       Raises:
           UserNotFoundError: If no user exists with this ID.
       """
```

### 2. No Documentation of Private APIs
MUST NOT add elaborate docstrings to private functions (`_prefixed`). Brief inline comments are sufficient for complex internals.

### 3. No Stale Examples in Docstrings
Docstring examples MUST be kept up to date with API changes. A docstring that shows a deprecated pattern is worse than no docstring — it actively misleads.

---

## Kailash-Specific

### SDK Public API
- All `kailash` package public exports require full docstrings per this rule
- Node `INPUTS` and `OUTPUTS` class attributes count as public API — document what each input/output means

### Kaizen Agent Signatures
- Agent signatures (if exposed as public API) MUST document expected input/output schema
- Tool definitions MUST document what the tool does, its parameters, and return format

## Exceptions
Documentation exceptions apply to:
- Trivial properties (getters/setters with self-explanatory names)
- Test helper functions
- Scripts not intended for public use

No approval required for these exceptions — use judgment. For anything at all public-facing, documentation is mandatory.
