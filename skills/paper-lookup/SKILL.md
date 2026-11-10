---
name: paper-lookup
description: Locate, download, and read a specific paper for evidence. Use when a particular paper must be read in full before a claim is made about it.
category: research
tags: [papers, retrieval, pdf, reading, evidence]
---

# Paper Lookup

Reading the paper is a distinct step from finding it. This skill covers getting
the actual paper and extracting the evidence from it, not the citation around it.

## Getting the paper

In order of preference:

1. **Direct identifier resolution.** `https://doi.org/<DOI>` resolves to the
   publisher page. `https://arxiv.org/abs/<id>` for preprints. PubMed/PMC IDs via
   NCBI.
2. **Open access mirrors.** PMC (`pmc.ncbi.nlm.nih.gov`), arXiv, Europe PMC,
   institutional repositories, Unpaywall (`api.unpaywall.org/v2/<doi>`).
3. **Publisher page** for the version of record, when accessible.
4. **Author pages / preprint servers** as a fallback, noting which version you read.

**Record which version you read:** preprint vs accepted manuscript vs version of
record. They can differ in numbers.

## Extracting evidence

Do not summarize the whole paper when the task needs one claim. Extract:

```
Claim I am checking: <exact statement>
Paper: <full citation + version read>
Where: <section / page / figure / table, exact>
What it shows: <the result, with its numbers and n>
What it does not show: <the scope limit — population, conditions, methods>
Contradictions or caveats the authors state: <verbatim where they matter>
```

**The "what it does not show" field is the one people skip and the one that
prevents over-claiming.** A study in 12 adults does not support a claim about
children; a study in vitro does not support a clinical claim.

## Reading depth by purpose

| Purpose | Read |
|---|---|
| Verify a specific number | The table/figure and its caption + methods for n and test |
| Verify a method claim | Methods in full, including parameters |
| Position your work against it | Abstract + results + discussion + the limitation paragraph |
| Reproduce its analysis | Methods + supplementary + code/data availability |
| Check whether it supports your citation | The exact sentence you intend to cite it for |

## Version and identity hygiene

- Cite the **published version** when one exists; note the preprint only if the
  published version is not what you read.
- **Check for corrections and retractions** before citing, especially for
  clinical or high-stakes claims.
- **Author lists are long and order matters.** Copy from the paper, not from
  memory or from a secondary citation.
- **Supplementary materials often carry the actual method.** If the main text
  says "see supplementary," read the supplementary.

## Recording

Every paper read gets an entry in `papers_read.md`:

```markdown
## <FirstAuthor Year> — <short title>
- Full citation + DOI
- Version read: version of record / preprint vX / accepted manuscript
- Retrieved: date, source URL
- Claims checked: <list>
- Evidence extracted: <the specific findings with numbers>
- Scope limits: <what the paper explicitly does not cover>
- Use in this project: <which claim in our text this supports>
```

## Anti-patterns

- Citing a paper you have only seen the title of.
- Quoting the abstract's wording as the paper's finding.
- Reading a preprint and citing it as the published result.
- Skipping the supplementary and then claiming the method is unclear.
- Citing a paper for a claim it makes in passing but does not support with data.
