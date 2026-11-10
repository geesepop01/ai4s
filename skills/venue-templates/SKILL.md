---
name: venue-templates
description: Format manuscripts, abstracts, posters, and slides to a target venue's template and style rules. Use when preparing a submission where the venue's format is part of what is graded.
category: writing
tags: [venue, templates, formatting, submission, latex]
---

# Venue Templates

A submission that ignores the venue's template is a submission that signals the
author did not read the instructions. This skill is the fit-to-template process.

## The venue record

Before writing, capture the venue's requirements:

```markdown
# Venue: <name, year>

Type: <journal article | conference paper | abstract | poster | thesis>
Template: <official class file / Word template, with version>
Page limit: <N pages, and whether references/figures count>
Abstract: <word limit, structure>
Sections: <required order, any required headings>
Figures/tables: <placement rules, resolution, color policy>
Citations: <style: numeric | author-year | alphabetic; .bst or .csl file>
Anonymization: <double-blind? what must be removed>
Supplementary: <allowed? format? page limit?>
File format: <PDF via LaTeX | Word | platform upload>
Deadline and time zone: <exact>
```

## Fitting the template

1. **Start from the official class file**, not a reconstruction. Download the
   venue's `.cls`/`.bst`, Word `.dotx`, or Overleaf template as-is.
2. **Build early with placeholder content** to see the real page budget. A paper
   that compiles at 6 pages with stubs may compile at 11 with content.
3. **Respect the page limit as a hard constraint** from the first draft. Cutting
   from 11 to 8 at the end destroys the structure; writing to 8 preserves it.
4. **Figures count.** Check whether figures and references are inside or outside
   the limit, and design accordingly.
5. **Anonymization is checked, not assumed.** For double-blind: remove author
   names, acknowledgments, self-citations phrased as "our previous work", and
   identifying repository links. Check the PDF metadata too.

## Style rules by artifact

| Artifact | Priority |
|---|---|
| Journal article | Structure completeness, methods reproducibility, figure quality |
| Conference paper | Page discipline, contribution clarity, novelty positioning |
| Abstract | The exact word limit, structured headings if required, one result with a number |
| Poster | One message, large type, minimal text, one or two figures |
| Slides | One idea per slide, no paragraphs, legible from the back of the room |
| Thesis | Chapter structure, front matter, bibliography format, declaration |

## The compile-and-check pass

After the document is content-complete:

1. Compile from a clean state. Zero errors; understand every warning.
2. Read **every page at its intended size** (see `figures-manuscripts`).
3. Check: page limit, section order, figure/table numbering, references resolve,
   author block format, abstract word count.
4. Check the anonymization if double-blind, including metadata.
5. Export the exact file that will be submitted and open it. The submitted PDF is
   not the same object as the source tree.

## Common rejections that formatting would have prevented

- Over the page limit by one paragraph.
- Wrong citation style or unresolved citation keys.
- Author list or affiliation format wrong for the venue.
- Figures below the required resolution or in the wrong color mode.
- Supplementary material not linked or not in the required format.
- Anonymous submission with identifying information in the PDF metadata.
