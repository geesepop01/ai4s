---
name: pharmacology-databases
description: Access drug and pharmacology databases — DrugBank, DrugCentral, and pharmacological references. Use for drug identification, interactions, and pharmacological data.
category: databases
tags: [drugbank, drugs, pharmacology, interactions, indications]
disable-model-invocation: true
---

# Pharmacology Databases

Drug data is regulatory and commercial as well as scientific. The source
determines what a claim can be used for.

## Databases

| Source | Strength | Access |
|---|---|---|
| DrugBank | Targets, pathways, interactions | Licensed (free academic) |
| DrugCentral | Indications, pharmacology | Open |
| PubChem BioAssay | Assay data | Open |
| ChEMBL | Quantitative potency | Open |
| FDA labels (openFDA) | Approved use | Open |
| RxNorm | Drug name normalization | Open |
| KEGG DRUG | Pathway-linked drugs | Licensed |

## Drug identity

- **Normalize names first.** Brand names, generic names, salts, and
  stereoisomers all map differently. RxNorm or InChIKey is the reliable key.
- **Salt vs free base:** different records, different molecular weights,
  different dosing. State which.
- **Combination products** have their own records; a component-level claim needs
  the component's data.

## Indications and evidence

- **Label indication** is the approved use; evidence for it comes from the
  trials in the label.
- **Off-label evidence** is a literature question; do not present it as
  approved.
- **Investigational status** matters: phase, not just "in development."

## Drug interactions

- **Interaction databases report documented or predicted interactions.**
  Distinguish the evidence type (pharmacokinetic, pharmacodynamic, predicted).
- **Mechanism-based inference** (CYP inhibition, transporter effects) is
  prediction; clinical reports are observation. State which.
- **Severity and evidence level** should be reported with any interaction claim.

## Targets and pharmacology

- **Binding/functional data** comes from ChEMBL or the source paper; report the
  assay context (see `chembl-database`).
- **Selectivity** requires matched assays.
- **Active metabolites** matter for both efficacy and safety.

## Reporting

State: the database and its version, the drug identifier (InChIKey/RxNorm/DrugBank
ID), the salt/stereo form, the evidence type for any claim (label, trial,
prediction, case report), the source of potency or interaction data with its
assay context, and the regulatory status (approved, off-label, investigational).

## Anti-patterns

- Using brand names as identifiers.
- Presenting a predicted interaction as a documented one.
- Claiming an indication from in-vitro data.
- Ignoring salt/stereo form in potency comparisons.
