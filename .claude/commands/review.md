---
name: review
description: "Review a completed assignment, analysis, or workspace deliverable for gaps, logic, and quality."
---

Review the work specified in `$ARGUMENTS`.

Parse `$ARGUMENTS`:
- Workspace name (e.g., `/review company-private`) → review all deliverables in that workspace
- "assignment" → ask the user to paste or describe the assignment for review
- Topic or section (e.g., `/review DCF model`) → focused review on that area

If `$ARGUMENTS` is empty, ask: "What would you like me to review? (e.g., paste your assignment draft, name a workspace, or describe what you've done)"

---

## Review Framework

### For Workspace Deliverables (analysis, plans, theses)

Read all files in `workspaces/<project>/01-analysis/`, `02-plans/`, and `03-user-flows/`.

Evaluate against these dimensions:

**1. Completeness**
- Are all sections of the brief addressed?
- Are there gaps in the analysis (missing data, unexplored angles, unresolved questions)?
- Does the investment thesis / strategic conclusion follow from the evidence?

**2. Logic and Consistency**
- Is the argument internally consistent?
- Do the numbers reconcile across documents?
- Are assumptions stated explicitly?

**3. Framework Application**
- Are the right frameworks being used?
- Are they applied rigorously or just named?
- Are conclusions drawn from the framework output, or asserted independently of it?

**4. Risk Coverage**
- Are the key risks identified?
- Are they assessed for probability and impact, not just listed?
- Is there a credible mitigation or monitoring approach?

**5. Strength of Conclusions**
- Are recommendations specific and actionable?
- Is the bull/base/bear (or equivalent) distinction clear?
- Would a skeptical reader find the conclusions well-supported?

### For Assignment Drafts

Evaluate against:
- **Question fit**: Does the answer actually answer the question asked?
- **Argument structure**: Is there a clear central argument? Does each section advance it?
- **Evidence quality**: Are claims supported? Are sources credible?
- **Framework accuracy**: Correctly applied, or superficially mentioned?
- **Academic style**: Appropriate register, proper referencing, no unsupported assertions
- **Word count discipline**: Under limit? Well-distributed across sections?

---

## Output Format

**Executive Review Summary**

| Dimension | Rating (Strong / Adequate / Needs Work) | Key Finding |
|-----------|----------------------------------------|------------|
| Completeness | | |
| Logic | | |
| Framework Application | | |
| Risk Coverage | | |
| Conclusions | | |

**Top 3 Strengths**
What is working well — be specific.

**Top 3 Issues to Fix**
The most important improvements, in priority order. For each: what the issue is, why it matters, and how to fix it.

**Minor Issues**
Any smaller points worth addressing if time allows.

**Overall Assessment**
One paragraph. Is this work ready to submit / present / publish? What would take it from good to excellent?

---

## Tone

Direct and constructive. Be honest about weaknesses — vague praise doesn't help. Frame everything as "here's how to make this stronger," not "this is wrong."
