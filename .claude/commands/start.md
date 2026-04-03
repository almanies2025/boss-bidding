---
name: start
description: "New user orientation — explains the CO workspace and how an MBA student gets started."
---

Present this orientation clearly and directly. Adapt tone to the user — if they seem experienced, be brief; if they're new, take more time.

## What Is This Workspace?

This is a **CO (Cognitive Orchestration) workspace** — a structured system where you direct AI to do research, analysis, and academic work. You provide the brief and make the key decisions. The AI does the analytical heavy lifting.

You don't need to write code or understand technology. Your job is to:

1. **Describe what you want** — in plain language
2. **Approve the plan** before work begins
3. **Review the output** to make sure it's right

---

## Two Types of Work

### 1. Analysis Projects (Company / Market / Strategy)
For deep-dive research on a company, industry, or strategic question.

| Step | Command | What Happens |
|------|---------|-------------|
| Research | `/analyze <workspace>` | Deep research on the company or topic |
| Plan | `/todos <workspace>` | Plans remaining deliverables — you approve before work starts |
| Execute | `/implement <workspace>` | Builds the deliverables |
| Stress-test | `/redteam <workspace>` | Challenges the analysis for gaps and errors |

### 2. Academic Work (Assignments, Exams, Study)
For coursework, exam prep, and understanding concepts.

| Command | What It Does |
|---------|-------------|
| `/study <topic>` | Full deep-dive on any concept, framework, or theory |
| `/explain <concept>` | Quick plain-English explanation |
| `/practice <topic>` | Practice problems with worked solutions |
| `/exam-prep <subject>` | Full exam preparation package |
| `/assignment` | Structure and develop an assignment from brief to draft |
| `/review` | Review completed work for gaps and quality |

---

## Getting Started

**For company analysis:**
1. Go to `workspaces/company-public/briefs/brief.md` or `workspaces/company-private/briefs/brief.md`
2. Fill in the company name, sector, and what you want to know
3. Run `/analyze company-public` (or `company-private`)

**For academic work:**
Just type the command — e.g., `/study Porter's Five Forces` or `/explain WACC`

**To check what's been done:**
`/ws` — shows the status of all workspaces

---

## Useful at Any Time

| Command | Purpose |
|---------|---------|
| `/ws` | Check project status |
| `/journal` | Log a key decision or insight |
| `/wrapup` | Save your progress before ending a session |
| `/explain <anything>` | Get a quick explanation of any concept |

---

## Tips

- **Run `/wrapup` before you close a session.** This saves context so the next session picks up exactly where you left off.
- **Ask in plain language.** You don't need to use commands for everything — just type what you need.
- **"I don't understand" is always valid.** Ask for a re-explanation in simpler terms at any point.
