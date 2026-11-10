---
name: synthetic-biology
description: Design and model synthetic biological systems — gene circuits, codon optimization, metabolic engineering, and SBOL/SBML standards. Use for engineering biological function.
category: biology
tags: [synthetic-biology, gene-circuits, metabolic-engineering, sbml, design]
disable-model-invocation: true
---

# Synthetic Biology

Synthetic biology builds biological function from characterized parts. The
design is only as good as the characterization of each part and the model of
their composition.

## Gene circuits

```
Promoter → RBS → CDS → terminator
```

- **Part characterization** (promoter strength, RBS efficiency, degradation
  rate) must come from measured data in the relevant context. A part's
  characterization in E. coli does not transfer to yeast.
- **Context effects** (insulation, read-through, burden) are real; design with
  insulated parts.
- **Model the circuit ODE** (with growth feedback) before building:

```
dm/dt = α * f(x) - δm * m - μ * m
dp/dt = β * m - δp * p - μ * p
```

- **Bifurcation and sensitivity analysis** reveals the circuit's robustness.

## Codon optimization

- **Codon adaptation index (CAI)**, codon usage tables for the host.
- **Preserve motifs:** avoid restriction sites, cryptic splice sites, mRNA
  secondary structure near the RBS/start, and repeated sequences.
- **Do not over-optimize.** Rare codons sometimes regulate translation rate;
  removing them can misfold the protein.

## Metabolic engineering

- **Flux balance analysis (FBA)** with COBRApy; state the model (iML1515,
  Recon3D) and the objective.
- **Thermodynamic feasibility** (TFA) constrains unrealistic flux.
- **Enzyme-constrained models** (GECKO) incorporate kcat and enzyme abundance.
- **Identify the bottleneck** by flux control analysis, not by intuition.

## Standards

- **SBOL** for design representation; **SBML** for models.
- **Use the standard formats** so the design/model is reusable and validated.

## Validation

- **Characterize the built system** against the model: dose-response, dynamics,
  burden.
- **Fluorescence reporters** are proxies; validate with the functional output.
- **Sequence-verify** every construct (see `molecular-cloning`).
- **Compare measured to predicted** and report the discrepancy; a model that
  misses is a finding.

## Reporting

State: the parts and their characterization source, the design (sequence,
architecture), the model and its parameters with their origin, the assumptions
(growth, burden), the built construct and its sequence verification, the
measured characterization with its conditions, and the comparison of measured to
predicted.

## Common errors

- Part characterization from a different host/context.
- No model before building.
- Codon optimization breaking motifs or structure.
- Model fit without out-of-sample validation.
