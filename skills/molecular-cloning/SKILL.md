---
name: molecular-cloning
description: Design and analyze molecular cloning — primer design, PCR, restriction/ligation, Gibson assembly, and construct verification. Use for recombinant DNA work and construct design.
category: biology
tags: [cloning, pcr, primers, gibson, plasmids, molecular-biology]
disable-model-invocation: true
---

# Molecular Cloning

Cloning failures are usually design failures. Primer design and assembly
strategy determine success before anything enters a tube.

## Primer design

| Parameter | Target |
|---|---|
| Length | 18–25 nt |
| Tm | 55–65 °C; pair within 2–3 °C of each other |
| GC content | 40–60% |
| 3' end | G or C ("GC clamp"), but avoid GGG/CCC runs |
| Specificity | BLAST against the template; avoid 3' complementarity |
| Hairpins/dimers | Check ΔG of self- and hetero-dimers, especially at 3' |

```
Tm (Wallace) = 2(A+T) + 4(G+C)          # short primers
Tm (nearest-neighbor)                    # use this for accuracy
```

**Design in the correct orientation and frame.** A cloning primer that carries an
overhang must preserve the reading frame and add the correct start/stop codon.

## PCR

- **Template:** plasmid (1–10 ng), genomic (50–200 ng), cDNA (variable).
- **Extension time:** ~1 min/kb for standard polymerases; follow the enzyme's
  spec.
- **Annealing:** 5 °C below the primer Tm as a start; optimize by gradient.
- **Controls:** no-template control (NTC) every time. A contamination is
  invisible without it.
- **High-fidelity polymerase** for any construct that will be sequenced.
- **Colony PCR screening:** use a primer outside the insert and one inside;
  expect a size shift.

## Assembly strategy

| Method | Use |
|---|---|
| Restriction + ligase | Classic; needs unique sites, destroys them |
| Gibson assembly | Multi-fragment, seamless, 15–30 bp overlaps |
| Golden Gate | Scarless, directional, multi-fragment with Type IIS |
| TOPO/TA cloning | Fast PCR product cloning |
| Site-directed mutagenesis | Point mutations (QuikChange-style) |

**Gibson overlaps:** 15–30 bp, Tm ~50–60 °C, unique, no repeats. Design overlaps
at the junctions, not across repetitive elements.

## Verification (never skip)

1. **Colony PCR** for size — screens, does not confirm.
2. **Sanger sequencing** across every junction and the entire ORF for any
   construct used in an experiment. A construct that is only "screened" is not
   verified.
3. **Full-plasmid sequencing** for constructs going into publication.
4. **Check the reading frame** in silico before the wet work; translate the
   sequence and confirm the protein is what you expect.

## Common failures

- Primer dimers producing a product from the NTC. Always run the NTC.
- Incorrect Tm calculation (Wallace on a long primer).
- Frame shift from an overhang designed without checking the codon.
- Template carryover contamination.
- Junctions in repetitive or GC-extreme regions.
- A plasmid that is sequence-verified at the junctions but has a mutation
  elsewhere (hence full-plasmid sequencing).

## Recording

Record: the design (primer sequences, Tm, template, expected product size), the
PCR program, the assembly method and its overlaps, the screen results, and the
Sanger trace files with the alignment to the intended sequence. Keep the
intended full sequence as a file that the Sanger result is aligned against.
