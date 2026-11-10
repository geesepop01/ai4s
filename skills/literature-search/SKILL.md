---
name: literature-search
description: Systematic literature search and citation hygiene. Use for PRISMA-style reviews, database-specific query syntax, citation verification, and BibTeX management before writing anything that cites papers.
category: research
tags: [literature, prisma, citations, bibtex, search, review]
---

# Literature Search

## Overview

A literature stage that is not systematic produces a bibliography shaped by
recall bias. This skill defines the search, screening, and verification workflow.

**The single hardest rule** — never cite a paper you have not fetched. A plausible
looking citation assembled from memory is the most common form of fabrication in
AI-assisted research, and it is trivially avoidable.

## Decompose first

Split the topic into **3–5 facets**. Each facet becomes an independent search and
can be delegated to a separate `subagent` in parallel.

For "GRPO for LLM alignment":
1. the GRPO algorithm itself — original paper, variants, theory
2. alternatives — DPO, KTO, PPO, RLOO — and comparisons
3. real-world applications and empirical results
4. reward modelling and preference learning
5. critiques, replications, and known failure modes

Facet 5 (critiques and failures) is the one people skip and the one that most
often changes the conclusion.

## Where to search

Load the `scientific-databases` skill for exact endpoints. Coverage differs:

| Source | Best for | Verified |
|---|---|---|
| OpenAlex | broad scholarly search, citation counts | yes |
| Crossref | authoritative DOI and venue metadata | yes |
| arXiv | preprints in CS, physics, math, biology | yes |
| PubMed (E-utilities) | biomedical and life sciences | yes |
| Semantic Scholar | citation graph, TLDR summaries | rate-limited without a key |
| `web_search` | grey literature, docs, coverage gaps | yes |

Prefer **OpenAlex + Crossref** for metadata truth (DOIs, venues, years) and the
domain index for recall. Use `web_search` to find things indexes miss, then verify
anything it returns against a real record.

## Query construction

- **Boolean** — `AND`, `OR`, `NOT`; parenthesise every group.
- **Phrase** — double quotes force adjacency.
- **Field scoping** — PubMed uses `TP53[gene]`, `2020:2024[dp]`, `review[pt]`.
  OpenAlex uses `title_and_abstract.search=`.
- **Snowball** — after finding a seed paper, run backward (its references) and
  forward (who cites it) passes. Two rounds is usually enough to saturate.
- **Stop when saturated** — when a new query returns only papers you already have,
  stop. Record that you reached saturation.

Log every query you ran. An unreported query set cannot be audited.

## Screening

Apply explicit inclusion and exclusion criteria, and record counts at each step so
a PRISMA flow can be drawn.

```
identified (n=…)  →  deduplicated (n=…)  →  title/abstract screened (n=…)
    →  full text assessed (n=…)  →  included (n=…)
```

Deduplicate on DOI first, then normalised title plus first author plus year.
Different databases return the same paper with different identifiers.

## Verification — before the citation enters any document

For each paper you intend to cite:

1. **Fetch the record** from OpenAlex, Crossref, or the publisher.
2. Confirm the **title, first author, year, and venue** match what you wrote.
3. Confirm the **claim you attribute to it** actually appears in the abstract, and
   in the full text where possible.
4. Confirm it is **not retracted**.
5. Label preprints as preprints.

Anything unverified is either removed or explicitly marked as unverified.

## Delegating facets

When spawning `subagent` workers, give each a self-contained brief:

```
subagent(
  description: "Literature facet",
  prompt: "Find and verify real papers on <facet>. Use the literature-search and
  scientific-databases skills. Search at least OpenAlex and one domain index.
  For every paper, fetch the record and confirm title/author/year/venue before
  reporting. Return markdown: one bullet per finding, each with a full citation
  plus the exact claim it supports. Also return a BibTeX block and a list of
  queries you ran. Report contradictions between papers rather than resolving
  them. If you cannot verify a paper, omit it and say so."
)
```

Then **filter the returned facets** before merging:

- high relevance + high evidence → include at full weight
- high relevance + weak evidence → include with caveats
- low relevance → exclude, and note it under discarded facets
- contradictions → keep both sides, do not silently pick one

## Output artifact

Write `literature-review.md`:

```markdown
# Literature Review: <topic>

## Summary
2-3 paragraph synthesis across all facets.

## Key Findings by Facet
### <Facet 1>
- Finding, with citation.

## Methodological Consensus
What methods does the literature actually recommend?

## Contradictions and Open Questions
- Paper A claims X, Paper B claims Y. Unresolved.

## Discarded Facets
- <facet> — excluded because <reason>

## Complete References
BibTeX entries for every cited work.
```

## BibTeX hygiene

```bibtex
@article{key2024,
  author  = {Author, First and Author, Second},
  title   = {Exact Title As Published},
  journal = {Journal Name},
  year    = {2024},
  volume  = {10},
  number  = {3},
  pages   = {123--145},
  doi     = {10.xxxx/xxxxx}
}
```

- Use stable keys of the form `firstauthorYYYY`.
- Always include the DOI when one exists.
- Copy titles from the record, not from memory — capitalisation and subtitles drift.
- Escape characters that break LaTeX (`&`, `%`, `_`, `#`).
- For preprints use `@misc` with `eprint`, `archivePrefix`, and `primaryClass`.

## Anti-patterns

| Anti-pattern | Why it is fatal |
|---|---|
| Citing from memory | Produces plausible, non-existent papers |
| Single-database search | Systematic recall bias |
| Silently dropping contradictions | Manufactures false consensus |
| Treating a preprint as peer-reviewed | Overstates evidence quality |
| Citing a review for a primary claim | Second-hand attribution drift |
| No query log | The review cannot be audited or reproduced |
