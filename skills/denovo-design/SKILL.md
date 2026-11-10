---
name: denovo-design
description: Design molecules de novo against a target — generative design, pharmacophore-based design, and scaffold hopping. Use when novel chemical matter is needed rather than analogs.
category: chemistry
tags: [de-novo, generative-design, scaffold-hopping, pharmacophore, novelty]
disable-model-invocation: true
---

# De Novo Design

De novo design creates chemical matter without a starting series. Its output is
hypotheses for synthesis, not validated leads.

## Approaches

| Approach | Basis | Strength |
|---|---|---|
| Pharmacophore-based | 3D feature requirements | Preserves essential interactions |
| Scaffold hopping | Bioisosteric replacement | Novel core, preserved activity |
| Fragment growing/linking | Validated fragments | High confidence per fragment |
| Generative models (REINVENT, MolGPT) | Trained on chemical space | Broad exploration |
| Structure-based generative | Binding site constraints | Pocket-complementary |
| Evolutionary / GA | Objective-guided search | Tunable objectives |

## The design target

State explicitly:

- **The pharmacophore:** which features must be present and their 3D
  arrangement (H-bond donor/acceptor, hydrophobic, charge, aromatic).
- **Excluded volumes:** where the protein prevents substitution.
- **Property constraints:** MW, LogP, HBD/HBA, charge, solativity, synthetic
  accessibility.
- **Novelty requirement:** what distance from known matter counts as novel.

## Pharmacophore modeling

1. **Align known actives** (3D conformers, flexible alignment).
2. **Extract shared features** (HipHop, Phase, LigandScout).
3. **Validate on inactives:** the pharmacophore should exclude them.
4. **Screen or generate** against the model.

## Scaffold hopping

- **Bioisosteric replacements:** amide → sulfonamide, phenyl → thiazole, etc.
- **Matched molecular pairs** across scaffolds to preserve potency.
- **Shape/electrostatics similarity** (ROCS-style) rather than 2D similarity.
- **Synthetic feasibility** is usually the binding constraint on a novel
  scaffold.

## Generated output validation

Every candidate passes these before being a design:

1. **Chemical validity** and sanitization.
2. **Pharmacophore match** in 3D, not just in 2D features.
3. **Synthesizability:** retrosynthesis proposes a route (AiZynthFinder, ASKCOS).
4. **Novelty:** not in the training set; scaffold distinct from known actives.
5. **Property compliance:** the constraints are met.
6. **Diversity:** not all one scaffold.
7. **Orthogonal scoring:** not judged only by the model that generated it.

## Reporting

State: the design basis (pharmacophore, scaffold hop, generative model), the
constraints and their origin, the generation method and its parameters, the
filtering pipeline with counts at each stage, the validity/novelty/synthesizability
rates, the diversity, and the explicit statement that these are synthesis
candidates, not validated compounds.

## Anti-patterns

- Reporting generated molecules as leads.
- Skipping synthesizability.
- Claiming novelty without a training-set check.
- Generating against one scorer and reporting that scorer's output as evidence.
