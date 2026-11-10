---
name: research-lookup
description: Find and retrieve specific papers, datasets, methods, or facts quickly and verifiably. Use for a targeted lookup where the answer must be sourced and traceable.
category: research
tags: [lookup, search, retrieval, verification, sources]
---

# Research Lookup

A lookup is a small research task with a hard requirement: the answer must be
sourced, and the source must be verifiable. "I recall" is not a lookup result.

## The lookup contract

For each item you are asked to find:

```
Question: <the specific thing to find>
Answer: <the fact, stated exactly>
Source: <title, authors, year, venue, DOI/URL>
Evidence: <the exact sentence/figure/table the answer comes from>
Confidence: <verified | source-located-not-read | not-found>
```

If you cannot fill the Evidence field with a specific location, the answer is
**not-found** or **source-located-not-read** — never "verified."

## Where to look, in order

1. **Direct identifiers.** If a DOI, PMID, arXiv ID, accession, or exact title is
   available, resolve it directly (doi.org, NCBI, arXiv, the source API). This
   is the only reliable route to a specific known item.
2. **Academic indexes.** OpenAlex, Crossref, PubMed, Google Scholar, Semantic
   Scholar (rate-limited), arXiv. Prefer the one that covers the field.
3. **Domain databases.** UniProt/PDB for proteins, GEO/SRA for omics, PDB for
   structures, ClinicalTrials.gov for trials, Zenodo/Figshare for datasets.
4. **Full text.** PMC, arXiv, publisher page, institutional repository. The
   abstract is not the paper; a claim that matters needs the full text.
5. **Web search.** Last resort for non-academic facts, and always with the URL
   recorded.

## Verification discipline

- **The abstract supports abstract-level claims only.** Methods details,
  numerical results, and limitations need the full text.
- **A citation in a paper is a lead, not evidence.** Follow it to the original.
- **Preprints are labelled.** Check whether a published version exists and cite
  that.
- **Retractions:** check the retraction status before citing anything older than
  a few years or anything in a contested area.
- **Conflicting sources:** record both, with what each shows. Do not pick the one
  you prefer and drop the other.

## Reading at the right depth

Size the reading to the request:

- **Factual lookup** (a number, a definition, an accession): abstract or the
  specific table is enough — but you must actually see it.
- **Method lookup** (how was this done): the methods section, in full.
- **Claim verification** (does the literature support X): the results and the
  discussion, plus the nearest competing work.
- **Systematic question** (what is known about X): the full `literature-search`
  skill applies.

## Recording

Every lookup writes to `lookups.md`:

```markdown
## <the question>
- Answer: ...
- Source: <full citation>
- Evidence: <"Table 2, row 5: 3.2 ± 0.4 (n=12)" — quoted or precisely located>
- Retrieved: 2026-10-22
- Confidence: verified
```

This file is the audit trail. A number that reaches a report has a line in it.

## Anti-patterns

- Citing from memory. Always.
- Reporting an abstract's claim as a finding.
- Dropping a conflicting source.
- Citing a review where the primary source is available.
- "Not found" reported as "does not exist."
