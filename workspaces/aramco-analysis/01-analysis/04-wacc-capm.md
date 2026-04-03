# 04 - WACC and CAPM Analysis

**Date:** 2026-04-03
**Subject:** Saudi Aramco (2222.SR)
**Framework:** Weighted Average Cost of Capital via Capital Asset Pricing Model

---

## A. Cost of Equity (CAPM)

### Formula

```
Ke = Rf + Beta x (Rm - Rf) + Country Risk Premium

Where:
  Ke  = Cost of equity
  Rf  = Risk-free rate
  Beta = Levered beta of the equity
  Rm - Rf = Equity risk premium (market)
  CRP = Country risk premium for Saudi Arabia
```

### Input Parameters

| Parameter | Value | Source / Rationale |
|-----------|-------|-------------------|
| **Risk-Free Rate (Rf)** | 4.25% | US 10-Year Treasury yield (March 2026). Used as global benchmark. Saudi 10Y government bond yields ~4.5%, but USD-denominated benchmarks are standard for cross-border comparisons. |
| **Equity Risk Premium (ERP)** | 5.50% | Damodaran global ERP estimate for mature markets (Jan 2026 update). Represents the premium investors demand for holding equities over risk-free assets. |
| **Saudi Country Risk Premium (CRP)** | 0.75% | Based on Saudi Arabia's sovereign credit rating (Fitch A+ / Moody's A1). CRP for A-rated sovereigns typically ranges 0.5-1.0%. Saudi Arabia benefits from low external debt and massive reserves but faces concentration risk in hydrocarbons. |
| **Levered Beta** | 0.50 | Observed beta from Tadawul trading data (2-year weekly returns vs Tadawul All Share Index). Note: This beta is artificially low due to (a) low free float dampening price discovery, (b) SAR/USD peg removing currency volatility, (c) government ownership providing implicit stability. |
| **Adjusted Beta** | 0.85 | Adjusted for structural factors. Using unlevered betas of comparable IOCs (~0.75 average) and re-levering for Aramco's capital structure, plus a modest adjustment for emerging market and governance risk. This better reflects true systematic risk. |

### CAPM Calculation (Base Case - Adjusted Beta)

```
Ke = 4.25% + 0.85 x 5.50% + 0.75%
   = 4.25% + 4.675% + 0.75%
   = 9.675%
   ~ 9.7%
```

### CAPM Sensitivity to Beta

| Beta | Cost of Equity |
|------|---------------|
| 0.50 (observed) | 7.75% |
| 0.70 | 8.85% |
| **0.85 (adjusted, base case)** | **9.68%** |
| 1.00 | 10.50% |
| 1.20 | 11.60% |

### Discussion - Beta Selection

The choice of beta is the most contentious input in Aramco's CAPM. The observed beta of 0.50 is unreliable for three reasons:

1. **Free float is ~1.7%** -- price movements reflect retail/local institutional flows, not global capital market risk pricing.
2. **SAR is pegged to USD** -- eliminates FX volatility that would be present for a "normal" EM stock.
3. **Government ownership creates an implicit put** -- the Saudi government will not allow Aramco to face financial distress, which dampens perceived downside risk.

Using the adjusted beta of 0.85 better captures the business risk of a company whose earnings are 80%+ driven by oil prices. Oil price beta to the global equity market is empirically 0.6-1.0, and Aramco's operating leverage amplifies this.

---

## B. Cost of Debt (Post-Tax)

### Input Parameters

| Parameter | Value | Source / Rationale |
|-----------|-------|-------------------|
| **Pre-Tax Cost of Debt** | 4.80% | Weighted average yield on Aramco's outstanding bonds (mix of 5Y, 10Y, 30Y USD-denominated sukuk and conventional bonds). Aramco's bonds trade at tight spreads to Saudi sovereign (~30-50bps). |
| **Marginal Tax Rate** | 50% | Aramco's statutory income tax rate under Saudi tax law for hydrocarbon companies. Includes income tax + royalties. |
| **Post-Tax Cost of Debt** | 2.40% | = 4.80% x (1 - 0.50) |

### Discussion - Tax Rate

Aramco's 50% tax rate creates a significant debt tax shield, making the after-tax cost of debt very low (2.4%). However, this tax rate is set by the Saudi government and could change. Historically, Aramco's tax/royalty structure has been adjusted multiple times (most recently in 2020 when royalties were reduced to support profitability during the oil price collapse).

---

## C. Capital Structure

| Component | Book Value ($B) | Market Value ($B) | Weight |
|-----------|----------------|-------------------|--------|
| **Equity** | 270.0 | 1,720.0 | 94.0% |
| **Debt** | 110.0 | 108.0 | 5.9% |
| **Minority Interest** | 2.0 | 2.0 | 0.1% |
| **Total Capital** | 382.0 | 1,830.0 | 100.0% |

**Notes:**
- Market value of equity uses current market cap (~$1,720B). However, given the 98%+ government ownership, the "true" market value is debatable. The government's shares are not really tradeable at market price.
- Book value weights would give: Equity 71%, Debt 29% -- a very different picture that would significantly lower WACC.
- We use market weights as per standard practice, but flag the market cap illiquidity concern.

### Target Capital Structure (Forward-Looking)

Given Aramco's rising debt trajectory, a forward-looking capital structure may be more appropriate:

| Component | Weight (Current) | Weight (Target) |
|-----------|-----------------|-----------------|
| Equity | 94.0% | 90.0% |
| Debt | 6.0% | 10.0% |

---

## D. WACC Calculation

### Formula

```
WACC = We x Ke + Wd x Kd x (1 - T)

Where:
  We = Weight of equity
  Ke = Cost of equity
  Wd = Weight of debt
  Kd = Cost of debt (pre-tax)
  T  = Tax rate
```

### Base Case (Market Weights)

```
WACC = 0.94 x 9.68% + 0.06 x 4.80% x (1 - 0.50)
     = 9.10% + 0.14%
     = 9.24%
     ~ 9.2%
```

### Alternative Scenarios

| Scenario | Equity Weight | Ke | Debt Weight | Kd(1-T) | WACC |
|----------|-------------|-----|-------------|---------|------|
| **Base Case (Market Weights)** | 94% | 9.68% | 6% | 2.40% | **9.24%** |
| Conservative (Higher Beta) | 94% | 10.50% | 6% | 2.40% | 10.02% |
| Optimistic (Observed Beta) | 94% | 7.75% | 6% | 2.40% | 7.43% |
| Target Capital Structure | 90% | 9.68% | 10% | 2.40% | 8.95% |
| Book-Value Weights | 71% | 9.68% | 29% | 2.40% | 7.57% |

### WACC Range Summary

```
Optimistic:   7.4% (observed beta, market weights)
Base Case:    9.2% (adjusted beta, market weights)
Conservative: 10.0% (higher beta, market weights)
```

---

## E. ROIC vs WACC Spread

| Metric | Value |
|--------|-------|
| **ROIC (FY2025)** | 22.0% |
| **WACC (Base Case)** | 9.2% |
| **Spread (ROIC - WACC)** | +12.8% |
| **EVA = Spread x Invested Capital** | +$44B |

### ROIC vs WACC: Aramco vs Peers

| Company | ROIC | WACC (est.) | Spread |
|---------|------|-------------|--------|
| **Aramco** | **22.0%** | **9.2%** | **+12.8%** |
| XOM | 14.5% | 9.5% | +5.0% |
| CVX | 13.0% | 9.8% | +3.2% |
| TTE | 11.0% | 9.0% | +2.0% |
| SHEL | 10.5% | 9.0% | +1.5% |
| BP | 7.5% | 10.0% | -2.5% |

### Interpretation

1. **Aramco's ROIC-WACC spread of +12.8% is exceptional.** This means the company earns 12.8 percentage points above its cost of capital on invested capital -- the strongest value creation metric in the global energy sector.

2. **The spread has been narrowing** as ROIC declined (from ~30% in 2022 to ~22% in 2025) due to lower oil prices. At $60/bbl Brent, ROIC would compress to ~15%, still above WACC but with a much thinner margin.

3. **BP is the only peer destroying value** (negative spread). This reflects BP's low returns and higher cost of capital due to strategic uncertainty and credit risk.

4. **Economic Value Added (EVA) of ~$44B** means Aramco created $44 billion in value above its capital costs in FY2025. This is the largest EVA of any company in the global energy sector.

---

## F. WACC Sensitivity to Oil Prices

Since Aramco's ROIC is directly tied to oil prices, the ROIC-WACC spread varies dramatically:

| Brent Price ($/bbl) | Est. ROIC | WACC | Spread | Value Creation? |
|---------------------|-----------|------|--------|----------------|
| $90 | 30.0% | 9.2% | +20.8% | Strong |
| $80 | 25.0% | 9.2% | +15.8% | Strong |
| **$73 (Current)** | **22.0%** | **9.2%** | **+12.8%** | **Strong** |
| $65 | 17.0% | 9.2% | +7.8% | Moderate |
| $55 | 12.0% | 9.2% | +2.8% | Marginal |
| $45 | 7.0% | 9.2% | -2.2% | Value Destruction |

**Break-even oil price for value creation (ROIC = WACC):** approximately **$48-50/bbl Brent**.

This is Aramco's structural advantage: even at very low oil prices, the company's low-cost reserves generate returns above the cost of capital. No other major IOC can achieve this below $55/bbl.

---

## G. Methodological Notes and Limitations

1. **Beta estimation is the weakest link.** The observed beta is unreliable; the adjusted beta is subjective. A +/- 0.2 change in beta shifts cost of equity by ~110bps and WACC by ~100bps.

2. **Market-value weights may overstate equity share** given the 98% government stake. If the government's shares were valued at a discount to market (illiquidity, control premium inversion), the debt weight would be higher and WACC lower.

3. **The country risk premium is modest** at 0.75%. This assumes Saudi Arabia's institutional risk is limited. If the Kingdom's fiscal position deteriorates (oil price collapse, Vision 2030 cost overruns), the CRP could widen to 1.5-2.0%.

4. **Tax rate stability is assumed.** The Saudi government has changed Aramco's fiscal terms multiple times. A tax increase would lower ROIC without changing WACC, compressing the spread.
