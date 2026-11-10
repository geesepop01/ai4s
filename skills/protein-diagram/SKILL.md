---
name: protein-diagram
description: Draw protein schematics — domain architectures, secondary structure, topology, and interaction maps. Use when a figure must show protein organization rather than atomic structure.
category: visualization
tags: [protein, domains, schematic, topology, interactions]
disable-model-invocation: true
---

# Protein Diagram

A protein diagram shows organization, not atoms. Domain architecture, secondary
structure, topology, and interactions each need their own visual language.

## Domain architecture

The canonical form: a horizontal bar for the sequence, colored blocks for
domains, labelled with names and residue ranges.

```python
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

fig, ax = plt.subplots(figsize=(10, 2))
ax.add_patch(Rectangle((0, 0.4), 720, 0.2, color="#cccccc", label="backbone"))
for start, end, name, color in [
    (1, 120, "Signal", "#4c72b0"),
    (150, 320, "Kinase", "#dd8452"),
    (500, 700, "SH2", "#55a868"),
]:
    ax.add_patch(Rectangle((start, 0.35), end - start, 0.3, color=color))
    ax.text((start + end) / 2, 0.75, name, ha="center", fontsize=11)
    ax.text((start + end) / 2, 0.15, f"{start}–{end}", ha="center", fontsize=9)
ax.set_xlim(0, 720); ax.set_ylim(0, 1); ax.set_yticks([])
ax.set_xlabel("residue")
```

**Tools:** `draw_protein` (Python), `ProteinPlot`, IBS (Illustrator), or
`biovis`. For quick accurate domain maps, pull the domain calls from Pfam/InterPro
rather than drawing them from a paper's memory.

## Secondary structure

- **Schematic:** helices as coils or cylinders, strands as arrows, loops as
  lines. The convention matters to the reader — use the standard.
- **Tracks:** a per-residue secondary-structure assignment (DSSP) as a colored
  track under a sequence axis.
- **Publication:** the helix/strand diagram is often hand-composed in a vector
  tool because the layout is bespoke; keep the source file.

## Topology (membrane proteins)

Show: the membrane as two horizontal lines, transmembrane helices as boxes
crossing it, loops labelled as extracellular/intracellular, N- and C-termini
placed on the correct side. State the prediction method (TMHMM, DeepTMHMM,
Phobius) and its confidence.

## Interaction maps

- **Domain-domain interactions:** two domain bars connected by arcs; arc
  thickness = evidence strength (with a legend).
- **Interaction networks:** nodes are proteins, edges are interactions. Edge
  style encodes evidence type (experimental vs predicted), not just presence.
  Use a force-directed or circular layout; avoid hairballs by filtering to the
  interactions the question needs.
- **Always cite the source database and version** (STRING, IntAct, BioGRID) in
  the caption.

## Rules

- **Residue coordinates are exact** and match the isoform you state. The most
  common error is a diagram for one isoform with the numbering of another.
- **Isoform differences** are shown explicitly, not merged into one diagram.
- **Scale is consistent** across panels comparing proteins of different length.
- **Legend for every visual encoding** — color, width, opacity, shape.
- **Colorblind-safe.** Domain colors are categorical; use a palette that
  survives deuteranopia.

## Before shipping

- [ ] Domain boundaries match the database record (source and version cited).
- [ ] Isoform and residue numbering stated.
- [ ] Scale bar or axis present.
- [ ] Legend covers every encoding.
- [ ] Labels legible at final size.
