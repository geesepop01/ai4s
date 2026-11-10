---
name: dna-visualization
description: Visualize DNA sequences, genome tracks, gene models, and sequence alignments. Use for genome browser-style figures, gene diagrams, and sequence-level plots.
category: visualization
tags: [dna, genome, tracks, alignments, genes, bioinformatics]
disable-model-invocation: true
---

# DNA Visualization

Sequence and genome figures have a specific job: let the reader see the
position, orientation, and relationship of features along a molecule. Clarity of
coordinates matters more than visual flourish.

## The toolkit

| Need | Tool |
|---|---|
| Gene models and genome tracks | `dna_features_viewer`, `pyGenomeTracks` |
| Interactive genome browsing | IGV, JBrowse |
| Alignments | `pymsa`, Jalview, or a rendered alignment image |
| Sequence logos | `logomaker`, `weblogo` |
| Circular maps (plasmids) | `pycirclize`, `dnacircular` |
| Reads/coverage | `samtools depth` → `matplotlib`, or IGV snapshots |

## Gene models and tracks (dna_features_viewer)

```python
from dna_features_viewer import BiopythonTranslator, GraphicFeature, GraphicRecord

features = [
    GraphicFeature(start=100, end=400, strand=+1, color="#ffd700", label="exon 1"),
    GraphicFeature(start=500, end=800, strand=+1, color="#ffd700", label="exon 2"),
    GraphicFeature(start=1200, end=1250, strand=-1, color="#ff6347", label="variant"),
]
record = GraphicRecord(features=features, sequence_length=2000)
ax, _ = record.plot(figure_width=10)
ax.figure.savefig("figures/gene_model.png", dpi=300, bbox_inches="tight")
```

## Coverage and alignment tracks

- **Coverage** is plotted as a filled track with the depth on the y-axis and a
  stated bin size. Always state the bin; a smoothed line hides what the bin chose
  to hide.
- **Read alignments** are shown as a pileup only when the question is about
  individual reads. Otherwise coverage + variant calls is clearer.
- **Strand** must be explicit — color, arrow direction, or a labelled track.
  Reverse-strand features drawn without orientation are misleading.

## Sequence logos

A sequence logo shows per-position information content and base frequency:

```python
import logomaker
import pandas as pd
counts = pd.DataFrame(align_array, columns=list("ACGT"))  # or amino acids
logo = logomaker.Logo(counts, color_scheme="classic", font_name="DejaVu Sans")
logo.ax.set_ylabel("bits")
logo.fig.savefig("figures/motif_logo.png", dpi=300)
```

State the alignment length, the number of sequences, and whether the logo is
information-content-scaled or frequency-scaled.

## Coordinate rules (this is where figures mislead)

- **State the assembly** (GRCh38, T2T-CHM13, mm39...) and the coordinate system
  (1-based inclusive vs 0-based half-open) in the caption. These are the most
  common source of a figure that disagrees with the table.
- **Include the version in the accession** where one exists (e.g. NM_000546.6).
- **Zoom level** is stated. A gene model at 5 kb and one at 500 kb look similar
  and mean different things.
- **Reverse-complement when comparing across strands** and say which strand is
  shown.

## Publication rules

- Font size legible at final print size; track labels are the most commonly
  undersized element.
- Consistent color coding across panels (same gene = same color everywhere).
- Scale bar with units (bp / kb / Mb).
- Every panel has a coordinate range and an assembly in the caption.

## Before shipping

- [ ] Assembly and coordinate convention stated.
- [ ] Scale bar and zoom level present.
- [ ] Strand orientation explicit.
- [ ] Colors consistent across panels; legend for any color-coded property.
- [ ] Track labels legible at final size.
- [ ] Variant/feature positions match the reported table exactly.
