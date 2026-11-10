---
name: scientific-databases
description: Query public scientific databases over REST — UniProt, PDB, Ensembl, NCBI PubMed/GEO/ClinVar, arXiv, OpenAlex, Crossref, ChEMBL, PubChem, STRING, Reactome, gnomAD, GWAS Catalog, GTEx, openFDA, and more. Use a bundled script or direct HTTP for real literature, variant, expression, and molecular data.
category: databases
tags: [databases, api, literature, bioinformatics, chemistry, rest, uniprot, pubmed, variants, genomics]
disable-model-invocation: true
---

# Scientific Databases

## Overview

This skill gives you **real data access**. Never invent a citation, an accession,
a sequence, or a molecular property when one of these services can answer it.

Two ways to query:

1. **The bundled script** — fastest path for the common cases, tested and working.
2. **Direct HTTP** — for anything the script does not cover, or when you want the
   raw payload. Use `web_fetch`, `curl`, or Python `urllib`.

## The bundled script

Location is relative to this skill's directory:

```
scripts/query_db.py
```

```bash
python scripts/query_db.py --list                      # available databases
python scripts/query_db.py uniprot TP53
python scripts/query_db.py pubmed "CRISPR off-target" --limit 5
python scripts/query_db.py pdb 1TUP --json             # raw payload
python scripts/query_db.py string "TP53,MDM2"
```

It is standard-library only (uses `certifi` when present), retries transient
failures, and falls back to an unverified TLS context only if the local CA bundle
is broken — it prints a warning when it does.

Exit codes — `0` success, `2` bad arguments, `3` database documented as
unreliable, `4` HTTP error, `5` network or parse failure.

## Verified endpoints

All of the following were confirmed working. Treat this as the allow-list.

| Database | Script key | Endpoint |
|---|---|---|
| UniProt | `uniprot` | `https://rest.uniprot.org/uniprotkb/search?query=…&format=json` |
| RCSB PDB | `pdb` | `https://data.rcsb.org/rest/v1/core/entry/{id}` |
| Ensembl | `ensembl` | `https://rest.ensembl.org/lookup/symbol/homo_sapiens/{symbol}?content-type=application/json` |
| PubMed | `pubmed` | `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=…&retmode=json` |
| GEO | `geo` | `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gds&term=…&retmode=json` |
| arXiv | `arxiv` | `https://export.arxiv.org/api/query?search_query=all:{term}&max_results=N` |
| OpenAlex | `openalex` | `https://api.openalex.org/works?search=…&per-page=N` |
| Crossref | `crossref` | `https://api.crossref.org/works?query.bibliographic=…&rows=N` |
| ChEMBL | `chembl` | `https://www.ebi.ac.uk/chembl/api/data/molecule/search?q=…&format=json` |
| PubChem | `pubchem` | `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{name}/property/…/JSON` |
| STRING | `string` | `https://string-db.org/api/json/network?identifiers=…&species=9606` |
| Reactome | `reactome` | `https://reactome.org/ContentService/search/query?query=…&species=Homo%20sapiens` |

## Endpoints that failed here, and their fallbacks

Do not waste turns rediscovering these. Each was attempted and rejected.

| Database | Symptom | Fallback |
|---|---|---|
| KEGG (`rest.kegg.jp`) | Connection timed out | Use Reactome for pathway coverage, or the KEGG web UI |
| ClinicalTrials.gov | HTTP 403 from both `/api/v2/studies` and the v1 endpoint | Use `web_fetch` on the study page URL |
| Semantic Scholar | HTTP 429 without an API key | Use OpenAlex or Crossref instead |

ClinicalTrials.gov and Semantic Scholar are not broken services — they are
blocked or throttled from this network. If you have an API key, retry with it.

## Extended endpoint coverage

Beyond the twelve script keys above, these public REST endpoints cover the
variant, expression, clinical, preprint, and structural gaps. Verify each with a
small query before relying on it; this table is a starting map, not a guarantee
of availability from every network.

| Need | Source | Entry point |
|---|---|---|
| Clinical significance of a variant | ClinVar | NCBI E-utilities `db=clinvar`, or `https://api.ncbi.nlm.nih.gov/variation/v0/refsnp/{rsid}` |
| Population allele frequency | gnomAD | `https://gnomad.broadinstitute.org/api` (GraphQL) |
| Gene–trait associations | GWAS Catalog | `https://www.ebi.ac.uk/gwas/rest/api/singleNucleotidePolymorphisms/{rsid}` |
| Tissue expression | GTEx | `https://gtexportal.org/api/v2/expression/medianGeneExpression` |
| Drug labels, adverse events, recalls | openFDA | `https://api.fda.gov/drug/{label,adverse,event,enforcement}.json?search=…` |
| Trial registry | ClinicalTrials.gov | `https://clinicaltrials.gov/api/v2/studies?query.cond=…` (see fallback note above) |
| Preprints | bioRxiv / medRxiv | `https://api.biorxiv.org/details/{server}/{doi}/na/json` |
| Protein structure predictions | AlphaFold DB | `https://alphafold.ebi.ac.uk/api/prediction/{uniprotAccession}` |
| Single-cell dataset discovery | CELLxGENE Discover | `https://api.cellxgene.cziscience.com/curation/v1/datasets` |
| Public data archive metadata | Zenodo | `https://zenodo.org/api/records?q=…` |
| Cancer genomics | GDC | `https://api.gdc.cancer.gov/cases` (public metadata; controlled files need authorization) |
| Protein families / domains | InterPro | `https://www.ebi.ac.uk/interpro/api/entry/all/protein/uniprot/{accession}` |
| Functional enrichment | g:Profiler / Enrichr | `https://biit.cs.ut.ee/gprofiler/api/gost/profile/`, `https://maayanlab.cloud/Enrichr/addList` |

**Coverage note.** Some connector ecosystems expose hundreds of curated
operations over these same sources (BioMart queries, LD proxy lookup, HMMER and
InterProScan job submission, pathway graph export). This skill hands you the
underlying REST access; where a heavier operation matters, say so and either
script it directly or fall back to the source's web UI.

## Interpreting results without fooling yourself

Every large database response carries the same traps. Check all of these before
you summarize a result.

- **Pagination and truncation.** A page is not the whole result. Read the
  returned-count versus total-count fields, follow the next-page cursor or offset
  until exhaustion, and record `is_complete` or `has_more` explicitly. A summary
  computed over page one is not a summary of the query.
- **Empty versus error versus partial.** A true zero-hit, an `ok:false`, a
  rate-limit, and a truncated response are four different outcomes. Do not loosen
  filters to manufacture a hit; report the empty result as a finding.
- **Total versus returned.** Keep `total_records` and `returned_records` distinct.
  A preview row does not describe the distribution of the whole set.
- **One-to-many mappings.** Identifier mapping (gene→protein, rsID→placements) is
  not injective. Preserve every mapping and any explicitly reported failed IDs;
  a missing page is not a failed match.
- **Versions and assemblies.** Keep the reference assembly, database release, and
  accession version alongside every coordinate. Do not mix assemblies or fold
  several placements into one.
- **Observation is not causation.** An interaction, co-occurrence, association,
  or enrichment p-value is not a mechanistic or clinical conclusion. Report the
  evidence type with the claim.
- **Counts are not rates.** Adverse-event report counts, literature counts, and
  cohort row counts are not incidence, risk, or biological replicate counts.

## Recipes beyond the script

### E-utilities pipeline (PubMed, GEO, Gene, ClinVar)

Search then summarize:

```python
import json, urllib.request, urllib.parse

def eutils(path, **params):
    params.setdefault("retmode", "json")
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/" + path + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=60) as r:
        return json.load(r)

hits = eutils("esearch.fcgi", db="pubmed", term="TP53 AND cancer", retmax=5)
ids = hits["esearchresult"]["idlist"]
summary = eutils("esummary.fcgi", db="pubmed", id=",".join(ids))
for pmid, rec in summary["result"].items():
    if pmid != "uids":
        print(pmid, rec["title"])
```

`efetch.fcgi` returns abstracts (`rettype=abstract&retmode=text`).

Genomic sequence or a variant record:

```python
eutils("efetch.fcgi", db="nucleotide", id="NM_000546", rettype="fasta", retmode="text")
eutils("esearch.fcgi", db="clinvar", term="BRCA1[gene] AND pathogenic[clinsig]")
```

### Pagination and size limits

- **UniProt** — use `size=` (max 500) plus `cursor` for the next page.
- **OpenAlex** — `per-page` (max 200) plus `page=` or `cursor=*`.
- **Crossref** — `rows` plus `offset`; always pass `select=` to shrink the payload.
- **E-utilities** — `retmax` plus `retstart`; above ~200 ids prefer history mode
  (`usehistory=y`) rather than one long id list.

## Etiquette

1. **Send a real User-Agent** with contact info — NCBI and Crossref expect it.
2. **Do not hammer.** Space requests, and reuse a result instead of re-fetching.
3. **Cache raw responses to disk.** Write the payload to a file before parsing so
   a re-analysis does not re-hit the network.
4. **Record provenance for every number you report** — service, query string,
   accession, and retrieval date. A result you cannot trace is not a result.
5. **Cite the source database** in your write-up (UniProt, PDB, Ensembl, NCBI,
   Reactome, STRING, ChEMBL, PubChem all require attribution).

## Integrity rules

- Never fabricate an accession, DOI, PMID, sequence, or property value.
- If a query returns nothing, report that — do not substitute a plausible value.
- Distinguish "the database says X" from "the literature says X" from "I computed X".
- When a database contradicts your computed result, report both.
- Record the exact query, service, and retrieval date next to every number you
  report. A response that supports a step does not by itself complete the step:
  saving records, downloading files, and validating content are separate actions.
- A file listing is metadata, not a downloaded file. Confirm size and checksum
  after any download before analyzing it.
