---
name: string-database
description: Query STRING for protein-protein interaction networks and functional associations. Use for interaction networks and interaction enrichment with correct interpretation.
category: databases
tags: [string, interactions, networks, ppi, functional-association]
disable-model-invocation: true
---

# STRING

STRING aggregates protein-protein interactions and functional associations from
evidence channels. Its combined score is a confidence measure, not a probability
of physical interaction.

## The API

```python
import requests

r = requests.get("https://string-db.org/api/json/network",
                 params={"identifiers": "TP53%0dMDM2", "species": 9606}).json()

# Enrichment
r = requests.get("https://string-db.org/api/json/enrichment",
                 params={"identifiers": "%0d".join(gene_list), "species": 9606}).json()
```

## Evidence channels

The combined score integrates:
- **Experiments** — physical assays (strongest for direct interaction).
- **Databases** — curated pathways.
- **Text mining** — co-mention (not evidence of interaction).
- **Co-expression** — correlated expression.
- **Genomic context** — gene neighborhood, fusion, co-occurrence.
- **Homology** — transferred from other species.

**A high combined score driven by text mining is not a demonstrated physical
interaction.** Report the channel breakdown when the claim is about interaction.

## Interaction vs association

STRING's `network` endpoint returns **functional associations**, which include
indirect relationships. For **physical interactions**, filter to the experimental
and database channels.

## Network interpretation

- **Hub bias.** Well-studied proteins (TP53, AKT1) have high degree regardless
  of the query. A network centered on a hub is often an annotation artifact.
- **Interaction enrichment p-value** tests whether the query proteins have more
  interactions among themselves than expected. It is not a measure of pathway
  activity.
- **First-shell expansion** adds neighbors; report whether expansion was used
  and its size. An expanded network is not evidence that the neighbors are
  involved.
- **Node mapping.** Multiple identifiers may map to one protein; report the
  mapping and any unmapped inputs.

## Enrichment in STRING

- **Background:** the whole genome is the default; for a targeted list, use the
  tested set.
- **Multiple testing** corrected (FDR).
- **The enriched term is a description**, not a mechanism.

## Reporting

State: the query identifiers and their mapping, the species and the STRING
version, the score threshold and the evidence channels used, whether first-shell
expansion was applied, the network's interaction-enrichment p-value, the
combined score and its channel breakdown for any claimed interaction, and the
caveat that association ≠ physical interaction.

## Anti-patterns

- Treating a functional association as a physical interaction.
- Quoting the combined score without its channel breakdown.
- Ignoring first-shell expansion in the interpretation.
- Hub-driven networks presented as query-specific findings.
