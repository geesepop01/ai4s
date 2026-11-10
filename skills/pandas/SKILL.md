---
name: pandas
description: Use pandas for tabular data manipulation — loading, cleaning, joins, grouping, and time series. Use for any DataFrame work where correctness of the join/group/split determines the result.
category: data-engineering
tags: [pandas, dataframes, cleaning, joins, python]
---

# pandas

Most analysis bugs are data bugs: a wrong join, a silent dtype coercion, a
groupby on the wrong key. pandas makes these easy to write and hard to notice.

## Loading

```python
import pandas as pd

df = pd.read_csv("data.csv", dtype={"subject_id": "string"}, parse_dates=["ts"])
print(df.dtypes, df.shape)
print(df.isna().sum())
```

**Set dtypes on load.** A `subject_id` read as int64 loses leading zeros; a
date read as string cannot be compared.

## Joins (the most common bug)

```python
merged = a.merge(b, on="subject_id", how="left", validate="one_to_one",
                 indicator=True)
print(merged["_merge"].value_counts())
```

- **`validate=` always.** `"one_to_one"`, `"one_to_many"`, `"many_to_one"` —
  it raises on an unexpected row multiplication, which is the classic silent
  bug.
- **`indicator=True`** to see what matched and what did not.
- **Check the row count before and after.** A join that changes the row count
  changed the n.

## Grouping

```python
summary = df.groupby("group", observed=True)["value"].agg(["mean", "std", "count"])
```

- **`observed=True`** for categoricals to avoid empty group rows.
- **`as_index=False`** when the result should stay a plain table.
- **`transform`** for per-group operations that must broadcast back to rows;
  **`agg`** for summaries. Mixing them up produces wrong shapes.

## Missing data

- `isna().sum()` first. Missingness is data.
- **`dropna()` silently changes n.** Record the count dropped and the criterion.
- **Imputation is an analysis decision.** State the method (mean, MICE,
  model-based) and whether the imputation was fit on train only.

## Common silent failures

| Pattern | Failure |
|---|---|
| `df["col"] == "yes"` | Fails silently when the value is `"Yes "` or `"yes."` |
| `groupby` on a float key | Floating-point keys do not group as expected |
| `merge` without validate | Row multiplication inflates n |
| `df["date"] > "2024-01-01"` | String comparison, not date comparison |
| Chained indexing `df[df.a>0]["b"] = 1` | Fails or warns; use `.loc` |
| `astype(int)` on NaN | Raises or produces garbage; handle NaN first |
| `concat` without reset_index | Duplicate indices mislead later joins |

## Reproducible data pipelines

```python
def load(path):
    df = pd.read_csv(path, dtype=..., parse_dates=...)
    assert df["subject_id"].is_unique
    return df
```

- **Assertions at load**: uniqueness of keys, expected columns, expected dtypes.
- **Never edit a raw file in place.** Derived tables go to new files (see
  `reproducibility`).
- **Record the source and version** of the data alongside the derived table.

## Performance

- `category` dtype for low-cardinality string columns (large memory saving).
- `merge` on categoricals or on the same dtype for speed and correctness.
- `chunksize` or Polars/DuckDB for data larger than memory.

## Verification

Before a result is reported, verify the DataFrame that produced it: shape,
dtypes, the join counts, and the group sizes. A number computed on a DataFrame
that silently dropped or duplicated rows is not a result.
