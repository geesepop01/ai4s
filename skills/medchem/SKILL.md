---
name: medchem
description: Apply medicinal chemistry principles — SAR interpretation, bioisosteres, physicochemical optimization, and ADMET-driven design. Use for compound design and optimization decisions.
category: chemistry
tags: [medchem, sar, bioisosteres, physicochemical, optimization]
disable-model-invocation: true
---

# Medicinal Chemistry

Medicinal chemistry is the discipline of changing a molecule to fix one property
without breaking the others. The reasoning is what a chemist contributes beyond
a design tool.

## Physicochemical control

| Property | Driver | Design lever |
|---|---|---|
| Potency | Complementary interactions | Grow into sub-pockets, rigidify |
| Solubility | Crystal packing, polarity | Reduce symmetry, add polar groups, salt form |
| Permeability | Lipophilicity, HBD | Reduce HBD, moderate LogP |
| Metabolic stability | Soft spots | Block oxidation, reduce electron density |
| hERG | Basic lipophilic amine | Reduce basicity, add polarity |
| PPB | Lipophilicity | Reduce LogP |

**Lipophilic efficiency (LipE = pIC50 - LogP)** is the standard measure of
whether a potency gain was bought with non-specific binding. Track it.

## Bioisosteres

Classic replacements that preserve activity while changing properties:

| Replace | With | Effect |
|---|---|---|
| -COOH | tetrazole, acyl sulfonamide | Metabolic stability, permeability |
| -OH | -NH2, -CH2OH, oxadiazole | Metabolic stability |
| Phenyl | thiazole, pyridine, cyclohexane | Solubility, polarity |
| Amide | sulfonamide, reversed amide | Metabolic stability |
| Ester | amide, oxadiazole | Metabolic stability |
| t-Butyl | cyclopropyl, isopropyl | Metabolic stability |
| -CH2- | -O-, -NH-, -CF2- | Polarity, conformation |

**A bioisostere is a hypothesis.** It often works but not always; measure.

## SAR reading

- **Matched molecular pairs** isolate the effect of a single change; this is the
  most reliable SAR.
- **Activity cliffs** (small change, large effect) reveal the binding mode.
- **Non-additivity** (SAR that does not combine) indicates conformational or
  mechanistic coupling.
- **A 2-fold change within assay variability is not SAR.** Report the assay CV.

## Multi-parameter optimization

Track the whole panel and the trade-offs:

```
Compound  pIC50  LogD  Sol  MetStab  hERG  LipE  MPS
A         8.2    2.1   45   32       >30   6.1   0.71
B         8.4    3.4   12   8        12    5.0   0.52
```

A potency gain that costs solubility and hERG is not progress.

## Red flags

- **High LogD** with basic amine → hERG, PPB, promiscuity.
- **Flat aromatic systems** → solubility, metabolic, hERG.
- **Unstable functional groups** (esters, anilines, Michael acceptors) →
  stability/toxicity liabilities.
- **Chiral centers left undefined** → synthesis and activity ambiguity.
- **No synthetic route** → not a design.

## Reporting

State: the structural change and its rationale, the full property panel (not
only the improved one), the assay and its variability, the LipE/MPS where used,
the SAR interpretation with the matched-pair evidence, the liabilities and
their mitigation, and the synthesis status.

## Anti-patterns

- Optimizing potency alone.
- Reading SAR from changes smaller than assay variability.
- Presenting a bioisostere as a guaranteed fix.
- Dropping a compound from the table when its data looks bad (report it).
