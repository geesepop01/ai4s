---
name: market-research-reports
description: Produce comprehensive market research and industry analysis reports with structured methodology, sourced data, and consulting-grade presentation. Use for technology landscapes, industry analyses, or strategic research reports.
category: research
tags: [market-research, industry, landscape, reports, strategy]
disable-model-invocation: true
---

# Market Research Reports

A market research report is judged on the same standard as any research output:
every number sourced, every estimate labeled as an estimate, and the method
reproducible. The presentation is polished; the epistemics are strict.

## The report structure

```markdown
# <Market / Technology> — Analysis

## Executive summary (1 page)
The three findings, each with its number and its confidence level.

## Scope and method
- What is in and out of scope (geography, segment, time range)
- Data sources and their dates
- Estimation method where primary data does not exist
- Known limitations of the estimate

## Market definition and segmentation
## Current state: size, growth, drivers, barriers
## Competitive landscape (players, share where known, positioning)
## Technology / trend analysis
## Scenarios and projections (with the assumptions stated)
## Risks and uncertainties
## Conclusions and implications
## Sources (every figure traceable)
```

## Evidence standards

| Claim type | Standard |
|---|---|
| Market size | Primary source (industry body, filings, official statistics) or an explicitly described triangulation |
| Growth rate | Stated with its base year and CAGR window; never a bare "growing fast" |
| Company revenue/share | Filings or company reports, with the fiscal period |
| Trend | Evidence from at least two independent signals |
| Projection | The model and its assumptions stated; sensitivity shown |

**Every number carries a source and a date.** A number without a source is an
estimate; label it as one and show the derivation.

## Estimating when data does not exist

Bottom-up beats top-down when the segments are countable:

```
segment_size = number_of_units × adoption_rate × price_per_unit
```

- State each factor's source and its uncertainty.
- Triangulate: bottom-up, top-down, and a third method (survey, analog market).
  Report the range across methods, not a false-precision point estimate.
- Sensitivity: which assumption moves the number most.

## Consulting-grade presentation

- Charts carry the finding in the title ("China's share doubles to 34% by 2028"),
  not the topic ("Market share by region").
- Consistent color coding across the report (same company = same color).
- Tables for comparison; charts for trend; text for implication.
- Executive summary is the whole argument in one page: the numbers a decision
  needs.

## What must never happen

- Presenting a vendor's marketing figure as an independent estimate.
- A projection with no stated assumptions.
- A CAGR without its base and window.
- Mixing nominal and real, or different currency years, in one chart.
- A "leading players" table with no metric defining "leading."

## Before delivery

- [ ] Every number is sourced or explicitly labeled as an estimate with its method.
- [ ] Sources page lists every figure's origin with a retrieval date.
- [ ] Assumptions and sensitivity are stated for every projection.
- [ ] Scope limits are stated in the executive summary, not buried.
- [ ] Charts carry findings in their titles; colors are consistent.
- [ ] The three findings a decision needs are on page one.
