---
name: flow-cytometry-analysis
description: Run a complete flow cytometry analysis — FCS handling, compensation, gating, immunophenotyping, proliferation, cell cycle, and apoptosis. Use for any flow or mass cytometry data.
category: biology
tags: [flow-cytometry, fcs, gating, compensation, immunophenotyping]
disable-model-invocation: true
---

# Flow Cytometry Analysis

Flow analysis is a sequence of decisions, each of which can change the result.
The gating strategy is the analysis; it must be documented and reproducible.

## The pipeline

```
FCS files → QC (acquisition, cleaning) → compensation → transformation
  → gating (QC, singlets, live, lineage) → population metrics → statistics
```

## Data handling

```python
import flowio, flowkit as fk
fcs = flowio.FlowData("sample.fcs")
events = fcs.events.reshape(-1, fcs.channel_count)
```

- **Check acquisition quality:** event count, time parameter anomalies (clogs),
  doublet rate.
- **Compensation:** from single-stained controls acquired on the same settings.
  `fk.Matrix` in FlowKit, or manual spillover. **FMO controls** for every gate
  set at a boundary.
- **Transformation:** log for fluorescence, biexponential/logicle for
  compensated data (negatives are real). Do not gate on raw log for compensated
  channels — the negative population is smeared.

## Gating strategy (document it as a figure)

```
All events → Time gate (remove clogs)
          → FSC/SSC (cells, exclude debris)
          → Singlets (FSC-H vs FSC-A)
          → Live (viability dye negative)
          → Lineage markers → populations of interest
```

Every gate is a decision. Publish the strategy as a figure with the same axes
used in the analysis.

## Population metrics

- **Frequency:** % of parent and % of a defined reference (e.g. % of CD45+).
  State which.
- **Absolute counts:** with counting beads or a known volume. Frequency alone
  misleads when another population changes.
- **MFI/GeoMFI:** state which, and normalize to FMO or to a control sample
  across batches.

## Specialized assays

| Assay | Analysis |
|---|---|
| Proliferation (CFSE/CellTrace) | Division peaks; proliferation index, division index, % divided |
| Cell cycle (PI/DAPI) | G0/G1, S, G2/M fractions; Dean-Jett-Fox model |
| Apoptosis (Annexin V/PI) | Live / early / late / necrotic quadrants |
| Phospho-flow | MFI shift vs unstimulated control; fold change |
| Intracellular cytokines | FMO-defined positive gate; brefeldin/monensin controls |

**Cell cycle:** fit the model (Dean-Jett-Fox or Watson) rather than drawing
gates; report the fit and its residuals.

## Batch effects

- Run a **reference sample** on every acquisition day.
- Normalize across days (beads, or percentile matching).
- Randomize sample acquisition order; do not acquire all cases then all controls.

## Statistics

- The **unit is the donor/subject**, not the well or the event. Compute one
  summary per subject and test across subjects.
- **Report n donors**, not n events.
- Multiple populations tested → correct for multiplicity.

## Reporting

State: the instrument and configuration, the antibody panel with fluorochromes
and clones, the compensation controls, the transformation, the gating strategy
as a figure, the population definitions, the normalization across batches, the
replicate structure (n donors), and the statistical test with multiplicity
correction.
