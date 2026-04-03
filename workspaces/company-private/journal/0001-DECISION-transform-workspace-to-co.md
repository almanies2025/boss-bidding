---
type: DECISION
date: 2026-04-04
project: company-private
topic: Transform workspace from COC (Kailash codegen) to domain-agnostic CO
phase: analyze
tags: [workspace-setup, co-methodology, mba-workflow]
---

# DECISION: Transform Boss-Bidding Workspace to Domain-Agnostic CO

## Decision

Reconfigured CLAUDE.md from a Kailash Python SDK codegen (COC) template to a domain-agnostic CO (Cognitive Orchestration) workspace purpose-built for MBA investment analysis and academic research.

## Context

The workspace was bootstrapped from a COC template — the default starting point in this repository. However, the actual work being done here is non-technical:

- **Investment analysis** — private company deep-dives
- **MBA academic work** — assignments, exam preparation, case studies
- **Business research** — strategy analysis, competitive intelligence, sector research

COC is CO applied specifically to software development. Running MBA research through a codegen-optimised workspace meant every session encountered irrelevant directives (Foundation Independence, Framework-First, Kailash SQL rules) that created friction without value.

## Rationale

CO is explicitly domain-agnostic. The five-layer architecture (Intent → Context → Guardrails → Instructions → Learning) maps cleanly onto research workflows:

| CO Layer         | MBA Research Equivalent                          |
| ---------------- | ------------------------------------------------ |
| Intent (agents)  | Domain analysts — investment, strategy, academic |
| Context          | Briefs, prior analysis, institutional knowledge  |
| Guardrails       | Journal rules, zero-tolerance, Human-on-the-Loop |
| Instructions     | Phase commands (/analyze → /redteam → /codify)   |
| Learning         | Session notes, journal entries, wrapup           |

Keeping COC configuration would have forced a choice every session between following irrelevant rules or ignoring them — both worse than a clean reconfiguration.

## Alternatives Considered

1. **Keep COC, ignore irrelevant rules** — Poor: cognitive friction every session; risk of accidentally following Kailash-specific patterns in research contexts
2. **Create a new workspace type from scratch** — Unnecessary: CO already provides exactly the right abstraction; reinventing it would duplicate the phase command infrastructure
3. **Strip all rules, use plain CLAUDE.md** — Poor: loses institutional structure (journal rules, Human-on-the-Loop, zero-tolerance) that applies to all domains

## Changes Made

**Removed** (COC/Kailash-specific):

- Foundation Independence directive
- Framework-First rules (DataFlow, Nexus, Kaizen specialists)
- 20+ Kailash SDK rules (infrastructure-sql, dataflow-pool, trust-plane, etc.)
- Python SDK references throughout

**Added** (CO domain-agnostic):

- CO Five-Layer Architecture description
- Human-on-the-Loop governance model
- Institutional Knowledge First directive
- Three Failure Modes guard (Amnesia, Convention Drift, Safety Blindness)
- MBA-appropriate agent list (deep-analyst, requirements-analyst, intermediate-reviewer)

**Retained** (universal CO infrastructure):

- All phase commands (`/analyze` → `/todos` → `/implement` → `/redteam` → `/codify`)
- Journal rules and entry types
- Agent orchestration model
- Zero-tolerance enforcement
- Git workflow rules

## Consequences

- All future sessions operate under CO methodology with MBA-appropriate context
- Phase commands are identical — only the domain interpretation changes
- Domain specialists (investment analyst, strategy reviewer) can be added to `.claude/agents/project/` during `/codify` as the workspace matures
- No Kailash SDK rules will interfere with research or academic work
