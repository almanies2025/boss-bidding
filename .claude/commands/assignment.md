---
name: assignment
description: "Structure and develop an MBA assignment — from brief to outline to full draft, with structured analysis."
---

Run the assignment workflow for the brief in `$ARGUMENTS`.

Parse `$ARGUMENTS`:
- Assignment description (e.g., `/assignment Analyze Apple's competitive strategy using Porter's Five Forces`) → full workflow
- "brief" or empty → ask the user for the assignment details interactively

If `$ARGUMENTS` is empty or "brief", ask:
1. What is the assignment question or topic?
2. What subject/module is this for?
3. What is the word count or page limit?
4. What is the deadline?
5. Are there specific frameworks or readings the professor expects you to use?

---

## Assignment Workflow

### Phase 1: Understand the Brief

Restate the assignment in your own words. Confirm:
- What the question is actually asking (surface vs. deep read)
- What type of response is expected (analytical, argumentative, evaluative, prescriptive)
- What success looks like (what would earn top marks vs. a pass)

Flag any ambiguities and resolve them with the user before proceeding.

### Phase 2: Structure the Argument

Propose an outline before writing anything. Show:
- The central argument or thesis (one sentence)
- Section-by-section structure with the key point of each section
- Which frameworks apply where
- Word count allocation per section

**Stop and get user approval of the outline before proceeding.**

### Phase 3: Research and Analysis

For each section of the outline:
- Identify what data, evidence, or analysis is needed
- Conduct the analysis (apply frameworks, synthesize findings)
- Flag where the user needs to provide company-specific data that isn't publicly available

Use the workspace's `01-analysis/` content if the assignment relates to a company already analyzed.

### Phase 4: Draft

Write the full assignment following the approved outline. Style guidelines:
- Clear, precise academic English
- Every claim supported by evidence or reasoning
- Frameworks applied rigorously, not superficially
- Conclusions flow directly from analysis — no unsupported assertions
- Harvard referencing format unless the user specifies otherwise

### Phase 5: Review

After drafting, run a self-review:
- Does the answer directly address the question asked?
- Is the argument logically coherent from start to finish?
- Are frameworks applied correctly (not just named)?
- Is the word count within the limit?
- Are there any unsupported claims?

Present a brief review summary and any recommended revisions.

---

## Tone

Academic but clear. Aim for the tone of a confident, well-prepared MBA student — analytical, precise, and direct. Not stuffy. Not padded.

## After Delivering

Ask: "Want me to review this for gaps, strengthen any section, or check it against the marking criteria?"
