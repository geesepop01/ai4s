---
name: data-commons
description: Access and integrate structured data from Data Commons and similar public data aggregators — statistics, demographics, and indicators across geographies and time. Use for integrating public statistics into an analysis.
category: data-engineering
tags: [data-commons, statistics, demographics, public-data, integration]
disable-model-invocation: true
---

# Data Commons

Data Commons aggregates public statistical data across geographies and time.
Its value is standardized entities and variables; its risk is silently mixing
definitions across sources.

## The API

```python
from datacommons_pandas import Client
dc = Client(api_key="...")

# Statistical variables available for a place
dc.get_statistical_variable("geoId/06", ["Count_Person"])

# Time series
df = dc.get_stat_series(["Count_Person"], ["geoId/06", "geoId/36"], unit="Count")
```

```bash
# REST
curl "https://api.datacommons.org/stat/series?place=geoId/06&stat_var=Count_Person&key=..."
```

## Entity resolution

- Places use **DCIDs** (`geoId/06` for California, `country/USA`). Resolve names
  to DCIDs explicitly; do not assume the name maps to the geography you mean.
- **Containment** (`containedInPlace`) is how you aggregate; state whether you
  are summing children or taking a value at the parent level — these differ.

## Definitional consistency (the main trap)

The same variable name can mean different things across source datasets and
across years:

- **Population base** (residential, household, voting-age) changes the number.
- **Geography boundary changes** (redistricting) break time series.
- **Survey vs administrative** sources have different error structures.
- **Currency and price base** for economic variables (nominal vs real).

**Record the source dataset and its definition with every value**, and check
comparability before joining across years or sources. State the definitional
change if one occurred in the time range.

## Aggregation

- Summing counts across children is valid; averaging rates is not (rates need
  population-weighted aggregation).
- **Denominators matter.** A rate computed against the wrong base is wrong even
  when both numbers are right.
- Suppress or flag small cells; many public datasets already do.

## Reproducibility

- Record the API query, the source dataset ID, and the retrieval date. Data
  Commons data is revised; a value retrieved a year ago may not match today.
- Cache the raw response to disk before deriving anything.
- Store the DCIDs used, not just the display names.

## Reporting

State: the source datasets behind each variable, the variable definition and its
unit, the geography and its boundary definition, the time range and any
definitional changes, the aggregation method, the retrieval date, and the
comparability limits across sources.

## Anti-patterns

- Joining across years without checking boundary and definition changes.
- Averaging rates instead of population-weighting.
- Assuming a variable name means the same thing in two source datasets.
- Reporting a value without its source dataset or its base.
