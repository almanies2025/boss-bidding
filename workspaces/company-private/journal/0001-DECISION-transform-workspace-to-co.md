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

Rewrote CLAUDE.md from a Kailash Python SDK codegen (COC) configuration to a domain-agnostic CO (Cognitive Orchestration) workspace suited for MBA investment analysis and academic work.

## Rationale

The workspace was bootstrapped from a COC template but the actual work being done is:
- Investment analysis (MBC Group private company analysis)
- MBA academic work (assignments, exam prep, study)
- Business research and strategy analysis

The COC-specific directives (Foundation Independence, Framework-First, Kailash-specific rules) were irrelevant and added friction. The domain-agnostic CO five-layer architecture applies equally well to investment research.

## Alternatives Considered

1. Keep COC configuration, ignore irrelevant rules → Poor: creates confusion every session
2. Create a separate workspace type → Unnecessary: CO is already domain-agnostic

## Changes Made

- Removed: 20 Kailash-specific rules, Foundation Independence directive, Python SDK references
- Added: CO Five-Layer Architecture, Human-on-the-Loop, Institutional Knowledge First, Three Failure Modes
- Retained: All phase commands (/analyze → /todos → /implement → /redteam → /codify), journal rules, agent orchestration

## Consequences

All future sessions will operate under CO methodology with MBA-appropriate tooling. Phase commands remain identical — only the domain context changes.
