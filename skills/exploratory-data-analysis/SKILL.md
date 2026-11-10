---
name: exploratory-data-analysis
description: Systematically explore a dataset before modeling — structure, quality, distributions, relationships, and anomalies. Use at the start of any analysis to understand what the data actually is.
category: data-engineering
tags: [eda, exploration, profiling, data-quality, distributions]
---

# Exploratory Data Analysis

EDA is where you learn what the data actually is, as opposed to what the
documentation says it is. Skipping it is how a modeling pipeline becomes a
months-long debugging session.

## The pass

```python
import pandas as pd
import numpy as np

df = pd.read_csv("data.csv")
print(df.shape)
print(df.dtypes)
print(df.describe(include="all").T)
print(df.isna().mean().sort_values(ascending=False))
print(df.nunique())
```

Then, in order:

1. **Structure.** Rows, columns, dtypes, cardinality. Does the shape match the
   documented n?
2. **Identifiers.** Which columns are unique keys? Are they actually unique?
   (`df["id"].is_unique`) Duplicate keys are usually a merge bug.
3. **Missingness.** Per-column rate; missingness by group; whether missingness
   correlates with the outcome (informative missingness is a finding).
4. **Distributions.** Histograms, skewness, kurtosis. Decide transforms before
   modeling, not after.
5. **Outliers.** Identify them, but distinguish measurement error from real
   extreme values. Do not remove real extremes.
6. **Duplicates.** Exact and near-duplicate rows; duplicate subjects across
   splits.
7. **Types and encoding.** Strings that should be numbers; low-cardinality
   strings that should be categorical; dates read as strings.
8. **Relationships.** Correlations (with a method suited to the data), scatter
   plots for the pairs that matter, group comparisons.

## Group structure matters most

```python
print(df.groupby("site")["subject_id"].nunique())
print(df.groupby("label").size())
print(df.groupby("label")[feature].describe())
```

**Class imbalance, site composition, and per-group sample size** determine what
the analysis can support. A 95/5 class imbalance makes accuracy meaningless; a
confound between site and label makes everything uninterpretable.

## Time structure

- Is there a time component? Are train/test split in time?
- Are there batch effects aligned with time (instrument drift, protocol change)?
- Duplicates across time (same subject measured twice).

## Visualization

- Histograms and density for distributions.
- Box/violin by group.
- Scatter for the key pairs, colored by the label.
- Missingness heatmap.
- Correlation matrix with clustering.

## Data quality report

Write `eda.md` capturing:

```
- Shape and dtypes
- Keys and their uniqueness
- Missingness: columns > 10% missing; informative missingness found
- Duplicates: count and criterion
- Class balance
- Group/site composition
- Outliers: how many, and what they are
- Confounds identified
- Decisions made (drops, transforms, merges) with counts
```

This file is the basis for the data section of the report, and it is where
"n = 450 after excluding..." comes from.

## What EDA must find before modeling

- [ ] Target leakage candidates (columns that encode the outcome).
- [ ] Train/test overlap in subjects or duplicates.
- [ ] Class imbalance and the metric it implies.
- [ ] Site/batch confounded with the label.
- [ ] Distributions that require a transform.
- [ ] Missingness that is informative.
- [ ] The unit of analysis (what one row is) and the nesting.
