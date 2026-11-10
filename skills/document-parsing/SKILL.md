---
name: document-parsing
description: Parse and extract content from documents — PDF, DOCX, PPTX, XLSX — with structure preservation and verification. Use when document content must enter an analysis pipeline.
category: data-engineering
tags: [documents, pdf, docx, pptx, xlsx, extraction]
---

# Document Parsing

Document extraction is lossy. Knowing what each format preserves — and
verifying extracted numbers against the source — is what makes extraction safe.

## Format specifics

| Format | Tool | Preserves | Loses |
|---|---|---|---|
| PDF | `pymupdf4llm`, `pdfplumber`, `markitdown` | Text, tables (heuristic) | Layout; scanned needs OCR |
| DOCX | `python-docx`, `markitdown` | Text, headings, tables | Formatting, some images |
| PPTX | `python-pptx`, `markitdown` | Slide text, notes | Layout, positioned graphics |
| XLSX | `openpyxl`, `pandas` | Cell values, formulas (openpyxl) | Charts, formatting |

```python
import fitz  # PyMuPDF
doc = fitz.open("report.pdf")
page = doc[0]
print(page.get_text())
tables = page.find_tables()      # table extraction
```

## Tables (the fragile part)

- **Table extraction is heuristic.** Merged cells, multi-level headers, and
  column misalignment are common failures.
- **Verify any number from a table against the original.** Extraction is not
  evidence; the document is.
- **`pdfplumber`/`camelot`** for tables where structure matters; compare
  outputs.

## Scanned documents

- **No text layer.** OCR is required (Tesseract, PaddleOCR).
- **OCR is error-prone**, especially on numbers. Verify extracted numbers
  manually or with a second OCR pass.
- **Record that OCR was applied** and its accuracy on a sample.

## Verification discipline

If a reported number comes from a document:

1. Extract to text/markdown.
2. Locate the exact source region (page, table cell).
3. **Open the original and confirm the value.**
4. Record the page/sheet location and the extraction tool/version.

## Structure preservation

- **Headings → outline.** Verify the nesting is correct before relying on it.
- **Footnotes and references** may separate from their call sites.
- **Cross-references** ("see Table 3") need the tables extracted and numbered.

## Batch workflows

Record which conversions succeeded and which failed. A corpus with silently
missing documents biases any analysis of it. Log failures explicitly.

## Reporting

State: the extraction tool and its version, the OCR status and its accuracy,
the verification of any extracted number against the source, the location
(page/sheet) of each extracted value, and the extraction failures encountered.

## Anti-patterns

- Reporting an extracted number without verifying it against the document.
- Trusting table extraction on a complex layout.
- Ignoring that a scanned PDF has no text layer.
- Silent extraction failures leaving a partial corpus.
