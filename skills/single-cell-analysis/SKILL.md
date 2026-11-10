---
name: single-cell-analysis
description: Single-cell RNA-seq analysis with Scanpy and AnnData. Use for scRNA-seq preprocessing, clustering, differential expression, trajectory analysis, and visualization.
category: biology
tags: [biology, single-cell, scrnaseq, scanpy, anndata, clustering]
---

# Single-Cell Analysis (Scanpy)

## Overview

Scanpy is the standard Python toolkit for single-cell genomics. Use it with AnnData
for the complete scRNA-seq analysis pipeline: preprocessing, clustering, differential
expression, trajectory inference, and visualization.

## Installation

```bash
pip install scanpy anndata leidenalg
```

## Complete Pipeline

```python
import scanpy as sc
import anndata as ad
import numpy as np
import pandas as pd

# 1. Load data
adata = sc.read_10x_h5('filtered_feature_bc_matrix.h5')
# or: adata = sc.read_h5ad('data.h5ad')
# or: adata = sc.read_csv('counts.csv')

print(f"Loaded: {adata.n_obs} cells × {adata.n_vars} genes")

# 2. Quality control
adata.var_names_make_unique()
adata.obs['n_genes'] = (adata.X > 0).sum(axis=1).A1 if hasattr(adata.X, 'A1') else (adata.X > 0).sum(axis=1)
adata.obs['n_counts'] = adata.X.sum(axis=1).A1 if hasattr(adata.X, 'A1') else adata.X.sum(axis=1)

# Filter cells
sc.pp.filter_cells(adata, min_genes=200)
sc.pp.filter_genes(adata, min_cells=3)

# Mitochondrial QC
adata.var['mt'] = adata.var_names.str.startswith('MT-')
sc.pp.calculate_qc_metrics(adata, qc_vars=['mt'], percent_top=None, log1p=False, inplace=True)
adata = adata[adata.obs.pct_counts_mt < 20, :]

# 3. Normalize and log-transform
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)

# 4. Feature selection
sc.pp.highly_variable_genes(adata, min_mean=0.0125, max_mean=3, min_disp=0.5)
print(f"Highly variable genes: {adata.var.highly_variable.sum()}")
adata.raw = adata
adata = adata[:, adata.var.highly_variable]

# 5. Scale and PCA
sc.pp.scale(adata, max_value=10)
sc.tl.pca(adata, svd_solver='arpack', n_comps=50)

# 6. Neighborhood graph and clustering
sc.pp.neighbors(adata, n_neighbors=10, n_pcs=40)
sc.tl.leiden(adata, resolution=0.5)
sc.tl.umap(adata)

# 7. Find marker genes
sc.tl.rank_genes_groups(adata, 'leiden', method='wilcoxon')
print("Top markers per cluster:")
for group in adata.obs['leiden'].unique():
    genes = sc.get.rank_genes_groups_df(adata, group=group).head(5)
    print(f"Cluster {group}: {', '.join(genes['names'].tolist())}")

# 8. Visualization
sc.pl.umap(adata, color=['leiden', 'n_genes', 'pct_counts_mt'], ncols=3)
sc.pl.rank_genes_groups(adata, n_genes=10, sharey=False)
```

## Differential Expression

```python
# Between two groups
sc.tl.rank_genes_groups(adata, 'condition', groups=['treatment'], reference='control', method='wilcoxon')
de_results = sc.get.rank_genes_groups_df(adata, group='treatment')
sig_genes = de_results[de_results['pvals_adj'] < 0.05]
print(f"Significant DE genes: {len(sig_genes)}")

# Top upregulated and downregulated
up = sig_genes[sig_genes['logfoldchanges'] > 1].sort_values('pvals_adj')
down = sig_genes[sig_genes['logfoldchanges'] < -1].sort_values('pvals_adj')
```

## Trajectory Analysis (PAGA / Diffusion Pseudotime)

```python
# PAGA for cluster connectivity
sc.tl.paga(adata, groups='leiden')
sc.pl.paga(adata, plot=False)
sc.tl.umap(adata, init_pos='paga')

# Diffusion pseudotime
sc.tl.diffmap(adata)
sc.tl.dpt(adata, n_branchings=0)
sc.pl.umap(adata, color=['dpt_pseudotime'])
```

## Working with AnnData Directly

```python
import anndata as ad

# Subset by metadata
t_cells = adata[adata.obs['cell_type'] == 'T cell']

# Access layers
if 'raw_counts' in adata.layers:
    raw = adata.layers['raw_counts']

# Add metadata
adata.obs['quality_score'] = np.random.rand(adata.n_obs)

# Concatenate datasets
combined = ad.concat([adata1, adata2], label='batch', keys=['batch1', 'batch2'])

# Save
adata.write_h5ad('processed.h5ad')
```

## Best Practices

1. Store raw counts in `.raw` before filtering/normalization
2. Check QC metrics before downstream analysis (n_genes, n_counts, pct_mt)
3. Use `sc.pp.highly_variable_genes` to focus on informative features
4. Try multiple clustering resolutions and compare
5. Validate clusters with known markers
6. Use colorblind-safe palettes for publication figures
7. Save intermediate AnnData objects for reproducibility
