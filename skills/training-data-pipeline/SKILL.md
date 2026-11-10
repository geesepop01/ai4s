---
name: training-data-pipeline
description: Build training data pipelines — curation, deduplication, labeling, augmentation, and versioning. Use when the training data must be reproducible and auditable.
category: ml
tags: [training-data, curation, deduplication, labeling, data-versioning]
disable-model-invocation: true
---

# Training Data Pipeline

The training data is the most consequential artifact in a machine learning
project, and the least often versioned. A pipeline makes it auditable.

## The pipeline

```
sources → ingest → clean → deduplicate → label → split → version →
  augment (at train time) → loader
```

## Curation

- **Document every source** with its origin, license, and retrieval date.
- **Record the inclusion/exclusion criteria** and the counts at each filter.
- **PII and consent** checked; record the basis for use.

## Deduplication (critical)

- **Exact duplicates** by hash of the normalized content.
- **Near-duplicates** by MinHash/SimHash/LSH, or by embedding similarity.
- **Duplicates across splits cause leakage** — a model that has seen a near-
  identical test item is not tested. Deduplicate across the whole corpus before
  splitting.
- **Report the deduplication method and the counts removed.**

## Labeling

- **Label definitions** written down, with examples and edge cases.
- **Annotator agreement** measured (Cohen's κ, Krippendorff's α). Low agreement
  means the task is underspecified.
- **Multiple annotators** with adjudication for ambiguous items.
- **Label noise** quantified; clean test sets are worth more than noisy training
  data.

## Splitting

- **Split by the unit of independence** (subject, patient, document, speaker),
  never by row.
- **Stratify** where the distribution matters.
- **The test set is frozen** and never used for any decision.
- **Temporal splits** when the future is the deployment condition.

## Versioning

- **Data version control** (DVC, lakeFS, or content-addressed storage).
- **Each training run cites the dataset version.** A model trained on
  "the dataset" is not reproducible.
- **The manifest** records: sources, filters with counts, deduplication,
  labeling, split seed and sizes.

## Augmentation

- **Applied at train time, not baked into the dataset** (unless it is the
  intended data).
- **Augmentation does not create information.** It encodes invariances; state
  them.
- **Test-time augmentation** is a separate, declared choice.

## Reporting

State: the sources with their licenses, the cleaning and deduplication methods
with counts, the labeling protocol and the agreement statistic, the split unit
and sizes, the dataset version and its manifest path, the augmentation and its
assumed invariances, and the PII/consent basis.

## Common errors

- Duplicates spanning train and test.
- Splitting by row when the unit is a subject.
- No label agreement measurement.
- Training data changed without a version bump.
- Augmentation baked in and then also applied at train time.
