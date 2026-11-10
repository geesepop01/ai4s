---
name: pdf-analysis
description: Work with PDFs — text extraction, layout analysis, tables, and figures. Use for PDF-based research, literature mining, and report generation.
category: data-engineering
tags: [pdf, extraction, layout, tables, literature]
---

# PDF Analysis

PDF is a presentation format, not a data format. Extracting meaning from it
requires respecting that its visual structure is not its logical structure.

## Tools

| Tool | Strength |
|---|---|
| PyMuPDF (`fitz`) | Fast, text + images + tables |
| pdfplumber | Precise text positions, tables |
| GROBID | Scientific PDFs → structured XML |
| pymupdf4llm | PDF → markdown |
| Camelot / Tabula | Table extraction |
| unpdf / pdf.js | Web-based text extraction |

## Scientific PDFs

- **GROBID** parses references, sections, and metadata reliably for papers. Use
  it for literature mining.
- **Two-column layout** breaks naive text extraction; use layout-aware tools.
- **Equations** extract as garbage; use LaTeX-aware tools (or read them) when
  they matter.

## Text extraction

```python
import fitz
doc = fitz.open("paper.pdf")
text = "\n".join(page.get_text() for page in doc)
# Layout-aware
text = fitz.open("paper.pdf")[0].get_text("blocks")
```

- **Reading order** matters for multi-column; naive extraction interleaves
  columns.
- **Hyphenation and line breaks** must be repaired for downstream text analysis.

## Tables and figures

- **Tables:** extract with `find_tables()`/`pdfplumber`, then verify against the
  page image.
- **Figures:** extract as images (`page.get_images()`) or render the region.
  Captions are usually adjacent text blocks.

## Metadata

- **Bibliographic metadata** (title, authors, DOI) — verify against the actual
  content; PDF metadata is often wrong.
- **DOI extraction** from the text or from `https://doi.org` links.

## Reproducibility

- Record the tool and version; extraction differs across tools.
- Save the raw extraction alongside derived data.
- Record failures; a corpus with silent gaps biases analysis.

## Reporting

State: the extraction tool and version, the layout handling (single/two-column),
the verification of extracted numbers, the metadata source, the failures, and
the page locations for cited content.

## Anti-patterns

- Trusting PDF metadata as the citation.
- Naive extraction on a two-column layout.
- Reporting a number extracted from a table without verification.
- Ignoring equations/scanned content.
