---
name: phylogenetics
description: Build and interpret phylogenetic trees — alignment, model selection, tree inference, and support assessment. Use for evolutionary analysis and taxonomic questions.
category: biology
tags: [phylogenetics, trees, evolution, bootstraps, models]
disable-model-invocation: true
---

# Phylogenetics

A phylogenetic tree is a hypothesis about evolutionary history. Its support
comes from the alignment, the model, and the resampling — not from the drawing.

## The pipeline

```
sequences → alignment (MAFFT/MUSCLE) → model selection (ModelFinder)
  → tree inference (IQ-TREE/RAxML/BEAST) → support (bootstrap/UFBoot)
  → rooting and interpretation
```

## Alignment

- **Homologous positions only.** Align the same region across all taxa; partial
  overlap creates artifacts.
- **Trim poorly aligned columns** (trimAl, Gblocks) and report the trimming.
- **Check for recombination** (GARD, RDP) in sequences where it applies —
  recombination violates the tree assumption.

## Model selection

```bash
iqtree -s aligned.fasta -m MFP -B 1000 --alrt 1000
```

- **ModelFinder** (BIC/AIC) selects the substitution model; report the selected
  model and the criterion.
- **Partitioned models** for multi-gene data (different genes evolve
  differently).
- **Rate heterogeneity** (+G, +I) usually matters.

## Tree inference

| Method | Use |
|---|---|
| Maximum likelihood (IQ-TREE, RAxML) | Default for sequence data |
| Bayesian (BEAST, MrBayes) | Divergence times, posterior support |
| Neighbor-joining | Quick, not for publication |
| Maximum parsimony | Rarely justified |

## Support and uncertainty

- **Ultrafast bootstrap (UFBoot)** ≥ 95 is strong; standard bootstrap ≥ 70 is
  conventional.
- **SH-aLRT** ≥ 80 as a second criterion.
- **Bootstrap values are not probabilities.** A 100% bootstrap on a
  systematically wrong model is still wrong.
- **Report the tree with support values**, and the branch lengths (with their
  scale).

## Rooting

- **Midpoint rooting** assumes a clock; it can misroot.
- **Outgroup rooting** is preferable; the outgroup must be outside the ingroup.
- **Molecular clock** (BEAST) for divergence times, with the clock model and its
  calibration stated.

## Interpretation

- **A tree shows relatedness, not ancestry of specific traits.** Trait evolution
  requires ancestral state reconstruction.
- **Long-branch attraction** creates artifacts; check with different models and
  taxon sampling.
- **Polytomies** represent unresolved relationships, not simultaneous divergence.

## Reporting

State: the sequences and their source/alignment region, the alignment method and
trimming, the substitution model and its selection criterion, the inference
method, the support values and their method, the rooting method and the outgroup,
the branch-length scale, and the tree's interpretation limits.

## Common errors

- Bootstrap values interpreted as probabilities.
- Trees from untrimmed, poorly aligned regions.
- No model selection; a default model applied blindly.
- Rooting by midpoint without justification.
- Trait claims from a tree without ancestral reconstruction.
