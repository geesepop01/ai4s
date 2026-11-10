---
name: pathway-analysis
description: Pathway and gene set enrichment analysis. Use for GO enrichment, KEGG pathway analysis, GSEA, and functional annotation of gene lists.
category: biology
tags: [biology, pathways, enrichment, gene-ontology, kegg, gsea]
disable-model-invocation: true
---

# Pathway & Enrichment Analysis

## Overview

Pathway analysis interprets gene lists in biological context. Use enrichment analysis
to identify over-represented pathways, Gene Ontology terms, and biological processes.

## Installation

```bash
pip install gseapy mygene gprofiler-official
```

## Over-Representation Analysis (ORA)

```python
import gseapy as gp

# Enrichr-style analysis
gene_list = ['TP53', 'BRCA1', 'ATM', 'CHEK2', 'MDM2', 'RB1', 'CDKN2A']

# KEGG pathways
enr_kegg = gp.enrichr(
    gene_list=gene_list,
    gene_sets='KEGG_2021_Human',
    organism='human',
    outdir=None
)
print("KEGG Pathways:")
print(enr_kegg.results[['Term', 'Adjusted P-value', 'Overlap', 'Genes']].head(10))

# Gene Ontology - Biological Process
enr_go = gp.enrichr(
    gene_list=gene_list,
    gene_sets='GO_Biological_Process_2021',
    organism='human',
    outdir=None
)
print("GO Biological Process:")
print(enr_go.results[['Term', 'Adjusted P-value', 'Overlap']].head(10))

# Multiple gene sets at once
enr = gp.enrichr(
    gene_list=gene_list,
    gene_sets=['KEGG_2021_Human', 'GO_Biological_Process_2021', 'Reactome_2022'],
    organism='human',
    outdir=None
)
```

## Gene Set Enrichment Analysis (GSEA)

```python
import gseapy as gp
import pandas as pd

# Prepare ranked gene list (gene → metric)
# Format: DataFrame with 'gene_name' and 'metric' columns
ranked = pd.DataFrame({
    'gene_name': ['TP53', 'BRCA1', 'MYC', 'EGFR', ...],
    'metric': [3.5, 2.8, 2.1, 1.7, ...]  # e.g., log2FC, -log10(p)
})

# Run GSEA
gsea = gp.prerank(
    rnk=ranked,
    gene_sets='KEGG_2021_Human',
    min_size=15,
    max_size=500,
    permutation_num=1000,
    outdir=None
)

# Results
print(gsea.res2d[['Term', 'NES', 'NOM p-val', 'FDR q-val']].head(10))
```

## Gene ID Conversion

```python
import mygene

mg = mygene.MyGeneInfo()

# Convert gene symbols to Entrez IDs
results = mg.querymany(
    ['TP53', 'BRCA1', 'ATM'],
    scopes='symbol',
    fields='entrezgene,name',
    species='human'
)

for r in results:
    if 'entrezgene' in r:
        print(f"{r['query']}: Entrez {r['entrezgene']} - {r.get('name', 'N/A')}")
```

## g:Profiler (Multi-source Enrichment)

```python
from gprofiler import GProfiler

gp = GProfiler(return_dataframe=True)

results = gp.profile(
    organism='hsapiens',
    query=['TP53', 'BRCA1', 'ATM', 'CHEK2', 'MDM2']
)

print(results[['source', 'name', 'p_value', 'intersection_size']].head(20))
```

## Visualization

```python
import matplotlib.pyplot as plt

# Bar plot of enrichment results
top_terms = enr_kegg.results.head(10)
fig, ax = plt.subplots(figsize=(10, 6))
ax.barh(top_terms['Term'], -np.log10(top_terms['Adjusted P-value']))
ax.set_xlabel('-log10(Adjusted P-value)')
ax.set_title('KEGG Pathway Enrichment')
plt.tight_layout()
plt.savefig('enrichment_bar.png', dpi=300, bbox_inches='tight')

# Dot plot (size = gene count, color = p-value)
gseapy.dotplot(enr_kegg.results, title='KEGG Enrichment', cmap='viridis')
```

## Best Practices

1. Use appropriate background gene set (all expressed genes, not just significant ones)
2. Apply multiple testing correction (BH/FDR)
3. Report adjusted p-values, not raw p-values
4. Consider both up-regulated and down-regulated gene lists separately
5. Use GSEA when you have a ranked list; ORA when you have a binary gene list
6. Cross-validate with multiple databases (KEGG, Reactome, GO)
7. Visualize top results; don't just list p-values
