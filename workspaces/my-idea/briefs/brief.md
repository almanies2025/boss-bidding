# Brief — PE LBO Modeling Tool

## What

**Valora** — an AI-accelerated LBO modeling tool purpose-built for private equity deal teams. The user inputs a target company (name or ticker) and a set of investment thesis parameters (entry multiple range, leverage appetite, hold period, exit multiple assumption). Valora then:

1. Pulls comparable transaction data and builds a peer-set from live market intelligence
2. Generates a complete, annotated 10-year LBO model with an integrated debt sweep schedule
3. Runs Monte Carlo sensitivity analysis across all key inputs (1000+ scenarios) and returns the probability distribution of MOIC/IRR
4. Explains its assumptions in plain English — flagging where the target's metrics fall outside industry norms
5. Produces a one-page investment summary suitable for IC presentation

Valora is not a better Excel. It is a **deal intelligence layer** that compresses the 2–3 day pre-model screening into 60 seconds, so analysts spend time on edge cases and judgment calls, not data entry.

## Why

PE firms face two compounding problems:

**Problem 1 — Time sink at the wrong stage.** Analysts spend 2–3 days building an LBO model before they know if the deal is worth a conversation. Most targets are screened out. The model work is necessary but low-value.

**Problem 2 — Scenario analysis is an afterthought.** Most LBO models run 3–5 manual sensitivity cases. PE is a tail-risk business — the edge cases are the whole business. Manual sensitivity analysis misses interactions between inputs.

Valora solves both by front-loading the model generation and making sensitivity analysis a first-class output, not a footer tab.

**Market context:** The mid-market PE ecosystem (sub-$1B EV) has not seen meaningful software tooling innovation in the core modeling workflow. Bloomberg and FactSet serve large-cap. Excel remains the dominant tool for deal modeling. A cloud-native, AI-assisted tool designed for the way mid-market PE actually works has a real shot at adoption.

**For the course project specifically:** Valora demonstrates COC's value proposition in a concrete, high-stakes domain. The product's decision-making capability — financial model generation, market data synthesis, probabilistic risk assessment — is directly powered by the COC agent architecture. The PE firm's evaluation criteria map cleanly to the course rubric: market and problem (25%) is the Why above; product and demo (30%) is the live Valora demo; business model (20%) is the SaaS pricing thesis; AI/ML depth (10%) is the Monte Carlo + deal archetype classification layer.

## Success Criteria

**Demonstrated live (required):**
- [ ] Input a target company and thesis parameters → full LBO model generated in < 90 seconds
- [ ] Monte Carlo output showing IRR/MOIC distribution across 1000+ scenarios rendered as a chart
- [ ] Plain-English assumption summary (minimum 5 key drivers called out)
- [ ] One-page investment summary exportable as PDF

**Commercial validation (target):**
- [ ] 3 PE professionals from target market (mid-market, sub-$1B EV) review the demo and rate purchase intent on a 1–5 scale; average ≥ 3.5
- [ ] At least one reviewer identifies a specific deal they would have used it on

**Technical (COC depth):**
- [ ] Minimum 3 distinct agent types working in coordinated pipeline (market intelligence agent, financial modeling agent, risk analysis agent)
- [ ] COC decision log captures at least 10 significant design decisions with rationale
- [ ] ML technique family: probabilistic modeling (Monte Carlo) + deal archetype classification — distinct from a standard regression or classification individual assignment

**Business model:**
- [ ] Pricing model articulated: SaaS seat license ($50K–$100K/year) vs. per-model transaction fee
- [ ] Target customer defined: mid-market PE funds ($100M–$1B AUM), 2–15 deal professionals
- [ ] Unit economics sketch: CAC, LTV, payback period

## COC Configuration Summary

**Architectural choice:** Pipeline orchestration (sequential with feedback loops) rather than concurrent debate. Financial model generation is inherently sequential — you need comparable data before you can build the model — but the risk analysis and assumption-explanation agents operate concurrently once the base model exists.

**Agents:**
1. **Market Intelligence Agent** — loaded with deal comp databases, industry sector knowledge, and web search for recent transactions. Outputs: peer set, median/quartile multiples, sector-specific operating benchmarks.
2. **Financial Modeling Agent** — loaded with LBO mechanics (debt sweep, equity waterfall, management rollover, preferred return). Inputs: market intelligence output + user thesis parameters. Outputs: annotated Excel-equivalent model in Python (openpyxl or similar), plus structured JSON of all assumptions.
3. **Risk Analysis Agent** — takes the Financial Modeling Agent's output. Runs Monte Carlo simulation across all input distributions. Outputs: probability distributions for IRR, MOIC, and exit year; identifies the top 5 risk drivers by variance contribution.
4. **Narrative Agent** — takes the Financial Modeling Agent's structured JSON and Risk Analysis output. Generates plain-English investment summary with specific callouts: "Company's EBITDA margin of 18% is below the peer median of 24% — this drives a 200bps lower exit IRR in our base case."

**Knowledge:**
- Training set of 200+ annotated LBO models from 2015–2024 (sourced from PitchBook/Dealogic academic access)
- Sector-specific operating benchmarks by GICS sector and size decile
- Deal archetype taxonomy: "growth buyout", "turnaround", "platform + bolt-on", "roll-up"

## Competitive Landscape

| Competitor | Approach | Weakness |
|---|---|---|
| Excel + Bloomberg | Manual | Slow, no sensitivity automation |
| Model for Excel (commercial plugins) | Excel add-ins | Still requires manual setup; no AI |
| Causal | General-purpose modeling | Not purpose-built for LBO mechanics |
| Advent Results | High-level screening | No full model generation |
| Potentially Carta/Workiva | Compliance-adjacent | Not deal-model focused |

Valora's defensibility: the PE-specific agent knowledge (deal archetype logic, sector benchmarks) is costly to replicate. The COC architecture makes it straightforward to extend to new sectors or deal types — network effects over time.

## Risks and Mitigations

**Risk:** PE analysts trust Excel and distrust "black box" AI outputs.
**Mitigation:** Valora annotates every assumption and shows its work. The tool is an accelerant, not an oracle — the analyst still owns the model. Auditability is a first-class feature.

**Risk:** Mid-market PE firms are slow to adopt new tools.
**Mitigation:** Start with the screening use case (60-second initial model) which requires zero workflow change. Full integration comes later.

**Risk:** Deal data access is expensive and restricted.
**Mitigation:** Use public sources (SEC filings, press releases, Crunchbase) for the course demo. Production-grade deal data is a later-stage concern.

## For Discussion

1. **Buy vs. build the training data** — 200 annotated models is a significant data engineering effort. Consider whether a smaller curated set (20–30 models) with stronger agent prompting can achieve 80% of the accuracy at 20% of the effort.
2. **Single-player vs. multiplayer demo** — For 10-minute PE pitch, a live single-company run is more dramatic than a panel comparison. But for the course demo, showing 3 companies in sequence (one clear pass, one borderline, one clear fail) tells a better story about discrimination power.
3. **Monetization timeline** — PE firms buy software in Q4 during annual budget cycles. A course project demo in Week 8 aligns poorly with procurement timing. Consider a "first 3 months free" offer as the conversion mechanism.
