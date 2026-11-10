---
name: markitdown
description: Convert documents to markdown for reading and analysis — PDF, DOCX, PPTX, XLSX, HTML, and images. Use when document content must be extracted into text a pipeline can use.
category: data-engineering
tags: [documents, conversion, pdf, docx, extraction, markdown]
disable-model-invocation: true
---

# MarkItDown

Document text extraction is lossy and format-dependent. Doing it deliberately
means knowing what the extractor preserves and what it drops.

## The tool

```python
from markitdown import MarkItDown

md = MarkItDown()
result = md.convert("report.pdf")
print(result.text_content)

# With an LLM for images (optional, requires a client)
result = md.convert("figure.png", llm_client=client, llm_model="...")
```

```bash
markitdown report.docx > report.md
markitdown slides.pptx -o slides.md
```

## What each format preserves

| Format | Preserved | Dropped |
|---|---|---|
| DOCX | Text, headings, tables, lists | Layout, exact formatting, some images |
| PPTX | Slide text, notes, table content | Slide layout, positioned graphics |
| XLSX | Cell values, sheet names | Formulas (values only), formatting, charts |
| PDF | Text (if text-layer), tables (heuristically) | Layout; scanned PDFs need OCR |
| HTML | Text, structure | Styles, scripts |
| Images | Nothing without OCR/LLM | Everything without a vision step |

**A scanned PDF has no text layer.** Extraction returns nothing or garbage; use
OCR (Tesseract, PaddleOCR) and record that OCR was applied.

## Preserving structure

- **Tables** are the fragile part. Extracted tables often lose column alignment
  or header association. Verify any number that comes from a table against the
  original.
- **Headings** map to markdown levels; check that the nesting is right before
  relying on the outline.
- **Footnotes and references** may be separated from their call sites.

## When extraction accuracy matters

If a number in a report depends on extracted text:

1. **Extract to markdown**, then locate the exact source region.
2. **Verify the extracted value against the original document** (open the PDF
  page or the DOCX). Extraction is not evidence; the document is.
3. **Record the page/slide/sheet** the value came from, and the extraction tool
  and version.

## Batch workflows

```python
from pathlib import Path
from markitdown import MarkItDown

md = MarkItDown()
for path in Path("papers").glob("*.pdf"):
    out = path.with_suffix(".md")
    try:
        out.write_text(md.convert(str(path)).text_content)
    except Exception as e:
        print(f"FAILED {path}: {e}")       # failures are records, not silence
```

Record which conversions succeeded and which failed. A corpus with silently
missing documents biases any analysis of it.

## Alternatives and complements

- **PDF layout matters** → `pymupdf4llm`, `pdfplumber` (table extraction).
- **Scanned documents** → OCR first (`pytesseract`, PaddleOCR).
- **Scientific PDFs with equations** → GROBID, or LaTeX-aware extraction.
- **Spreadsheets as data** → read directly with `openpyxl`/`pandas` rather than
  converting to markdown.

## Rules

- Never report a number extracted from a document without verifying it against
  the document.
- Record the extraction tool and version for any corpus.
- Track extraction failures explicitly.
- For scanned input, state that OCR was used and its accuracy on a sample.
