---
name: geo-database
description: Query NCBI GEO for gene expression data — datasets, series matrices, sample metadata, and reanalysis. Use for retrieving and correctly using public expression data.
category: databases
tags: [geo, expression, ncbi, microarray, rnaseq]
disable-model-invocation: true
---

# GEO

GEO holds expression data with highly variable metadata quality. The
difference between a usable reanalysis and a garbage one is the sample metadata.

## E-utilities

```python
import json, urllib.request, urllib.parse

def eutils(path, **params):
    params.setdefault("retmode", "json")
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/" + path + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=60) as r:
        return json.load(r)

hits = eutils("esearch.fcgi", db="gds", term="autism AND expression profiling", retmax=10)
ids = hits["esearchresult"]["idlist"]
summary = eutils("esummary.fcgi", db="gds", id=",".join(ids))
```

**Accession types:** `GSE` (series), `GSM` (sample), `GPL` (platform), `GDS`
(dataset). Each is a different level; do not mix them.

## Getting the data

- **Series matrix** (`GSE..._series_matrix.txt.gz`) — the processed matrix with
  sample characteristics. This is what most reanalyses use.
- **RAW data** — the submitted files (CEL, FASTQ); required for a
  from-scratch reprocessing.
- **Supplementary files** — often carry the actual data or the normalized values.
- **SRA links** — for sequencing data, the raw reads are in SRA, not GEO.

## Sample metadata (the critical step)

The `series_matrix` header carries sample characteristics (`!Sample_characteristics_ch1`),
but:

- **Metadata is free text** and inconsistent across samples and submitters.
- **Parse it into structured columns** and inspect the mapping. "control",
  "Control", "healthy", "unaffected" may be the same or different groups.
- **Check for batch** (submission date, lab, platform) and whether it is
  confounded with the condition.
- **Check n per group after mapping.** A series may list 30 samples but only 20
  have usable labels.

## Reanalysis discipline

1. **Confirm the platform** (GPL) and its annotation version. Probes map to genes
   differently across annotation releases.
2. **Normalization** is usually already done in the series matrix; do not
   re-normalize blindly. State what the submitter did.
3. **Probe-to-gene mapping** with the correct annotation; handle multi-mapping
   probes.
4. **Batch correction** (ComBat, limma) if multiple platforms or labs; state the
   method.
5. **Independent validation.** A finding in one GSE is not a finding; validate in
   an independent GSE.

## Reporting

State: the accession (GSE) and the samples used (GSM list), the platform and
annotation version, the data level used (series matrix vs raw vs supplementary),
the metadata mapping you applied (and its ambiguities), the normalization and
batch correction, the number of samples per group after filtering, and the
independent validation dataset.

## Common errors

- Treating free-text characteristics as labels without checking them.
- Ignoring batch confounded with condition.
- Re-normalizing already-normalized data.
- Using the wrong probe-to-gene annotation.
- Claiming a finding from one dataset with no independent validation.
