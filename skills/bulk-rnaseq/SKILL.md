---
name: bulk-rnaseq
description: Run bulk RNA-seq analysis end to end — QC, alignment, quantification, differential expression, and interpretation. Use for gene expression studies from sequencing data.
category: biology
tags: [rnaseq, differential-expression, alignment, quantification, bulk]
disable-model-invocation: true
---

# Bulk RNA-seq

Bulk RNA-seq measures average expression per sample. Its analysis is dominated
by library preparation, normalization, and the model — not by the aligner.

## The pipeline

```
FASTQ → QC (FastQC, fastp/Trim Galore) → alignment (STAR) or pseudoalignment
  (Salmon/kallisto) → quantification (featureCounts/Salmon) → count matrix
  → DE (DESeq2/edgeR) → pathway analysis
```

## QC

- **FastQC/MultiQC:** per-base quality, adapter content, GC distribution,
  duplication rate, overrepresented sequences.
- **Trim** adapters and low-quality bases (fastp or Trim Galore). Report the
  trimming parameters and the post-trim QC.
- **RNA degradation** (3'/5' bias, gene body coverage, RSeQC) — degraded samples
  distort expression.

## Quantification

| Method | Notes |
|---|---|
| STAR + featureCounts | Genome-aligned; handles novel junctions |
| Salmon/kallisto | Fast, transcript-level; needs tximport to gene level |
| RSEM | Transcript + gene estimates with uncertainty |

**State the reference** (genome build, GTF version) and the counting mode
(union vs strict, strandedness). Wrong strandedness halves the usable signal.

## Differential expression

```r
library(DESeq2)
dds <- DESeqDataSetFromMatrix(countData = counts, colData = coldata, design = ~ batch + condition)
dds <- DESeq(dds)
res <- results(dds, alpha = 0.05)
```

- **Design matrix includes batch and covariates.** Unmodeled batch is a false
  positive generator.
- **DESeq2/edgeR use a negative binomial model** with shrinkage. Do not use a
  t-test on normalized counts.
- **LFC shrinkage** (`lfcShrink`) for ranking; report both shrunken and raw.
- **Independent filtering** is built in; report the filtering.

## Reporting the results

- **FDR threshold** (0.05) and the correction method (BH).
- **Log2 fold change with its SE and CI**, not just a significant gene list.
- **Volcano and MA plots** with the thresholds shown.
- **n per group** and the number of genes tested/filtered.
- **The full results table**, not only the significant genes. Selective reporting
  of gene lists is the standard way to mislead.

## Batch effects

- **Include batch in the design** always when it exists.
- **SVA/RUV** for unmeasured batch; report the surrogate variables used.
- **Batch confounded with condition** cannot be corrected — it is a design
  failure. Say so.

## Pathway analysis

Use the ranked list (GSEA) or the significant list (ORA) with the tested genes
as background (see `reactome-database`, `pathway-analysis`). Report the
direction.

## Validation

- **Independent cohort** for any claim to generalize.
- **qPCR validation** of key genes on independent samples.
- **Cross-platform consistency** where data exists.

## Reporting

State: library prep and sequencing platform, read length and depth, QC results
and trimming, the reference genome and annotation versions, the quantification
method and counting mode, the DE design formula and covariates, the LFC and FDR
thresholds, the number of samples and genes, the batch handling, and the
independent validation.
