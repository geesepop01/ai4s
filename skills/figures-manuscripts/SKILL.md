---
name: figures-manuscripts
description: Produce figures, schematics, and manuscripts that survive a real reading. Use before drafting any paper, report, poster, or figure — it routes data plots to matplotlib, diagrams to generated images, and runs the mandatory render-then-inspect pass that catches clipped labels and broken references.
category: writing
tags: [figures, manuscripts, visualization, writing, publication, schematics]
---

# Figures and Manuscripts

A figure that is wrong at the size someone reads it is a wrong figure. This skill
covers the two halves that most often get skipped: routing the right kind of
image to the right renderer, and actually looking at the output before shipping.

## Route the image to the right renderer

| Kind of image | Render with | Never |
|---|---|---|
| Plots of measured data (scatter, bar, box, heatmap, line + CI, ROC) | matplotlib / seaborn via `scientific-visualization` | invent data to fill a plot |
| Distributions, residuals, diagnostics | matplotlib | smooth away what the data shows |
| Schematics, diagrams, workflow illustrations, graphical abstracts | an image-generation path, or a clean diagram tool | hand-draw raw SVG/TikZ/Graphviz unless the user wants the source |
| Molecular / structural figures | a structure viewer or `cheminformatics` / `biopython` tooling | sketch a structure freehand |
| Tables of numbers | a real table in the document | screenshots of tables |

A generated image is never evidence. Plots of data come from the data; a
schematic is labelled as a schematic.

## The render-then-inspect pass is mandatory

After the document compiles or the figure renders:

1. Open **every page and every figure at its intended reading size** — not a
   thumbnail, not a zoomed-out spread.
2. Fix overlapping labels, clipped content, unreadable text, missing legends, and
   inconsistent units before delivery.
3. Check every cross-reference, citation key, figure number, and table number
   resolves — a broken reference is a broken document.
4. Re-read after fixing. An edit after a check voids the check.

If image generation is unavailable, leave a placeholder with the planned caption,
say once what would enable it, and do not draw the figure by hand or call the tool
again hoping for a different result.

## Sizing the work to the request

A report of work done in this session is built from the session's own evidence —
results, logs, tracked runs, files. It cites outside work only where the text
needs it, and only those references are verified.

A manuscript for submission gets the full treatment:

- a literature review from verified primary sources covering the nearest
  competing work and the foundations of the argument;
- a claim audit against sources and results — every claim in the text traces to a
  source or a result;
- named missing comparisons, not a silent omission;
- explicit scope reductions where the evidence does not generalize.

Load the relevant writing, venue, citation, and figure skills before drafting:
`academic-writing` for structure and citations, `literature-search` for verified
sources, `statistical-analysis` for the numbers behind the results, and
`scientific-visualization` for the plots.

## Figure hygiene checklist

Before calling any figure done:

- [ ] Title and axis labels present, with units.
- [ ] Legend readable and not covering data.
- [ ] Colors distinguishable, colorblind-safe where the audience needs it.
- [ ] Font size legible at final print/display size.
- [ ] Error bars / confidence intervals defined in the caption.
- [ ] Caption states what is plotted, from what data, with what n.
- [ ] No chartjunk: no 3-D decoration, no truncated axis hiding an effect, no
      dual axis unless unavoidable and labelled.
- [ ] The figure supports a claim that appears in the text, and the text cites it.

## Manuscript checklist

- [ ] Abstract states question, method, result (with number), and scope.
- [ ] Every in-text citation resolves to a reference and vice versa.
- [ ] Every figure and table is referenced in the text.
- [ ] Methods are sufficient to reproduce: data source, split, seeds, model and
      version, statistical test with assumptions.
- [ ] Limitations section states what the data do not cover.
- [ ] Data and code availability points at real artifacts.
- [ ] The document compiles/renders cleanly and every page has been read.
