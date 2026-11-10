---
name: uniprot-database
description: Query UniProt for protein sequences, annotations, variants, and functional data. Use for retrieving and interpreting protein records with proper identifier and isoform handling.
category: databases
tags: [uniprot, proteins, sequences, annotations, isoforms]
---

# UniProt

UniProt is the reference for protein sequence and function. The record's
evidence codes and isoform structure are what make it more than a FASTA file.

## The REST API

```python
import requests

# Search
r = requests.get("https://rest.uniprot.org/uniprotkb/search",
                 params={"query": "gene:TP53 AND organism_id:9606",
                         "format": "json", "size": 5}).json()

# Entry with annotations
r = requests.get("https://rest.uniprot.org/uniprotkb/P04637.json").json()
print(r["sequence"]["length"], r["sequence"]["value"][:50])

# FASTA
fasta = requests.get("https://rest.uniprot.org/uniprotkb/P04637.fasta").text
```

## Identifier discipline

- **Accession (P04637) is stable**; entry names (P53_HUMAN) and gene symbols
  change.
- **Isoforms matter.** The canonical sequence is not the only one; isoform
  sequences can differ in domains. State which isoform you used
  (`P04637-2`).
- **Reviewed (Swiss-Prot) vs unreviewed (TrEMBL).** Reviewed records are
  manually curated; unreviewed are automated. Report which.
- **Version:** sequences are versioned; record the version if the exact sequence
  matters.

## Evidence codes

UniProt annotations carry evidence:
- **ECO:0000305** — curator inference.
- **ECO:0000269** — experimental evidence (with a cited reference).
- **ECO:0000250** — sequence similarity.
- **ECO:0000256** — automatic annotation (match to a rule).

**A feature supported only by automatic annotation is weaker than one with
experimental evidence.** Report the evidence when the claim depends on it.

## What to extract

| Need | Field |
|---|---|
| Sequence | `sequence.value`, with `length`, `mass`, `version` |
| Function | `proteinDescription`, `comments` (FUNCTION) |
| Domains/features | `features` (DOMAIN, REGION, SITE, MUTAGEN, VARIANT) |
| Subcellular location | `comments` (SUBCELLULAR LOCATION) |
| Interactions | `comments` (INTERACTION) |
| Variants | `features` (VARIANT) with clinical significance |
| Cross-references | `uniProtKBCrossReferences` (PDB, Ensembl, OMIM, ClinVar) |

## Variant interpretation

- UniProt variant annotations carry clinical significance and their source.
- **A variant annotated as "uncertain" is not benign.** Do not collapse
  categories.
- Cross-check with ClinVar and gnomAD; the databases disagree and the
  disagreement is informative.

## Batch operations

For many proteins: use the ID mapping service
(`https://rest.uniprot.org/idmapping`) and record the mapping job ID. Preserve
one-to-many mappings and the failed IDs; a missing result is not a failed
mapping.

## Reporting

State: the accession with its version, reviewed status, the isoform, the
annotations used with their evidence codes, the retrieval date, and any
cross-references relied upon (PDB, ClinVar) with their versions.

## Anti-patterns

- Using gene symbols as identifiers.
- Ignoring isoforms when the domain structure matters.
- Reporting a predicted/automatic annotation as experimental.
- Mixing canonical and isoform sequences in one analysis without saying so.
