---
name: hugging-face-datasets
description: Create, load, and manage datasets on the Hugging Face Hub — dataset cards, streaming, and versioning. Use for sharing and versioning research datasets.
category: data-engineering
tags: [huggingface, datasets, hub, versioning, sharing]
disable-model-invocation: true
---

# Hugging Face Datasets

A dataset on the Hub is a published artifact. It needs documentation, versioning,
and a clear license — otherwise no one (including future you) can use it
correctly.

## Loading

```python
from datasets import load_dataset

ds = load_dataset("json", data_files="data.jsonl")
ds = load_dataset("parquet", data_dir="data/")
hub_ds = load_dataset("namespace/dataset-name", revision="main")

# Streaming for large data
ds = load_dataset("namespace/dataset-name", streaming=True)
```

## Publishing

```python
from datasets import Dataset
ds = Dataset.from_pandas(df)
ds.push_to_hub("namespace/dataset-name", private=False)
```

**The dataset card is mandatory** for anything published:

```markdown
---
license: cc-by-4.0
task_categories: [audio-classification]
language: [zh, en]
size_categories: [1K<n<10K]
---

# Dataset Card
## Description
## Dataset Structure (features, splits, n)
## Collection (how the data was gathered)
## Preprocessing
## Considerations (biases, limitations, ethical)
## License and attribution
```

## Versioning

- **Commits are versions.** Tag a release (`v1.0`) for anything cited.
- **Cite the revision**, not just the name. Data changes.
- **LFS for large files**; record the file checksums.

## Data quality

- **Validate before publishing:** schema, dtypes, missing values, duplicates,
  label distribution.
- **Split definition** recorded (train/test/val with n). Do not publish a
  pre-split dataset without stating the split's basis.
- **PII and consent.** Check for personally identifiable information; record the
  consent basis.

## Loading correctness

- **`load_dataset` caching** can hide a changed file. Clear the cache or use a
  revision when reproducing.
- **Column names and types** are part of the contract; state them.
- **Splits** are explicit; do not assume a random split.

## For research use

- **Record the revision and the split** in the methods.
- **Do not modify a published dataset's content in place** — publish a new
  revision.
- **Benchmark datasets** must not be used for both training and testing; state
  the split policy.

## Reporting

State: the dataset name and revision, the license, the schema and splits with
n, the collection and preprocessing method, the known biases and limitations,
the consent/PII status, and the citation.

## Anti-patterns

- Publishing without a card or a license.
- Citing a dataset name without its revision.
- Silently changing a published dataset's content.
- Pre-splitting without stating the split basis.
