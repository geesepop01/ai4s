---
name: patent-mining
description: Search and analyze patents for prior art, freedom to operate, and technology landscapes. Use when a research direction has an IP dimension or prior art must be assessed.
category: research
tags: [patents, prior-art, ipo, landscape, freedom-to-operate]
disable-model-invocation: true
---

# Patent Mining

Patents are a technical literature with a legal structure. Mining them requires
both a technical reading and an awareness of what a patent claim actually
covers — which is not the same as what the description discusses.

## Where to search

| Source | Coverage | Access |
|---|---|---|
| Google Patents | Broad, fast, good full-text search | Free |
| Espacenet (EPO) | Strong classification, family data | Free |
| USPTO PatFT/AppFT | US grants and applications | Free |
| WIPO PATENTSCOPE | PCT international applications | Free |
| Lens.org | Aggregated, scholarly + patent | Free |
| Derwent Innovation / Orbit / PatSnap | Professional analytics | Paid |

**Start with classification codes (CPC/IPC), not only keywords.** Patents use
deliberately unusual vocabulary; classification is how examiners find prior art.

## The search record

```markdown
# Patent search: <topic>

Question: prior art for X / FTO for product Y / landscape on Z
Databases searched: <names, date>
Classification codes: <CPC/IPC codes and their meaning>
Query strings: <exactly as run>
Filters: <jurisdiction, date range, status>
Results: <n retrieved, n screened, n relevant>
```

Record the query strings exactly — a patent search that cannot be repeated is
not a search.

## Screening

- **Title/abstract screen** first, then read the specification for anything that
  survives.
- **Family deduplication.** The same invention appears as a patent family across
  jurisdictions; count families, not documents.
- **Status matters.** Granted, pending, expired, abandoned, and lapsed have
  different implications. An expired patent is prior art but not a barrier.
- **Claims are what is protected.** Read the claims, not only the description.
  A broad description with narrow claims protects little.

## Prior art assessment

For each relevant document record:

```
Publication number + family + status
Priority date (this is the date that matters for prior art)
Applicant/assignee
Independent claims (quoted)
What the description teaches relevant to the question
Overlap with our work: <where specifically>
Differences: <where specifically>
```

**Priority date, not publication date,** determines what counts as prior art.

## Freedom to operate

FTO is a legal conclusion and **this skill does not provide one**. What it
provides is the technical landscape: which claims exist, what they read on, and
where the overlap is. A qualified patent attorney makes the FTO determination.
Say so explicitly in any deliverable.

## Landscape analysis

- **Trend:** filings per year by assignee and by classification.
- **Players:** who is filing, and in which subclasses.
- **White space:** classification areas with few filings adjacent to active ones.
- **Citation networks:** which patents cite which — reveals the lineage of an
  idea.

## Reporting rules

- Distinguish **what a patent claims** (the legal scope) from **what it
  describes** (the technical disclosure) from **what is actually enabled**.
- State the search date; patent databases change weekly.
- Cite publication numbers, not titles. Titles are not unique.
- Never state a legal conclusion (validity, infringement, FTO). Report the
  landscape and recommend counsel.
