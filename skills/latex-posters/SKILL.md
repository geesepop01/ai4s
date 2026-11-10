---
name: latex-posters
description: Build academic conference posters in LaTeX with proper layout, typography, and figure handling. Use when preparing a poster for a conference or symposium.
category: writing
tags: [poster, latex, tikz, conference, layout]
disable-model-invocation: true
---

# LaTeX Posters

A poster is read in 3–5 minutes by someone standing 1.5 meters away, often while
talking to you. Design for that reading, not for a page.

## Poster anatomy

| Block | Content | Space |
|---|---|---|
| Title + authors + affiliation | Large, readable at 3 m | Top, full width |
| Abstract / question | 2–3 sentences | Top-left |
| Background | Only what is needed | Small |
| Methods | The design in one diagram | One block |
| Results | 2–4 figures, the findings | The largest area |
| Conclusion | 3 bullets | Prominent |
| References / QR / contact | Small | Bottom |

**Three figures is usually the right number.** A poster with eight figures has
no findings.

## Layout

- **Columns** (2–4) read better than a single long flow. The eye tracks down a
  column then across.
- **Grid discipline.** Every block aligns to a grid. Misaligned blocks read as
  carelessness even when the science is right.
- **White space is content.** A poster that fills every square centimeter is
  unreadable.
- **Visual hierarchy:** the conclusion block should be findable in 10 seconds.

## Typography

- **Title:** 72–96pt equivalent.
- **Section headers:** 36–48pt.
- **Body:** 24–32pt. **Never below 20pt.** If it needs to be smaller, there is
  too much on the poster.
- **One typeface family**, two weights maximum. Sans-serif reads better at
  distance.

## Figures

- Figures are generated at high resolution and **scaled to the poster**, so
  labels are designed for the poster size, not for the paper.
- Axis labels need to be legible at distance: thicker lines, larger markers,
  larger fonts than a paper figure.
- Colorblind-safe, and test the poster in grayscale — many viewers will read it
  that way.

## Build

**TikZ/Beamer poster**, **TikZ poster package**, **baposter**, or
**tcolorbox** layouts all work. Whichever you use:

- Build the whole poster from a script so it is reproducible. Figure generation
  and layout live in the same repository as the analysis.
- Compile to PDF, then **read the PDF at 100% and at viewing distance**. Zoom out
  until the text is unreadable; if the structure is not clear at that size, the
  layout is wrong.
- Print a single-page test at reduced size before the full-size print.

## Before you send it to print

- [ ] Title and conclusion readable at 3 meters.
- [ ] Body text readable at 1.5 meters.
- [ ] No figure with labels smaller than the body text minimum.
- [ ] Every number traces to a result file.
- [ ] QR code (if any) actually scans from a phone at arm's length.
- [ ] PDF is the correct physical dimensions (A0/A1/36×48 in) with bleed if required.
- [ ] Fonts embedded in the PDF.
