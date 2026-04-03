---
name: practice
description: "Generate practice problems, case questions, or quantitative exercises with full worked solutions."
---

Generate practice problems for the topic in `$ARGUMENTS`.

Parse `$ARGUMENTS`:
- Topic only (e.g., `/practice DCF valuation`) → generate 3 problems of mixed difficulty
- Topic + difficulty (e.g., `/practice Porter's Five Forces easy`) → generate 3 problems at that level
- Topic + count (e.g., `/practice WACC 5`) → generate that many problems
- Topic + type (e.g., `/practice M&A synergies case`) → generate case-style questions

If `$ARGUMENTS` is empty, ask: "What topic would you like to practice? (e.g., DCF, Porter's Five Forces, SWOT, capital structure)"

---

## Problem Generation Rules

### Difficulty Levels

| Level | What It Tests |
|-------|--------------|
| **Easy** | Recall and basic application. Definition, simple calculation, identify the framework |
| **Medium** | Analysis. Apply the framework to a given scenario. Multi-step calculations |
| **Hard** | Synthesis and judgment. Ambiguous situations, competing frameworks, defend a recommendation |

### Problem Types by Subject Area

**Quantitative** (Finance, Accounting, Economics):
- Show all given information clearly
- Ask for a specific numerical answer
- Provide full worked solution with each step labeled

**Qualitative / Framework** (Strategy, Marketing, Organizational Behavior):
- Provide a realistic company/industry scenario (2-4 sentences)
- Ask a focused analytical question
- Provide a model answer showing the analytical structure

**Case-Style**:
- 1-2 paragraph scenario with real-feeling context
- 2-3 sub-questions building in complexity
- Full answer guide with the key insights an examiner would look for

---

## Output Format

For each problem:

```
PROBLEM [N] — [Difficulty]

[Question text]

---
WORKED SOLUTION

[Full solution with reasoning]

Key insight: [One sentence on what this tests]
```

---

## After Delivering

Ask: "Want more problems, a harder version, or would you like to attempt these and have me check your answers?"
