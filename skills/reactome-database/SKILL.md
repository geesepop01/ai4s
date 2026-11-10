---
name: reactome-database
description: Query Reactome for pathway data — pathway analysis, reaction networks, and pathway visualization. Use for interpreting gene lists in pathway context.
category: databases
tags: [reactome, pathways, enrichment, networks, biology]
disable-model-invocation: true
---

# Reactome

Reactome is a curated, peer-reviewed pathway database. Its strength is
reaction-level detail; its constraint is coverage biased toward well-studied
biology.

## The API

```python
import requests

# Search
r = requests.get("https://reactome.org/ContentService/search/query",
                 params={"query": "apoptosis", "species": "Homo sapiens"}).json()

# Pathway participants
r = requests.get("https://reactome.org/ContentService/data/pathway/R-HSA-109581/participants").json()

# Analysis service (enrichment)
r = requests.post("https://reactome.org/AnalysisService/identifiers/projection",
                  data="\n".join(gene_list),
                  headers={"Content-Type": "text/plain"}).json()
token = r["summary"]["token"]
result = requests.get(f"https://reactome.org/AnalysisService/token/{token}/filter/pathways").json()
```

## Enrichment analysis

- **The background matters.** Use the tested genes as the universe, not the whole
  genome. A gene list from an array platform has a specific background.
- **Over-representation (ORA)** is count-based; **GSEA** uses ranked data and is
  more sensitive when the effect is distributed. Choose based on the data you
  have.
- **Multiple testing:** FDR correction (Benjamini–Hochberg) is standard; report
  the corrected p and the method.
- **Pathway size bias.** Large pathways are enriched more easily; consider
  methods that account for it.

## Interpreting a pathway result

- **A pathway p-value is not a mechanism.** It says the list is non-randomly
  concentrated in that pathway; it does not say the pathway is activated or
  inhibited.
- **Direction matters.** Enrichment in an apoptosis pathway does not say whether
  apoptosis increased or decreased. Use directional data (GSEA with a signed
  statistic) when direction is the claim.
- **Overlap between pathways.** Top pathways often share genes. Report the
  leading-edge genes, not only the pathway name.
- **Coverage bias.** Immune and cancer pathways are richly annotated; a
  non-significant result in a poorly annotated area is not evidence of absence.

## Cross-referencing

- **Compare with KEGG and GO.** Different curation gives different results;
  agreement is stronger evidence than any single source.
- **STRING interaction data** answers a different question (interaction
  enrichment) than pathway over-representation. Do not substitute one for the
  other.

## Reporting

State: the gene list and its background/universe, the identifier type used, the
analysis method (ORA/GSEA) and its parameters, the pathway database and its
version, the multiple-testing correction, the leading-edge genes, the direction
of effect where claimed, and the coverage caveats.

## Anti-patterns

- Reporting a pathway name as a mechanistic conclusion.
- Using the whole genome as background for a platform-specific list.
- Ignoring direction when claiming activation/suppression.
- Reporting only the top pathway without the gene overlap or the leading edge.
