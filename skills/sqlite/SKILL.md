---
name: sqlite
description: Query and manage SQLite databases — schema design, indexing, joins, and analysis queries. Use for local relational data where SQL is the right tool.
category: data-engineering
tags: [sqlite, sql, database, queries, indexing]
disable-model-invocation: true
---

# SQLite

SQLite is the right tool for local relational data: fast, zero-configuration,
and exact about joins and types — things pandas is not.

## The basics

```python
import sqlite3
import pandas as pd

con = sqlite3.connect("data.db")
df = pd.read_sql_query("""
    SELECT s.subject_id, COUNT(t.trial_id) AS n_trials
    FROM subjects s JOIN trials t ON t.subject_id = s.subject_id
    WHERE t.condition = 'active'
    GROUP BY s.subject_id
    HAVING COUNT(t.trial_id) >= 10
""", con)
```

## Schema design

- **Primary keys** on every table. `UNIQUE` constraints where the domain demands
  it — the database should refuse a duplicate, not you.
- **Foreign keys:** `PRAGMA foreign_keys = ON;` — SQLite does not enforce them by
  default. Turn it on.
- **Types:** SQLite is dynamically typed ("type affinity"). Declare types for
  intent and validation, and be explicit in queries.
- **Indexes** on columns used in `WHERE`, `JOIN`, `GROUP BY`. `EXPLAIN QUERY
  PLAN` to verify the index is used.

## Query correctness

- **`JOIN` vs `LEFT JOIN`** is a semantics decision. `INNER JOIN` drops
  unmatched rows silently; use `LEFT JOIN` and check for NULL when the row must
  survive.
- **NULL semantics:** `NULL = NULL` is not true. Use `IS NULL`. `COUNT(col)`
  skips NULLs; `COUNT(*)` does not.
- **Aggregates and grouping:** every non-aggregated `SELECT` column must be in
  `GROUP BY` (SQLite tolerates otherwise and picks an arbitrary row — a silent
  bug).
- **Integer division:** `3/2` is `1` in SQLite. Cast to `REAL` when you mean
  `1.5`.

## Working with pandas

- **Write with `to_sql`** and an index only if the index is meaningful.
- **Read with explicit types** and parse dates after reading (`pd.to_datetime`).
- **Chunk large reads** with `chunksize=` in `read_sql_query`.

## Reproducibility

- The **schema is a file** (`.sql`), version-controlled. A database whose schema
  exists only on disk is not reproducible.
- **The query is the analysis.** Save queries as `.sql` files or in the script;
  never leave a result that cannot be re-derived.
- **Record the database version/creation date** alongside results.

## Performance

- **Index before filtering.** A full scan on a large table is the common failure.
- **Prepared statements** and `executemany` for bulk inserts.
- **`VACUUM`** after large deletes to reclaim space.
- **WAL mode** (`PRAGMA journal_mode = WAL`) for concurrent readers.

## When to use something else

- Data larger than memory and analysis-shaped → DuckDB (columnar, fast
  aggregates).
- Concurrent multi-user writes → PostgreSQL.
- Pure columnar analytics → Parquet + DuckDB/Polars.

SQLite is for **correct relational logic on local data**, and for being exact
about joins in a way that a DataFrame pipeline is not.

## Verification

Before reporting a query result: check the row count against expectations,
verify the join did not multiply rows (`COUNT(*)` before and after), confirm
NULL handling, and confirm the aggregate's grouping is what you intended.
