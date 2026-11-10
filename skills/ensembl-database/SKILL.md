---
name: ensembl-database
description: Query Ensembl for genome annotation, variants, comparative genomics, and regulatory data. Use for genomic coordinates, gene models, and cross-species analysis.
category: databases
tags: [ensembl, genome, annotation, variants, comparative-genomics]
---

# Ensembl

Ensembl is the reference for genome annotation and coordinate systems. Its API
is fast and comprehensive — and its coordinate conventions are the most common
source of off-by-one errors in genomics.

## The REST API

```python
import requests

base = "https://rest.ensembl.org"
headers = {"Content-Type": "application/json"}

# Gene lookup
r = requests.get(f"{base}/lookup/symbol/homo_sapiens/TP53",
                 headers=headers, params={"expand": 1}).json()
print(r["id"], r["start"], r["end"], r["assembly_name"])

# Sequence
r = requests.get(f"{base}/sequence/id/ENSG00000141510",
                 headers=headers, params={"type": "cds"}).text

# Variants in a region
r = requests.get(f"{base}/overlap/region/human/17:7668402-7687550",
                 headers=headers, params={"feature": "variation"}).json()
```

## Coordinates (read this every time)

- **Ensembl is 1-based, inclusive** `[start, end]`.
- **BED and BAM are 0-based, half-open** `[start, end)`.
- Converting: `bed_start = ensembl_start - 1`, `bed_end = ensembl_end`.

**Always record the assembly** (`GRCh38`, `GRCh37`, `T2T-CHM13`) and the
coordinate system alongside any coordinate. Mixing assemblies silently corrupts
every downstream analysis.

## Gene models

- **Gene → transcripts → translations.** A gene has many transcripts; which one
  is "the" sequence depends on your question. State the transcript ID (ENST)
  you used.
- **MANE Select** is the clinically relevant transcript; use it for clinical
  claims.
- **Biotype** (protein_coding, lncRNA, pseudogene) filters matter for any
  gene-set analysis.

## Variants

- **rsIDs map to placements**, not to a single position. One rsID can exist on
  multiple assemblies and loci. Preserve all placements.
- **Allele orientation** matters: forward vs reverse strand.
- **Population frequencies** from Ensembl come from gnomAD/1000G; cite the
  source and the population.
- **ClinVar significance** is a submission-based classification; submissions
  disagree. Report the aggregate and the submission count.

## Comparative genomics

- **Homology** (`/homology/id/`) returns orthologues and paralogues with
  confidence. Distinguish orthologue from paralogue; only orthology supports
  cross-species inference.
- **Alignments** (`/alignment/region/`) for conservation analysis; state the
  species set and the alignment method.
- **Assembly gaps and quality** differ across species; a "missing" region may be
  an assembly gap.

## Rate limiting and caching

- Cache responses to disk before parsing; re-analysis should not re-hit the API.
- Send a contact in the User-Agent; large requests should be batched through
  `/archive` or BioMart.

## Reporting

State: the Ensembl release number, the assembly and coordinate convention, the
transcript IDs used, the query date, the source of any frequency or clinical
significance, and the cross-species inference's basis (orthology, not homology).

## Common errors

- Off-by-one from mixing 1-based and 0-based coordinates.
- Coordinates compared across assemblies.
- Using a gene symbol when a transcript ID is needed.
- Treating a paralogue as an orthologue.
- Reporting one placement of a multi-mapping rsID as the position.
