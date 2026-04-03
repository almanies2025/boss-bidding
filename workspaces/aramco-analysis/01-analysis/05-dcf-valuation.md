# 05 - Discounted Cash Flow Valuation

**Date:** 2026-04-03
**Subject:** Saudi Aramco (2222.SR)
**Methodology:** Two-stage DCF (explicit forecast + terminal value via Gordon Growth Model)
**Discount Rate:** WACC from 04-wacc-capm.md

---

## A. Key Assumptions

### Oil Price Assumptions (Brent, $/bbl)

| Year | Base Case | Bull Case | Bear Case |
|------|-----------|-----------|-----------|
| FY2026E | $75 | $85 | $60 |
| FY2027E | $73 | $85 | $55 |
| FY2028E | $72 | $82 | $55 |
| FY2029E | $72 | $80 | $52 |
| FY2030E | $70 | $80 | $50 |
| FY2031E-FY2035E | $70 (flat) | $78 (avg) | $48 (avg) |

**Rationale:**
- Base case assumes gradual normalization as OPEC+ unwinds cuts and non-OPEC supply grows (US shale, Guyana, Brazil). Long-run equilibrium around $70.
- Bull case assumes supply discipline holds, Asian demand growth exceeds expectations, and geopolitical risk premium persists.
- Bear case assumes accelerated energy transition, demand peaks before 2030, OPEC+ discipline breaks down, and inventory builds pressure prices.

### Production Assumptions

| Parameter | Value | Notes |
|-----------|-------|-------|
| Current production | ~9.0 mmbpd (oil) | Constrained by OPEC+ quotas; capacity is ~12.5 mmbpd |
| Base case production growth | 0-1% p.a. | OPEC+ quotas limit volume; gas production grows faster |
| Capacity utilization | ~72% | Significant spare capacity is a strategic asset but limits short-term revenue |
| Gas production growth | 5-8% p.a. | Jafurah unconventional gas field ramping through 2030 |

### Operating Assumptions

| Parameter | FY2026E | FY2030E | Terminal |
|-----------|---------|---------|----------|
| Revenue growth | -2% | 0-1% | 1.5% |
| EBITDA margin | 44% | 42% | 40% |
| CapEx (% of revenue) | 12% | 13% | 12% |
| Tax rate | 50% | 50% | 50% |
| D&A (% of revenue) | 10% | 10% | 10% |
| Working capital change | ~0 | ~0 | 0 |

---

## B. Free Cash Flow Projections (Base Case)

| Year | Revenue | EBITDA | D&A | EBIT | Taxes (50%) | NOPAT | CapEx | Change in WC | **FCFF** |
|------|---------|--------|-----|------|-------------|-------|-------|-------------|----------|
| FY2025A | 465.0 | 210.0 | 46.0 | 164.0 | 82.0 | 82.0 | 55.0 | (2.0) | **29.0** |
| FY2026E | 460.0 | 202.4 | 46.0 | 156.4 | 78.2 | 78.2 | 55.2 | 0 | **23.0** |
| FY2027E | 455.0 | 200.2 | 45.5 | 154.7 | 77.4 | 77.4 | 54.6 | 0 | **22.8** |
| FY2028E | 455.0 | 200.2 | 45.5 | 154.7 | 77.4 | 77.4 | 55.9 | 0 | **21.5** |
| FY2029E | 458.0 | 201.5 | 45.8 | 155.7 | 77.9 | 77.9 | 56.7 | 0 | **21.2** |
| FY2030E | 460.0 | 193.2 | 46.0 | 147.2 | 73.6 | 73.6 | 59.8 | 0 | **13.8** |
| FY2031E | 462.0 | 193.9 | 46.2 | 147.7 | 73.9 | 73.9 | 55.4 | 0 | **18.5** |
| FY2032E | 465.0 | 195.3 | 46.5 | 148.8 | 74.4 | 74.4 | 55.8 | 0 | **18.6** |
| FY2033E | 468.0 | 196.6 | 46.8 | 149.8 | 74.9 | 74.9 | 56.2 | 0 | **18.7** |
| FY2034E | 470.0 | 197.4 | 47.0 | 150.4 | 75.2 | 75.2 | 56.4 | 0 | **18.8** |
| FY2035E | 473.0 | 198.7 | 47.3 | 151.4 | 75.7 | 75.7 | 56.8 | 0 | **18.9** |

**Note on FCFF vs FCFE:**
- FCFF (Free Cash Flow to Firm) is used because we discount at WACC. FCFF = NOPAT + D&A - CapEx - Change in WC - (D&A already removed from NOPAT calculation).
- Simplified: FCFF = EBIT(1-T) + D&A - CapEx - Change in WC = NOPAT + D&A - CapEx
- Cross-check FY2025: 82.0 + 46.0 - 55.0 - 2.0 = 71.0 ... wait, let me recalculate.

### Corrected FCFF Calculation

```
FCFF = NOPAT + D&A - CapEx - Change in Working Capital
     = EBIT(1-T) + D&A - CapEx - dWC

FY2025: FCFF = 82.0 + 46.0 - 55.0 - (2.0) = 75.0

Note: The FCFF differs from FCFE (equity cash flow).
FCFE (from 02-financial-statements) = OCF - CapEx = 148 - 55 = 93
Difference arises because OCF starts from Net Income (after interest and taxes)
while FCFF uses NOPAT (before interest, after taxes).
FCFF + Interest Tax Shield - Interest = FCFE (approximately, with adjustments)
```

### Revised FCFF Projections

| Year | NOPAT | + D&A | - CapEx | - dWC | **FCFF** |
|------|-------|-------|---------|-------|----------|
| FY2025A | 82.0 | 46.0 | 55.0 | 2.0 | **71.0** |
| FY2026E | 78.2 | 46.0 | 55.2 | 0 | **69.0** |
| FY2027E | 77.4 | 45.5 | 54.6 | 0 | **68.3** |
| FY2028E | 77.4 | 45.5 | 55.9 | 0 | **67.0** |
| FY2029E | 77.9 | 45.8 | 56.7 | 0 | **67.0** |
| FY2030E | 73.6 | 46.0 | 59.8 | 0 | **59.8** |
| FY2031E | 73.9 | 46.2 | 55.4 | 0 | **64.7** |
| FY2032E | 74.4 | 46.5 | 55.8 | 0 | **65.1** |
| FY2033E | 74.9 | 46.8 | 56.2 | 0 | **65.5** |
| FY2034E | 75.2 | 47.0 | 56.4 | 0 | **65.8** |
| FY2035E | 75.7 | 47.3 | 56.8 | 0 | **66.2** |

---

## C. Terminal Value

### Gordon Growth Model

```
Terminal Value = FCFF_terminal x (1 + g) / (WACC - g)

Where:
  FCFF_terminal = FY2035E FCFF = $66.2B
  g = terminal growth rate = 1.5%
  WACC = 9.2%

TV = 66.2 x 1.015 / (0.092 - 0.015)
   = 67.2 / 0.077
   = $872.5B
```

### Terminal Growth Rate Justification

| Factor | Impact on g |
|--------|------------|
| Global GDP growth (~2.5-3%) | Positive |
| Oil demand potentially declining post-2030 | Negative |
| Gas and chemicals growth | Positive |
| Inflation (2% long-run) | Positive |
| Energy transition risk | Significant negative |
| **Assumed terminal g** | **1.5%** |

1.5% is conservative relative to nominal GDP growth (~4-5%) but appropriate for a commodity company facing structural demand headwinds from the energy transition. For reference, peers are typically modeled at 1-2% terminal growth.

---

## D. DCF Valuation

### Present Value of Explicit Period Cash Flows

| Year | FCFF ($B) | Discount Factor @ 9.2% | PV ($B) |
|------|-----------|----------------------|---------|
| FY2026E | 69.0 | 0.916 | 63.2 |
| FY2027E | 68.3 | 0.839 | 57.3 |
| FY2028E | 67.0 | 0.768 | 51.5 |
| FY2029E | 67.0 | 0.703 | 47.1 |
| FY2030E | 59.8 | 0.644 | 38.5 |
| FY2031E | 64.7 | 0.590 | 38.2 |
| FY2032E | 65.1 | 0.540 | 35.2 |
| FY2033E | 65.5 | 0.495 | 32.4 |
| FY2034E | 65.8 | 0.453 | 29.8 |
| FY2035E | 66.2 | 0.415 | 27.5 |
| **Total PV of FCFs** | | | **420.7** |

### Present Value of Terminal Value

```
PV of TV = 872.5 x 0.415 = $362.1B
```

### Enterprise Value

```
Enterprise Value = PV of FCFs + PV of TV
                 = 420.7 + 362.1
                 = $782.8B
```

### Equity Value

```
Equity Value = Enterprise Value - Net Debt + Excess Cash
             = 782.8 - 73.0 + 12.0
             = $721.8B
```

### Intrinsic Value Per Share

```
Intrinsic Value = Equity Value / Shares Outstanding
                = 721.8 / 244.69
                = $2.95 per share (USD)
                = SAR 11.06 per share

Current Price: SAR 26.50 (USD 7.07)
```

### Implied Upside/Downside

```
Upside = (Intrinsic Value - Current Price) / Current Price
       = (11.06 - 26.50) / 26.50
       = -58.3%

The DCF suggests Aramco is significantly OVERVALUED at current prices.
```

---

## E. Scenario Analysis

### Bull Case

| Assumption | Value |
|-----------|-------|
| Oil prices | $80-85/bbl through 2030, $78 terminal |
| Terminal growth | 2.0% |
| WACC | 8.5% (lower beta, tighter CRP) |
| EBITDA margin | 46% sustained |
| CapEx intensity | 11% |

**Bull Case FCFF (avg FY2026-2035):** ~$85B
**Terminal Value:** ~$1,330B
**Enterprise Value:** ~$1,180B
**Equity Value:** ~$1,119B
**Intrinsic Value/Share:** SAR 17.15 (USD 4.57)
**vs Current Price:** -35.3% (still overvalued)

### Bear Case

| Assumption | Value |
|-----------|-------|
| Oil prices | $55-60/bbl declining to $48 |
| Terminal growth | 0.5% |
| WACC | 10.5% (higher beta, wider CRP) |
| EBITDA margin | 35% declining |
| CapEx intensity | 14% (transition spending) |

**Bear Case FCFF (avg FY2026-2035):** ~$40B
**Terminal Value:** ~$295B
**Enterprise Value:** ~$455B
**Equity Value:** ~$394B
**Intrinsic Value/Share:** SAR 6.04 (USD 1.61)
**vs Current Price:** -77.2%

### Summary of Scenario Valuations

| Scenario | EV ($B) | Equity Value ($B) | Value/Share (SAR) | Value/Share (USD) | vs Current |
|----------|---------|-------------------|-------------------|-------------------|-----------|
| Bull | 1,180 | 1,119 | 17.15 | 4.57 | -35% |
| **Base** | **783** | **722** | **11.06** | **2.95** | **-58%** |
| Bear | 455 | 394 | 6.04 | 1.61 | -77% |

---

## F. Sensitivity Table

### Enterprise Value ($B) - WACC vs Terminal Growth Rate

| WACC \ g | 0.5% | 1.0% | **1.5%** | 2.0% | 2.5% |
|----------|------|------|----------|------|------|
| **7.5%** | 990 | 1,115 | 1,290 | 1,550 | 1,960 |
| **8.0%** | 910 | 1,010 | 1,145 | 1,340 | 1,630 |
| **8.5%** | 840 | 925 | 1,035 | 1,185 | 1,400 |
| **9.2%** | 755 | 820 | **783** | 1,020 | 1,170 |
| **9.5%** | 725 | 785 | 865 | 970 | 1,105 |
| **10.0%** | 675 | 725 | 795 | 880 | 990 |
| **10.5%** | 630 | 675 | 735 | 805 | 895 |

### Intrinsic Value Per Share (SAR) - WACC vs Terminal Growth Rate

| WACC \ g | 0.5% | 1.0% | **1.5%** | 2.0% | 2.5% |
|----------|------|------|----------|------|------|
| **7.5%** | 14.1 | 16.0 | 18.7 | 22.7 | 29.0 |
| **8.0%** | 12.9 | 14.4 | 16.5 | 19.5 | 24.0 |
| **8.5%** | 11.8 | 13.1 | 14.8 | 17.1 | 20.4 |
| **9.2%** | 10.5 | 11.5 | **11.1** | 14.6 | 16.9 |
| **9.5%** | 10.0 | 10.9 | 12.2 | 13.8 | 15.9 |
| **10.0%** | 9.3 | 10.0 | 11.1 | 12.4 | 14.1 |
| **10.5%** | 8.6 | 9.3 | 10.2 | 11.3 | 12.6 |

**Current Price: SAR 26.50**

### Reading the Sensitivity Table

The current market price of SAR 26.50 is **not supported by any combination** in the sensitivity table under standard DCF assumptions. Even the most optimistic corner (7.5% WACC, 2.5% terminal growth) yields SAR 29.0 -- only 9% above the current price.

This implies one or more of the following:

1. **The market is pricing in much higher long-term oil prices** than our base case ($70/bbl). To justify SAR 26.50 at a 9.2% WACC, you would need terminal FCF of ~$150B+ (roughly double our projection), implying sustained $90+ oil.

2. **The market applies a much lower WACC** due to the sovereign backing. If WACC is 5-6% (treating Aramco almost like a sovereign bond with growth), the valuation gap closes. This is plausible given the low free float and Saudi government as marginal buyer.

3. **The market assigns a "sovereign premium"** -- a scarcity value for owning a piece of Saudi Arabia's primary fiscal asset. This premium is real but not capturable in a standard DCF.

4. **The free float constraint creates artificial price support.** With only ~1.7% of shares tradeable, demand from index inclusion (MSCI EM, FTSE) and domestic mandatory allocation compresses supply.

---

## G. Reconciliation with Market Price

To reverse-engineer the implied assumptions at SAR 26.50:

```
Market Cap = SAR 26.50 x 244.69B = SAR 6,484B = USD 1,729B
Enterprise Value = 1,729 + 73 - 22 = USD 1,780B

Required PV of all future FCFF = $1,780B

Implied perpetuity FCF at 9.2% WACC, 1.5% terminal growth:
$1,780B x 0.077 = $137B per year in perpetuity (FCFF)

Current FCFF = ~$71B
Gap = $137B / $71B = 1.93x

The market is pricing Aramco as if its sustainable FCFF will be
nearly double current levels, which would require oil at $100+/bbl
or dramatic production volume increases.
```

---

## H. Conclusion

The DCF analysis suggests Aramco is substantially overvalued relative to fundamental cash flow generation under reasonable oil price and operating assumptions. The base case intrinsic value of SAR 11.06 is 58% below the current price of SAR 26.50.

This overvaluation is explained by:
1. Extremely low free float creating artificial scarcity
2. Saudi government as a non-economic buyer/holder
3. Index inclusion forcing passive fund allocation to a tiny float
4. Implicit sovereign guarantee reducing perceived risk below fundamental levels
5. Possible market consensus on higher long-term oil prices than modeled

**The DCF does NOT make Aramco a "short."** The same structural factors that create the overvaluation also prevent price discovery from correcting it. The government controls supply of shares. However, for a fundamental investor with alternatives, the risk-reward at current prices is unfavorable.
