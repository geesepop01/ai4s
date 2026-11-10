---
name: cheminformatics-definitions
description: Establish precise chemical and cheminformatics definitions for a project — descriptor, fingerprint, similarity, and property conventions. Use when a project's chemical terminology must be unambiguous.
category: chemistry
tags: [definitions, terminology, standards, descriptors, conventions]
disable-model-invocation: true
---

# Cheminformatics Definitions

Chemical informatics terms are used loosely in the literature. Defining them
precisely for a project is what makes results reproducible and comparable.

## The definitions to fix before you start

| Term | What must be specified |
|---|---|
| Molecule | Standardization applied (salt, tautomer, protonation, stereo) |
| Descriptor | Which descriptor set, which software version |
| Fingerprint | Type, radius/length, bit count |
| Similarity | Metric (Tanimoto, Dice), and on which fingerprint |
| "Active" | Threshold and assay context |
| "Drug-like" | Which rule (Lipinski, Veber, beyond Rule of 5) |
| Scaffold | Bemis-Murcko definition and the standardization |
| "Novel" | Distance from what reference set |
| IC50 / Ki / Kd | Which quantity, from which assay type |
| Selectivity | Ratio of which measurements, in which assays |

## Standardization record

```yaml
standardization:
  salt_stripping: FragmentParent (largest organic fragment)
  neutralization: Uncharger at pH 7.4
  tautomer: Canonical tautomer (rdMolStandardize)
  stereochemistry: unspecified centers enumerated (n max 4)
  aromaticity: default RDKit model
```

**This record belongs in the methods.** Two projects with different
standardization produce different numbers from the same input file.

## Active/inactive definition

The most consequential definition in any model:

- **Threshold** (e.g. IC50 < 1 µM) and its justification.
- **Assay type** the threshold applies to.
- **Handling of censored values** (`<`, `>`): excluded, or treated as bounds?
- **Inactive definition:** measured-and-inactive vs not-measured. These are
  different.

## Scaffold and novelty

- **Bemis-Murcko scaffold** is the standard; state whether generic (atom types
  removed) or exact.
- **"Novel" needs a reference:** not in ChEMBL? < 0.4 Tanimoto to any known
  active? State the criterion.

## Property conventions

- **LogP** (partition, neutral) vs **LogD** (distribution, at pH 7.4). They are
  different; state which.
- **TPSA** computed method (RDKit vs Ertl).
- **QED** is a composite with a specific implementation; state the version.
- **"Solubility"**: kinetic vs thermodynamic; intrinsic vs at a pH.

## The glossary

Write `definitions.md` for the project, with each term defined exactly, the
tool and version used to compute it, and the reference for the convention. Every
result cites this file.

## Why this matters

A "similarity > 0.7" screening result is uninterpretable without the
fingerprint and the metric. An "active" classification is uninterpretable
without the threshold and the assay. Two datasets labelled the same way can be
incompatible if their definitions differ.

## Reporting

State: the standardization record, the definition of every key term, the tool
and version for each computed property, the active/inactive criterion and its
assay context, the novelty and scaffold criteria, and the references for the
conventions adopted.
