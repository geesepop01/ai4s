---
name: database-api-access
description: Call foreign (English-language) scientific database REST APIs directly from this machine — PubMed, UniProt, Crossref, OpenAlex, PubChem, Ensembl, ClinVar, ClinicalTrials.gov, ChEMBL, RCSB PDB, AlphaFold, GEO, Reactome, STRING, ENA, KEGG — with a tested script, verified endpoints, rate-limit etiquette, and exact fallbacks when one is unreachable. Load this before any literature or database retrieval in a research preset.
category: databases
tags: [api, rest, pubmed, uniprot, literature, provenance, network]
disable-model-invocation: true
---

# Foreign database API access

This preset has no connector layer: **every foreign database is reached by the
agent issuing HTTP requests itself**. This skill is the working recipe. Do not
answer a database question from memory, and do not conclude "I cannot access
foreign databases" before running the self-check below.

## 0. Run the self-check first (one command)

The `skill` tool prints this skill's base directory. Call the script relative to
it, so the same command works from every workspace:

```powershell
# <skill base directory> is reported when this skill is loaded, e.g.
# C:\Users\hangj\.dsh\bundles\science-research-preset\skills\database-api-access
python "<skill base directory>\scripts\dbquery.py" check
```

`python` on this machine is `D:\anaconda3\python.exe` (Python 3.9; the script is
stdlib-only, so nothing needs installing). From this bundle the full path is:

```powershell
python "D:\Programs\DSH Desktop\sciencebuddy-preset-bundle\skills\database-api-access\scripts\dbquery.py" check
```

Copy the script path into a shell variable and reuse it for the session:

```powershell
$db = "D:\Programs\DSH Desktop\sciencebuddy-preset-bundle\skills\database-api-access\scripts\dbquery.py"
```

It prints `reachable`, `unreachable`, `unreachable_optional` and per-endpoint
latency. Report the matrix when a retrieval fails, so the failure is evidence
instead of a claim.

Verified working from this network (2026-10-28): PubMed/NCBI E-utilities, UniProt,
Crossref, OpenAlex, PubChem, Ensembl REST, ClinVar, ClinicalTrials.gov v2,
ChEMBL, RCSB PDB, AlphaFold DB, GEO, Reactome, STRING, ENA.

Known blocked: **rest.kegg.jp** (TCP timeout on both 80 and 443 — a network block,
not a bad URL). Do not retry it; use UniProt/Reactome cross-references and state
that the KEGG record is unavailable.

## 1. Query with the script

```powershell
# $db from section 0
python $db pubmed   "CRISPR base editing" --retmax 5 --save artifacts/db
python $db uniprot  "gene:TP53 AND organism_id:9606" --size 3
python $db uniprot  P04637
python $db crossref "single cell RNA-seq" --rows 3
python $db openalex "graph neural network" --per-page 3
python $db pubchem  aspirin
python $db ensembl  TP53
python $db clinvar  BRCA1 --retmax 3
python $db trials   "alzheimer" --page-size 3
python $db chembl   aspirin
python $db pdb      4HHB
python $db alphafold P04637
python $db geo      "EEG AND epilepsy" --retmax 3
python $db reactome TP53
python $db string   TP53
python $db ena      'study_title="epilepsy"'
```

Every call prints JSON with `retrieved_at`, the parsed `records`, and — with
`--save DIR` — writes the raw response to `DIR/<db>-<query>.json`. **A number or
accession in your answer must come from one of those files.** Default to
`--save artifacts/db` for anything you will cite.

Exit codes: `0` success, `2` request failed (JSON error on stderr naming the URL
and the HTTP status or network error).

## 2. Query a database this script does not cover

Use the same pattern instead of improvising a search:

```powershell
# NHGRI-EBI GWAS Catalog
(Invoke-RestMethod "https://www.ebi.ac.uk/gwas/rest/api/singleNucleotidePolymorphisms/search/findByRsId?rsId=rs7412" -TimeoutSec 30).rsId
# dbSNP / ClinVar / GEO / PMC — NCBI E-utilities, always with tool and email
Invoke-RestMethod "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=snp&term=rs7412&retmode=json&tool=dsh-sciencebuddy&email=$env:NCBI_EMAIL"
# OpenTargets GraphQL
Invoke-RestMethod "https://api.platform.opentargets.org/api/v4/graphql" -Method Post -ContentType 'application/json' -Body '{"query":"{ target(ensemblId:\"ENSG00000141510\"){ approvedSymbol } }"}'
```

In Python, `requests` is available (`D:\anaconda3\python.exe -c "import requests"`).
Biopython is **not** installed; do not `import Bio` without checking, and prefer
plain `requests` against the E-utilities endpoints.

## 3. Etiquette (getting blocked is a self-inflicted failure)

- NCBI: send `tool=` and `email=` (set `$env:NCBI_EMAIL`), at most 3 requests per
  second; batch ids into one `esummary` call instead of looping. Set
  `$env:NCBI_API_KEY` to raise the allowance to 10 requests per second — the script
  sends the key and paces every E-utilities call (0.34 s apart, 0.105 s with a key).
  A `429` is retried once, never in a loop.
- Crossref / OpenAlex: put a contact address in the query (`mailto=`); the script
  already sends `OPENALEX_MAILTO`, default `dsh-sciencebuddy@example.org`.
- Send a descriptive User-Agent (the script does).
- One retry with backoff for transient 5xx/429 is fine; a timeout is not worth a
  second identical call. Change endpoint or stop and report.

## 4. Provenance rules

Record, for every retrieved record you report:

| Field | Example |
|---|---|
| Database + endpoint | PubMed E-utilities `esummary` |
| Identifier **and version** | P04637 (sequence version 3), PMID 42943443 |
| Retrieval date/time | 2026-10-28T11:36+08:00 |
| Raw response file | `artifacts/db/pubmed-CRISPR_base_editing.json` |

- An accession without a version is not reproducible; a PMID without a fetched
  record is a fabrication risk.
- Reviewed (Swiss-Prot) vs unreviewed (TrEMBL) matters — say which.
- Preprints, retracted records and corrections must be flagged, not averaged in.
- If two databases disagree (e.g. ClinVar vs UniProt variant significance), the
  disagreement is a finding: report both.

## 5. Failure handling (read before retrying anything)

| Symptom | Action |
|---|---|
| `network error ... timed out` | Run `check`. If that endpoint is in `unreachable`, it is a network block: state it and use the documented fallback. Never retry the identical call. |
| `HTTP 429` | Lower the request rate (NCBI: set `NCBI_API_KEY`), batch ids; the script retries once then reports. |
| `HTTP 404` | The identifier is wrong or the record is not public — re-resolve the id (e.g. search by gene symbol first). |
| `HTTP 400` | Malformed query syntax for that API; read the API's own error text in the response body. |
| Empty `records` | A real negative result: record it as `missing` evidence in `01-evidence-table.md`, not as a tool failure. |

A tool or network failure is an execution error, never scientific evidence.

## 6. Where deeper domain guidance lives

Load the matching skill after (or alongside) this one — they carry identifier
discipline, evidence codes, and reporting rules per database:

`literature-search`, `paper-lookup`, `research-lookup`, `scientific-databases`,
`citation-management`, `openalex-database`, `uniprot-database`,
`protein-structure-databases`, `ensembl-database`, `clinvar-database`,
`clinicaltrials-database`, `geo-database`, `chembl-database`,
`pubchem-database`, `pharmacology-databases`, `reactome-database`,
`string-database`, `kegg-database`, `hmdb-database`, `brenda-database`,
`fda-database`, `opentargets-database`, `materialsscience-databases`,
`physics-databases`, `data-commons`, `curated-bio-datasets`, `patent-mining`,
`hugging-face-datasets`.

Load one, not five: the catalog line tells you which matches the question.
