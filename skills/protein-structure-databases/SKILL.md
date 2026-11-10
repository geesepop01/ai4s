---
name: protein-structure-databases
description: Access and interpret protein structure databases — PDB, AlphaFold DB, EMDB, and structure comparison. Use for retrieving, validating, and comparing 3D structures.
category: databases
tags: [pdb, alphafold, structures, cryo-em, structural-biology]
disable-model-invocation: true
---

# Protein Structure Databases

A structure record carries experimental or computational provenance, resolution,
and quality metrics. Using a structure without them is using an unverified model.

## PDB / RCSB

```python
import requests

# Entry metadata
r = requests.get("https://data.rcsb.org/rest/v1/core/entry/1TUP").json()
print(r["rcsb_entry_info"]["resolution_combined"])   # Å

# Polymer entity (sequence, mutations)
r = requests.get("https://data.rcsb.org/rest/v1/core/polymer_entity/1TUP/1").json()
```

**Key fields to record:**
- **Method:** X-ray, cryo-EM, NMR — they imply different errors.
- **Resolution:** X-ray/cryo-EM in Å; NMR has no resolution (report the number
  of models and the NOE count).
- **R-free (X-ray):** the honest refinement statistic.
- **Deposited vs refined:** ligands, waters, mutations, engineered constructs.

## AlphaFold DB

```python
r = requests.get("https://alphafold.ebi.ac.uk/api/prediction/P04637").json()
# pLDDT per-residue confidence is in the mmCIF B-factor field
```

- **pLDDT** is per-residue confidence: >90 high, 70–90 confident, 50–70 low,
  <50 very low (likely disordered).
- **A predicted structure is a prediction.** Never present a low-confidence
  region as a structural finding. Report pLDDT for any region you discuss.
- **Predicted structures have no ligand, no cofactor, no post-translational
  state.** The biological assembly may differ entirely.

## Comparing structures

- **Superposition:** `pymol` `align`/`super`, `Bio.PDB.Superimposer`,
  `TM-align`, `US-align`. **Report RMSD and TM-score.** RMSD alone is
  length-dependent and misleading; TM-score is normalized (0–1).
- **Sequence identity** must be reported alongside RMSD; a low-identity
  superposition with a high RMSD is not surprising.
- **Local vs global:** a domain can be conserved while the overall fold rotates.
  Report per-domain RMSD where it matters.

## Ligands and complexes

- **Hetero residues** (HETATM) may be crystallization additives, not biological
  ligands. Check the ligand's role in the entry.
- **Biological assembly vs asymmetric unit.** The ASU can contain
  crystallographic contacts that are not biological. Use the biological
  assembly (PDB provides it).
- **Interface analysis:** PISA or interface area; a crystal contact is not an
  interaction.

## Quality checks before using a structure

- [ ] Method and resolution recorded; R-free for X-ray.
- [ ] Any missing residues/loops noted.
- [ ] Alt-loc and occupancy inspected.
- [ ] For predicted structures: pLDDT reported for discussed regions.
- [ ] Biological assembly used, not the ASU, for interaction claims.
- [ ] Ligand identity and role confirmed (biological vs additive).
- [ ] Mutations/engineered constructs in the construct noted.

## Reporting

State: the accession and version, the experimental method and resolution (or the
prediction method and confidence), the chain and residue range used, the
comparison method and the RMSD/TM-score with sequence identity, the assembly
state, and the known limitations (missing regions, engineered constructs,
ligand state).
