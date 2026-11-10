---
name: kegg-database
description: Query KEGG for pathways, genes, compounds, and metabolic network data. Use for pathway analysis and metabolic network interpretation.
category: databases
tags: [kegg, pathways, metabolism, networks, enrichment]
disable-model-invocation: true
---

# KEGG

KEGG is the reference for pathway maps and metabolic network structure. Its
licensing is restrictive for programmatic access; its pathway definitions are
manually curated and influential.

## Access

```python
import requests

# KEGG REST API
r = requests.get("https://rest.kegg.jp/get/hsa00010").text   # pathway
r = requests.get("https://rest.kegg.jp/find/compound/glucose").text
r = requests.get("https://rest.kegg.jp/link/pathway/hsa:7157").text
```

**KEGG's academic licensing restricts bulk download and some programmatic
access.** For bulk use, consider the KEGG FTP license or use the KEGG API
within its rate limits.

## Identifier types

| Prefix | Meaning |
|---|---|
| `hsa:`, `mmu:`, `eco:` | Organism gene IDs |
| `cpd:` | Compound |
| `path:` | Pathway map |
| `ko:` | KO (ortholog) group |
| `R:` | Reaction |
| `M:` | Module |
| `C:` / `G:` | Compound / gene groups |

**Map genes to KO, not directly to pathways,** for cross-species work. KOs are
the evolutionary unit.

## Pathway analysis

- **`pathway` maps are illustrations**, not quantitative models. The map's
  layout encodes biology, not flux.
- **Enrichment (ORA/GSEA)** with the correct background (see
  `reactome-database`).
- **Pathway hierarchy:** KEGG has 6 top-level categories; report the level you
  used.

## Metabolic network modeling

- **KEGG reactions** (`R:`) give stoichiometry for FBA models.
- **Modules** (`M:`) are functional units; completeness of a module is a
  meaningful metric for genome-scale models.
- **Stoichiometry and reversibility** must be checked; KEGG reversibility
  conventions do not always match physiological direction.

## Interpretation limits

- **Coverage bias.** KEGG is rich in metabolism and signaling, sparse in
  poorly-studied biology. A non-significant result in an unannotated area is not
  evidence of absence.
- **Manual curation** means the pathway definition is a scientific choice; KEGG
  and Reactome can disagree.
- **A pathway entry is a description, not a mechanism.** Same caution as any
  pathway analysis.

## Reporting

State: the KEGG version and the retrieval date, the identifier types used and
the mapping, the background/universe for enrichment, the pathway level, the
multiple-testing correction, the license terms if bulk data was used, and the
caveat that pathway membership is not pathway activity.

## Anti-patterns

- Bulk-downloading KEGG without a license.
- Reporting a pathway name as a mechanistic conclusion.
- Using gene-to-pathway mappings without the KO level for cross-species work.
- Ignoring the coverage bias when interpreting a null result.
