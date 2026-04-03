---
type: DECISION
date: 2026-04-04
project: company-private
topic: Add 7 MBA-specific slash commands to the workspace
phase: analyze
tags: [commands, mba-workflow, academic-work]
---

# DECISION: Add MBA Academic Workflow Commands

## Decision

Created 7 new slash commands tailored to MBA student needs:
- `/start` — updated from COC to MBA orientation
- `/study <topic>` — deep-dive study session (9-section structure)
- `/explain <concept>` — quick plain-English explanation (under 300 words)
- `/practice <topic>` — practice problems with worked solutions
- `/exam-prep <subject>` — full exam preparation package
- `/assignment` — 5-phase assignment workflow (from brief to draft)
- `/review` — review workspace deliverables or assignment drafts

## Rationale

The workspace had no academic workflow support. The user is an MBA student who needs both investment analysis capabilities (existing phase commands) and academic work support (new commands). The gap was identified when user asked "what CO command for MBA student like me need."

## Design Principles

- Academic commands are standalone (no workspace state required) — can be used any time
- Phase commands (/analyze → /todos → /implement) handle structured investment projects
- `/assignment` includes a structural gate (Phase 2 outline approval) per CO Human-on-the-Loop
- `/review` handles both workspace deliverables and standalone assignment drafts
- Harvard referencing as default (overridable)

## Consequences

User now has a complete MBA toolkit. Two tracks: (1) company analysis via phase commands, (2) academic work via standalone commands.
