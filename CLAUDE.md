# CO Workspace — boss-bidding

**Project**: boss-bidding  
**Repository**: [`almanies2025/boss-bidding`](https://github.com/almanies2025/boss-bidding)

---

## ✅ Workspace Connection Active

**You are now connected to the boss-bidding CO workspace.**

| Component | Location |
|-----------|----------|
| **Agents** | `.claude/agents/` — 30+ specialized domain experts |
| **Skills** | `.claude/skills/` — 28 specialized capabilities |
| **Rules** | `.claude/rules/` — governance & behavioral rules |
| **Commands** | `.claude/commands/` — workspace phase commands |
| **Hooks** | `scripts/hooks/` — enforcement hooks |

**Quick Start Commands**: `/analyze` `/todos` `/implement` `/redteam` `/codify` `/ws` `/wrapup`

---

This repository is a **CO (Cognitive Orchestration) workspace** — providing agents, skills, rules, and hooks for structured human-AI collaboration across any domain. CO is the domain-agnostic base methodology. Domain-specific workspaces (investment analysis, strategy, research, product) live under `workspaces/`.

## The CO Five-Layer Architecture

```text
Layer 5: LEARNING      — Observe, capture, evolve knowledge across sessions (journal, wrapup)
Layer 4: INSTRUCTIONS  — Structured workflows with approval gates (/analyze → /todos → /implement → /redteam → /codify)
Layer 3: GUARDRAILS    — Deterministic enforcement outside AI context (hooks, rules)
Layer 2: CONTEXT       — Workspace institutional knowledge (briefs, analysis, plans, user flows)
Layer 1: INTENT        — Domain-specialized agents (analysts, specialists, reviewers)
```

## Absolute Directives

These override ALL other instructions. They govern behavior before any rule file is consulted.

### 1. Human-on-the-Loop

The human defines the operating envelope (brief) and approves structural gates (/todos approval). AI executes autonomously within those envelopes. The human observes outcomes — they are not in the execution loop.

**Structural gates** (human approval required): plan approval (/todos), release/publish authorization  
**Execution gates** (autonomous convergence): analysis quality, implementation correctness, validation rigor

### 2. Institutional Knowledge First

Before executing any task, check whether this workspace's institutional knowledge already addresses it:

- Review the workspace `journal/` for relevant prior decisions and discoveries
- Check `01-analysis/` for prior research before starting new research
- Check `02-plans/` before planning work already planned
- Use specialist agents from `.claude/agents/` — don't reinvent what agents already know

### 3. Complete Work, Don't Defer

When you discover a gap, missing analysis, or incomplete deliverable — **fill it**. Do not note it as a gap and move on. The only acceptable skip is explicit user instruction.

### 4. Zero Tolerance

Pre-existing failures must be fixed, not reported. Gaps in plans must be addressed, not catalogued. See `rules/zero-tolerance.md`.

### 5. Recommended Reviews

- **Analysis review** (deep-analyst or intermediate-reviewer) after significant work — RECOMMENDED
- **Security review** (security-reviewer) before commits — strongly recommended
- **Value audit** (value-auditor) for deliverables that will be presented to external stakeholders

### 6. LLM-First Agent Reasoning

When building or using AI agents: **the LLM does ALL reasoning. Tools are dumb data endpoints.** No if-else routing, no keyword matching, no hardcoded classification in agent decision paths. The LLM IS the router, classifier, extractor, and evaluator. See `rules/agent-reasoning.md`.

### 7. Three Failure Modes to Guard Against

Per CO Principle 3 — every session, every deliverable, guard against:

- **Amnesia** — Starting fresh without reading the journal and prior analysis
- **Convention Drift** — Letting standards slip across sessions
- **Safety Blindness** — Missing risks because the analysis is going well

## Workspace Commands

Phase commands replace the manual copy-paste workflow. Each loads the corresponding instruction template and checks workspace state.

| Command      | Phase | Purpose                                                    |
| ------------ | ----- | ---------------------------------------------------------- |
| `/analyze`   | 01    | Load analysis phase for current workspace                  |
| `/todos`     | 02    | Load todos phase; stops for human approval                 |
| `/implement` | 03    | Load implementation phase; repeat until todos done         |
| `/redteam`   | 04    | Load validation phase; red team with specialist agents     |
| `/codify`    | 05    | Load codification phase; create agents & skills            |
| `/ws`        | —     | Read-only workspace status dashboard                       |
| `/wrapup`    | —     | Write session notes before ending                          |
| `/journal`   | —     | View, create, or search project journal entries            |

**Workspace detection**: Hooks automatically detect the active workspace and inject context. `session-start.js` shows workspace status on session start. `user-prompt-rules-reminder.js` injects a 1-line `[WORKSPACE]` summary into Claude's context every turn (survives context compression).

**Session continuity**: Run `/wrapup` before ending a session to write `.session-notes`. The next session's startup reads these notes and shows workspace progress automatically.

## Workspace Structure

Each workspace under `workspaces/<project>/` follows this structure:

```text
workspaces/<project>/
├── briefs/          ← Human input surface (the brief defines the operating envelope)
├── 01-analysis/     ← Research, findings, models, estimates
├── 02-plans/        ← Synthesis plans, monitoring, due diligence gaps
├── 03-user-flows/   ← Decision frameworks, scenario playbooks, user journeys
├── 04-validate/     ← Red team findings, validation reports
├── journal/         ← Knowledge trail (DECISION, DISCOVERY, TRADE-OFF, RISK, CONNECTION, GAP)
├── todos/
│   ├── active/      ← Current work
│   └── completed/   ← Done
└── .session-notes   ← Cross-session continuity (written by /wrapup)
```

## Rules Index

| Concern | Rule File | Scope |
| ------- | --------- | ----- |
| **Autonomous execution model** | `rules/autonomous-execution.md` | **Global — 10x multiplier, structural vs execution gates** |
| **LLM-first agent reasoning** | `rules/agent-reasoning.md` | **Global — all agent code and AI patterns** |
| Agent orchestration & review recommendations | `rules/agents.md` | Global |
| Communication style | `rules/communication.md` | Global — non-technical user interactions |
| Git commits, branches, PRs | `rules/git.md` | Global |
| Branch protection & PR workflow | `rules/branch-protection.md` | Global |
| Security (secrets, data handling) | `rules/security.md` | Global |
| Journal knowledge trail | `rules/journal.md` | Global |
| Zero tolerance enforcement | `rules/zero-tolerance.md` | Global |
| No stubs or deferred work | `rules/no-stubs.md` | Global |

**Note**: Rules load every session. Workspace-specific rules may be added to `workspaces/<project>/rules/` and are loaded only for that workspace.

## Agents

### Analysis & Planning

- **deep-analyst** — Failure analysis, complexity assessment, risk identification
- **requirements-analyst** — Requirements breakdown, scope definition, ADR creation
- **sdk-navigator** — Find existing patterns and knowledge before designing from scratch
- **framework-advisor** — Choose the right approach when multiple paths exist

### Domain Specialists

- **dataflow-specialist** — Data modeling, database design, bulk data operations
- **nexus-specialist** — API design, multi-channel deployment
- **kaizen-specialist** — AI agent design, multi-agent coordination
- **mcp-specialist** — MCP server/tool implementation
- **infrastructure-specialist** — Infrastructure design, progressive deployment
- **pact-specialist** — Organizational governance, access control, accountability

### Review & QA

- **intermediate-reviewer** — Work review after significant changes (RECOMMENDED)
- **gold-standards-validator** — Compliance and standards checking
- **security-reviewer** — Security audit before commits (RECOMMENDED)
- **value-auditor** — Deliverable QA from external stakeholder perspective

### Frontend & Design

- **react-specialist** — React/Next.js frontends
- **flutter-specialist** — Flutter mobile/desktop apps
- **frontend-developer** — Responsive UI components
- **uiux-designer** — Enterprise UI/UX design
- **ai-ux-designer** — AI interaction patterns

### Release & Operations

- **git-release-specialist** — Git workflows, CI, releases
- **deployment-specialist** — Deployment, publishing, CI/CD management
- **todo-manager** — Project task tracking
- **gh-manager** — GitHub issue/project management

### Standards & Frameworks

- **care-expert** — CARE governance framework
- **co-expert** — CO methodology (this workspace's base methodology)
- **coc-expert** — COC development methodology
- **eatp-expert** — EATP trust protocol

## Skills Navigation

Skills in `.claude/skills/` are organized by domain:

- `01-core-sdk` through `05-kailash-mcp` — Kailash SDK implementation patterns
- `06-cheatsheets` through `14-code-templates` — Development references
- `15-enterprise-infrastructure` — Infrastructure patterns
- `19-flutter-patterns` through `25-ai-interaction-patterns` — Frontend & UX
- `26-eatp-reference`, `27-care-reference`, `28-coc-reference`, `co-reference` — Framework references
