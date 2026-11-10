---
name: infographics
description: Design scientific infographics and graphical abstracts that communicate a finding at a glance. Use when a result needs a visual summary for a paper, poster, press, or presentation.
category: visualization
tags: [infographic, graphical-abstract, visual-summary, design, communication]
disable-model-invocation: true
---

# Infographics

An infographic compresses a finding into something understood in seconds. Its
job is not to show everything; it is to show the one thing, accurately.

## The graphical abstract

A graphical abstract is a single image that answers: **what was done, what was
found, why it matters.**

Structure: left-to-right or top-to-bottom flow — question → approach → result →
implication. Three or four panels at most. The result panel carries the number.

**Rules:**

- The finding is the largest element. Not the logo, not the method diagram.
- One quantitative claim, with its unit and uncertainty. A graphical abstract
  with five numbers communicates none.
- Every visual element is data-accurate. An illustrative "arrow up" for an effect
  that was 2% is a lie in picture form.
- Text is labels, not prose. If it needs a sentence, it belongs in the figure
  caption or the paper.

## Design system

Establish once and reuse:

| Element | Rule |
|---|---|
| Color palette | 4–6 colors max; colorblind-safe; one accent color for the finding |
| Type | One family, two sizes (label and header) |
| Icons | One style, one stroke weight; not a collage of icon sets |
| Alignment | Everything on a grid; nothing floats |
| White space | At least 25% of the canvas left empty |

## Working with data vs. illustration

- **Data-driven infographics** (bar comparisons, dose-response curves, cohort
  flows) are generated from the actual numbers by script. Keep the script.
- **Illustrative infographics** (mechanism diagrams, workflow schematics) are
  drawn or generated, and labelled as schematic. They must not contradict the
  data.
- **Never draw data by hand.** A hand-placed bar is a fabricated data point.

## Generation approaches

1. **matplotlib + layout** — data panels composed into a grid; full control,
   reproducible.
2. **Generated imagery** for illustration — mechanism cartoons, schematic flows.
   Use an image generation tool; then verify no text or data is garbled.
3. **Vector composition** (SVG/Inkscape/Illustrator) — for a hand-designed poster
   or graphical abstract where the layout is the craft.

Whichever route: **render it, then look at it at the size it will be used.** A
graphical abstract that reads at 200% and collapses at 25% (the thumbnail size
in a journal table of contents) has failed.

## Checklist before shipping

- [ ] The finding is visually dominant and numerically exact.
- [ ] All text is legible at the intended size, including thumbnail.
- [ ] Colors distinguishable in grayscale and for colorblind viewers.
- [ ] No data element drawn by hand; every quantitative mark is generated.
- [ ] Schematics labelled as schematic; data panels labelled with n and units.
- [ ] Reads correctly in 5 seconds to someone who has not read the paper.
