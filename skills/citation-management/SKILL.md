---
name: citation-management
description: Manage citations, BibTeX, and reference integrity across a manuscript. Use when building a bibliography, fixing citation keys, deduplicating references, or verifying that every claim is attributed.
category: writing
tags: [citations, bibtex, references, bibliography, zotero]
---

# Citation Management

A bibliography is a data structure with integrity constraints. Managing it as one
is the difference between a manuscript that builds and one that breaks at
submission.

## The reference record

Every reference carries enough to identify it exactly:

```bibtex
@article{Smith2024,
  author    = {Smith, Jane and Doe, John and Lee, Wei},
  title     = {Exact title as published},
  journal   = {Journal Name},
  year      = {2024},
  volume    = {12},
  number    = {3},
  pages     = {45--67},
  doi       = {10.1234/abcd.1234},
  url       = {https://doi.org/10.1234/abcd.1234},
}
```

**The DOI is the primary key.** Volume/pages/year are metadata; the DOI is the
identity. Verify every DOI resolves before submission.

## Key naming convention

Pick one and keep it: `FirstAuthorYear` is the common default; disambiguate with
a suffix — `Smith2024a`, `Smith2024b` — in citation order, and keep the
suffixes stable across edits.

## Integrity constraints

1. **Every `\cite` key resolves to exactly one entry.** A missing key is a build
   failure, not a warning.
2. **Every entry is cited.** An uncited bibliography entry is a red flag in
   review.
3. **No duplicate entries.** The same paper under two keys is the most common
   bibliography bug. Deduplicate on DOI first, then on (first author, year,
   title).
4. **Titles and author lists are exact.** Do not paraphrase a title or reorder
   authors. Check against the source record.
5. **Preprints are labelled.** If the published version exists, cite the published
   version and note the preprint only where it matters.
6. **Retracted work is excluded**, and the retraction is noted if the retracted
   work is the subject of discussion.

## BibTeX hygiene

- Use a `.bib` file managed by one tool (Zotero, JabRef, Better BibTeX) rather
  than hand-editing across drafts.
- Normalize names: `Last, First and Last, First`, with `and` between authors.
  Never use commas as author separators.
- Strip brace-escaped capitals inconsistently; use a consistent style (`{RNA}` or
  `RNA` per the bibliography style).
- Encode special characters explicitly (`{\"o}`, `{\i}`) rather than relying on
  the source encoding.
- Keep one `.bib` per project; do not import a global one silently.

## Claim-to-source integrity

The text side of the constraint: every claim about prior work carries a
citation to the source that actually supports it.

- A claim you have not verified against the cited paper is fabrication risk.
  Fetch the paper and check the claim before citing it for that claim.
- Cite the **primary source** where one exists; a review is a pointer, not a
  substitute.
- Attribute to the right paper. A method described in a review but introduced in
  an earlier paper cites the earlier paper.
- Distinguish what a source *shows* from what it *claims* and from what you
  *infer*.

## Before submission

- [ ] Bibliography builds with zero warnings.
- [ ] Every key resolves; every entry is cited.
- [ ] No duplicates (DOI check).
- [ ] DOIs resolve.
- [ ] Author names and titles match the source records.
- [ ] Preprints labelled; retractions handled.
- [ ] Style consistent: initials vs full names, journal abbreviations, page ranges.
