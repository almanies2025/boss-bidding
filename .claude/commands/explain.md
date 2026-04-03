---
name: explain
description: "Plain-English explanation of any concept, term, or idea — quick and conversational."
---

Explain the concept in `$ARGUMENTS` clearly and concisely.

Parse `$ARGUMENTS` for the concept. If empty, ask: "What would you like me to explain?"

---

## Explanation Format

Keep it short. This is a quick clarification, not a full study session (use `/study` for depth).

**Structure:**

1. **What it is** — One sentence, plain English. No jargon unless explained immediately.

2. **The intuition** — Why does it work the way it does? Give the underlying logic, not just the definition.

3. **A simple example** — The simplest possible concrete example. Numbers if it's quantitative. A story if it's conceptual.

4. **One-line to remember it** — A memorable phrase or analogy that makes it stick.

---

## Rules

- Keep the full response under 300 words unless the concept genuinely requires more
- Never use a technical term to explain another technical term without defining both
- If the concept is controversial or has competing definitions, flag that briefly
- If the concept is part of a larger framework, name the framework and offer to explain the bigger picture

## After Delivering

Offer one of:
- "Want me to go deeper with `/study [concept]`?"
- "Want some practice questions on this?"
- Answer any follow-up naturally in conversation
