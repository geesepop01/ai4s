---
name: single-cell-rnaseq
description: Analyze single-cell RNA-seq — QC, normalization, clustering, differential expression, and trajectory. Use for scRNA-seq data with proper handling of sparsity and pseudoreplication.
category: biology
tags: [scrnaseq, single-cell, clustering, scanpy, seurat]
disable-model-invocation: true
---

# Single-cell RNA-seq

scRNA-seq is sparse, noisy, and hierarchical (cells within samples). The
analysis must handle sparsity honestly and avoid pseudoreplication.

## The pipeline

```
counts → QC (cells, genes) → normalization → HVG selection → scaling →
  PCA → neighbors → clustering (Leiden/Louvain) → UMAP → marker genes →
  annotation → DE / trajectory
```

```python
import scanpy as sc

adata = sc.read_h5ad("data.h5ad")
sc.pp.filter_cells(adata, min_genes=200)
sc.pp.filter_genes(adata, min_cells=3)
adata.var["mt"] = adata.var_names.str.startswith("MT-")
sc.pp.calculate_qc_metrics(adata, qc_vars=["mt"], inplace=True)
adata = adata[adata.obs.pct_counts_mt < 20].copy()

sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)
sc.pp.highly_variable_genes(adata, n_top_genes=2000)
sc.pp.scale(adata, max_value=10)
sc.tl.pca(adata)
sc.pp.neighbors(adata)
sc.tl.leiden(adata, resolution=0.8)
sc.tl.umap(adata)
```

## QC (do it per sample, not pooled)

- **Cell filters:** genes detected, total counts, mitochondrial fraction (high
  = dying cell). Thresholds are sample-specific.
- **Doublets:** Scrublet/DoubletFinder; doublets create false intermediate
  clusters.
- **Ambient RNA:** SoupX/CellBender; ambient contamination creates false
  expression.
- **Per-sample QC** because thresholds differ across preparations.

## Normalization and integration

- **Normalization** (scran, SCTransform, or normalize_total+log1p). The choice
  affects DE.
- **Batch integration** (Harmony, BBKNN, scVI) when samples come from different
  batches. **Integrate for clustering/visualization, but do not run DE on
  integrated values.** Use the raw counts with a model that includes the batch.
- **State the integration method and its parameters.**

## Clustering

- **Resolution is a choice.** Report the resolution and the marker genes that
  justify each cluster.
- **Cluster stability** across resolutions and random seeds.
- **UMAP is a visualization**, not evidence of structure. Do not claim
  trajectories or separation from a UMAP plot alone.

## Differential expression (the pseudoreplication trap)

**Cells are not independent replicates.** A DE test treating 10,000 cells as
n = 10,000 is invalid; the replicate is the sample/donor.

- **Pseudobulk per sample** and DE with DESeq2/edgeR — the correct approach for
  condition comparisons.
- **Mixed models** (MAST with random effects, muscat) for cell-level with sample
  random effects.
- **Report n samples, not n cells.**

## Annotation

- **Marker genes** with their evidence; reference-based mapping (SingleR,
  Azimuth, CellTypist) with the reference stated.
- **Novel clusters** need manual review and multiple markers, not one.
- **Cluster labels are hypotheses**, especially for rare populations.

## Reporting

State: the platform and chemistry, the QC thresholds per sample, doublet and
ambient correction, the normalization and integration methods, the clustering
resolution and the marker evidence, the DE method and the replicate level,
the number of samples and cells, and the annotation references.

## Common errors

- n = cells when n = samples.
- DE on integrated data.
- Clusters claimed from UMAP separation alone.
- No doublet/ambient correction.
- Marker genes without their full evidence.
