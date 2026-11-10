---
name: data-exploration
description: Exploratory data analysis. Use for profiling datasets, missingness, outliers, distribution checks, and the inspection step that must precede any modeling or statistical claim.
category: data
tags: [eda, data, profiling, missingness, outliers, pandas, quality]
---

# Data Exploration

## Overview

Inspecting data before analysing it is the highest-return habit in computational
research. Nearly every wrong result traces back to an unexamined assumption about
what a column contained.

**Rule — inspect before you model.** Never assume column names, dtypes, encodings,
units, or row semantics.

## Installation

```bash
pip install pandas numpy
# Optional, for large data or speed
pip install polars pyarrow
```

## The inspection pass

Run this before writing any analysis code.

```python
import pandas as pd
import numpy as np

df = pd.read_csv("data.csv")

# Shape and memory
print(df.shape, f"{df.memory_usage(deep=True).sum() / 1e6:.1f} MB")

# Columns, dtypes, and non-null counts together
print(df.info())

# First rows, verbatim — do not just read the header
print(df.head(10).to_string())

# Numeric summary
print(df.describe(include=[np.number]).T)

# Categorical summary — reveals cardinality problems
print(df.describe(include=["object", "category"]).T)

# Cardinality per column
for col in df.columns:
    print(f"{col:30s} nunique={df[col].nunique():>8}  dtype={df[col].dtype}")
```

**Read the raw head, not only the summary.** Summaries hide the case where a
numeric column is actually a string with thousands separators, or where `-999`
means missing.

## Missingness

Missingness has structure, and the structure matters more than the count.

```python
missing = df.isna().sum().sort_values(ascending=False)
missing = missing[missing > 0]
print((missing / len(df) * 100).round(2))

# Is missingness random, or does it cluster?
import matplotlib.pyplot as plt
plt.figure(figsize=(10, 4))
plt.imshow(df[missing.index].isna().T, aspect="auto", interpolation="nearest")
plt.yticks(range(len(missing)), missing.index)
plt.title("Missingness map")
plt.tight_layout()
plt.savefig("missingness_map.png", dpi=300)

# Does missingness in one column relate to another?
print(df[missing.index].isna().corr().round(2))
```

Distinguish the three mechanisms:

- **MCAR** (missing completely at random) — safe to drop, with power loss.
- **MAR** (missing at random, explained by observed variables) — impute with the
  observed covariates, not the column mean.
- **MNAR** (missing not at random) — the value itself drives missingness. Imputation
  biases the result; this needs modelling or a sensitivity analysis.

Encoded missing values are the hidden case. Check for sentinels:

```python
for col in df.select_dtypes(include=[np.number]).columns:
    suspicious = df[col].isin([-999, -9999, 999, 9999, -1, 0]).mean()
    if suspicious > 0.01:
        print(f"{col}: {suspicious:.1%} sentinel-like values")
```

## Distributions

```python
numeric = df.select_dtypes(include=[np.number]).columns
df[numeric].hist(figsize=(14, 10), bins=40)
plt.tight_layout()
plt.savefig("distributions.png", dpi=300)

# Skewness and kurtosis — decide on transforms
print(pd.DataFrame({
    "skew": df[numeric].skew(),
    "kurtosis": df[numeric].kurtosis(),
    "zeros": (df[numeric] == 0).mean(),
}).round(3).sort_values("skew", key=abs, ascending=False))
```

Heavy skew affects means, correlations, and any method assuming normality.
Consider a log or rank transform — and say so in the methods.

## Outliers

```python
def iqr_outliers(series, k=1.5):
    q1, q3 = series.quantile([0.25, 0.75])
    iqr = q3 - q1
    lo, hi = q1 - k * iqr, q3 + k * iqr
    return series[(series < lo) | (series > hi)]

for col in numeric:
    out = iqr_outliers(df[col].dropna())
    if len(out):
        print(f"{col}: {len(out)} outliers ({len(out)/len(df):.2%}), "
              f"range [{out.min():.4g}, {out.max():.4g}]")
```

An outlier is a question, not an instruction. Before removing anything, establish
whether it is a **data error**, a **real extreme value**, or a **different
population**. Removing real extremes is how effect sizes get inflated.

Never silently drop rows. Report how many and why.

## Duplicates and identifiers

```python
print("full-row duplicates:", df.duplicated().sum())

# Key candidates: which columns uniquely identify a row?
for col in df.columns:
    if df[col].nunique() == len(df):
        print("candidate key:", col)

# Duplicate keys are usually a merge bug
for col in df.columns:
    dupes = df[col].duplicated().sum()
    if 0 < dupes < len(df) * 0.5:
        print(f"{col}: {dupes} duplicate values")
```

Duplicate rows across a train/test split are a leakage source — check before
splitting (see the `research-critique` skill).

## Types and encoding

```python
# Strings that should be numbers
for col in df.select_dtypes(include=["object"]).columns:
    converted = pd.to_numeric(df[col], errors="coerce")
    if converted.notna().mean() > 0.95:
        print(f"{col}: numeric-like, {converted.isna().mean():.1%} unparseable")

# Low-cardinality strings should be categoricals — large memory win
for col in df.select_dtypes(include=["object"]).columns:
    if df[col].nunique() < 50:
        print(f"{col}: {df[col].nunique()} categories -> {df[col].unique()[:12]}")
```

Watch for inconsistent category labels — `"Male"`, `"male"`, `"M"` are three
categories to pandas and one to a human. Normalise before grouping.

## Relationships

```python
# Correlation, with a method suited to the data
corr = df[numeric].corr(method="spearman")   # rank-based, robust to skew and outliers
plt.figure(figsize=(10, 8))
plt.imshow(corr, cmap="RdBu_r", vmin=-1, vmax=1)
plt.colorbar(label="Spearman rho")
plt.xticks(range(len(numeric)), numeric, rotation=90)
plt.yticks(range(len(numeric)), numeric)
plt.tight_layout()
plt.savefig("correlation.png", dpi=300)
```

Correlation is not association is not causation. A correlation matrix is a
hypothesis generator, and a multiple-testing problem — with 50 columns you get
1225 tests, so some large correlations are noise.

## Large data

```python
# Polars: lazy evaluation and streaming for data that does not fit comfortably
import polars as pl
lf = pl.scan_csv("big.csv")
print(lf.select(pl.all().null_count()).collect())
print(lf.group_by("group").agg(pl.col("value").mean()).collect())

# pandas: chunked reading
totals = {}
for chunk in pd.read_csv("big.csv", chunksize=100_000):
    for col in chunk.select_dtypes(include=[np.number]).columns:
        totals[col] = totals.get(col, 0) + chunk[col].sum()
```

## Output artifact

Write `data-profile.md` so later stages inherit the facts rather than rediscovering
them — and so a reader can see what you actually checked.

```markdown
# Data Profile: <dataset>

## Files
- <path> — <what it holds, rows x columns>

## Schema
| Column | Type | Non-null | Unique | Notes |
|---|---|---|---|---|

## Missingness
- <column>: <pct> — mechanism (MCAR/MAR/MNAR) and handling decision

## Distributions and transforms
- <column>: skew <value> — <transform applied or not>

## Outliers
- <column>: <count> (<pct>) — investigated, decision, reason

## Duplicates and keys
## Data quality issues found
## Assumptions carried into analysis
```

## Anti-patterns

| Anti-pattern | Consequence |
|---|---|
| Trusting column names | Analyses the wrong variable silently |
| Dropping nulls without counting | Undisclosed sample attrition |
| Removing outliers to improve fit | Inflated effect, unfalsifiable result |
| Mean-imputing MNAR data | Biased estimates, understated variance |
| Treating sentinel codes as data | -999 becomes a real measurement |
| Splitting before checking duplicates | Test leakage |
| Reporting only the summary | Encoding and type errors stay invisible |
