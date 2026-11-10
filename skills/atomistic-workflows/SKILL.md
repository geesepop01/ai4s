---
name: atomistic-workflows
description: Build and run atomistic simulation workflows — structure preparation, parameterization, system building, and workflow automation. Use when an atomistic calculation must be reproducible and reusable.
category: physics
tags: [atomistic, workflow, parameterization, structure, automation]
disable-model-invocation: true
---

# Atomistic Workflows

An atomistic workflow is the pipeline from a structure to a result. Making it a
script — not a sequence of clicks — is what makes the result reproducible and
the next system cheap.

## The workflow skeleton

```
structures/          input PDB/CIF/MOL2
  ↓ prepare           (clean, add H, assign protonation, fix alt-loc)
  ↓ parameterize      (force field, charges, water, ions)
  ↓ build             (box, solvation, neutralization, minimization)
  ↓ relax             (minimization + equilibration protocol)
  ↓ production        (the configured run)
  ↓ analyze           (properties, convergence, errors)
results/<run-id>/     everything, with the manifest
```

Each step is a script. Each run directory contains the manifest that produced it.

## Structure preparation

- **Start from the experimental structure** with its accession and resolution
  recorded. For predicted structures (AlphaFold), record the model version and
  pLDDT; do not treat low-confidence regions as data.
- **Clean:** remove waters/ligands unless they are part of the question; resolve
  alt-loc; fix missing residues or state that they are missing; assign
  protonation states at the target pH (PROPKA, H++).
- **Check the structure:** clashes, unusual bond lengths, cis-peptides, missing
  atoms. A bad input structure propagates through everything.

## Parameterization

| System type | Route |
|---|---|
| Protein | AMBER ff19SB / CHARMM36m |
| Nucleic acid | OL15 (AMBER) / CHARMM36 |
| Lipid membrane | CHARMM36 / Slipids / Lipid21 |
| Small molecule | GAFF2 + AM1-BCC or CGenFF; for accuracy, derive RESP/AM1-BCC |
| Metal/cofactor | Careful — standard force fields fail; use MCPB or bonded models |

**The charge derivation method is a scientific choice.** State it.

## Workflow automation

Make the pipeline a script or a workflow engine (Snakemake, Nextflow, or a plain
Makefile) so that:

- Every run is reproducible from the manifest and the input files.
- Steps are idempotent and resumable.
- Inputs and outputs are content-addressed or versioned.
- The whole thing re-runs on a new system by changing a config file.

```python
# config.yaml-driven, not hardcoded
systems:
  - name: wt
    structure: structures/wt.pdb
    mutations: []
  - name: mut
    structure: structures/wt.pdb
    mutations: [A123V]
```

## Reproducibility

Record in the manifest: software and version, force field and its version, the
parameterization method, the preparation script's hash, random seeds, the run
parameters, and the hardware where floating-point differences matter.

## Validation

- **Before production:** the system is stable in equilibration (no blowups, no
  drifting density).
- **After production:** energy/temperature/pressure traces are healthy; the
  property of interest is converged; the result is physically plausible.
- **Against a known case:** run a standard system (a small protein, a known
  binding pose) and confirm the workflow reproduces a reference result before
  trusting it on new systems.

## Common failures

- Missing hydrogens or wrong protonation silently changing an interaction.
- Alt-loc atoms creating overlapping atoms and a minimization failure.
- Missing cofactor/metal parameterization producing a nonsense result.
- Box too small, or no neutralizing ions.
- Treating a predicted low-confidence loop as an experimental conformation.
