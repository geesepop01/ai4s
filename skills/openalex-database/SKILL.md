---
name: openalex-database
description: Query OpenAlex for scholarly works, authors, institutions, and citation graphs. Use for literature landscape analysis and citation-network questions.
category: databases
tags: [openalex, citations, bibliometrics, literature, scholarly]
---

# OpenAlex

OpenAlex is an open, comprehensive catalog of scholarly works with citation
links. It is the right tool for bibliometrics and landscape questions, and a
strong complement to PubMed for literature search.

## The API

```python
import requests

# Works search
r = requests.get("https://api.openalex.org/works",
                 params={"search": "autism EEG biomarkers",
                         "filter": "from_publication_date:2020-01-01",
                         "per-page": 50}).json()

# Citation graph for a work
work = r["results"][0]
print(work["id"], work["cited_by_count"], work["referenced_works_count"])

# Author and institution
r = requests.get("https://api.openalex.org/authors/A5023888391").json()
```

## Entity types

`works`, `authors`, `sources` (journals/venues), `institutions`, `topics`,
`funders`, `publishers`. Each has its own query parameters and its own
resolution quirks.

## Topics and fields

OpenAlex's topic classification (4-level: domain → field → subfield → topic) is
automatic. It is useful for landscape analysis and imperfect for precise
screening. State that the classification is automated when it drives a result.

## Citation analysis

- **`cited_by_count`** is dynamic; record the retrieval date.
- **Citation counts are field- and age-dependent.** Normalize (citations per
  year, field-weighted) before comparing across fields or years.
- **`referenced_works`** gives the citation edges; this is how you build a
  citation network.
- **Citation is not quality.** A highly-cited paper may be highly cited for
  methodological criticism.

## Author and institution resolution

- **Author disambiguation** is automated and errors exist. For a precise
  author-level claim, verify the author's works manually.
- **Institutions** have multiple IDs over time (mergers, name changes); use
  ROR where possible.

## Landscape analysis

```python
# Publications per year in a field
r = requests.get("https://api.openalex.org/works",
                 params={"group_by": "publication_year",
                         "filter": "primary_topic.field.id:27"}).json()
```

- **Trend analysis:** count by year, with the filter stated exactly.
- **Top venues, top institutions, emerging topics.**
- **Co-authorship networks** from authorships.

## Reproducibility

- Record the exact query (filters, search string) and the retrieval date.
- OpenAlex data is updated continuously; a count retrieved today will differ
  tomorrow.
- Cache raw responses.

## Reporting

State: the query and filters exactly as run, the retrieval date, the entity
types and their automated classification caveats, the normalization applied to
citation counts, the known disambiguation limits for author-level claims, and
the distinction between a bibliometric trend and a scientific conclusion.

## Anti-patterns

- Comparing citation counts across fields or years without normalization.
- Treating the topic classification as ground truth for screening.
- Author-level claims from automated disambiguation without verification.
- Reporting a landscape trend as a scientific finding.
