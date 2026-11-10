---
name: molecular-optimization
description: Optimize molecular structures against multi-parameter objectives — potency, ADMET, synthesizability — with generative and search methods. Use for lead optimization and de novo design.
category: chemistry
tags: [molecular-optimization, generative, mpo, design, search]
disable-model-invocation: true
---

# Molecular Optimization

Molecular optimization searches chemical space for structures that improve an
objective without breaking the others. The search method matters less than the
objective and the validation.

## The objective

```python
def objective(mol):
    potency = predict_potency(mol)        # higher better
    admet = predict_admet(mol)            # composite of flags
    synth = synthesizability(mol)         # SCScore, retrosynthesis
    return weighted_score([potency, admet, synth])
```

**The objective encodes the program's priorities.** State the weights and the
constraints. A single-objective optimization silently sacrifices the others.

## Methods

| Method | Strength | Limitation |
|---|---|---|
| Matched molecular pairs | Interpretable, reliable SAR | Limited to local changes |
| Genetic algorithms (REINVENT, GraphGA) | Broad exploration | Objective gaming |
| Bayesian optimization | Sample-efficient | Descriptor-dependent |
| Reinforcement learning | Large spaces | Reward hacking, validity |
| Fragment-based | Chemically sensible | Needs fragment library |
| Active learning | Iterative with real data | Requires assay loop |

## Generated molecule validation

Generated molecules must pass these before being counted:

1. **Chemical validity** — parses, sanitizes, valence correct.
2. **Synthesizability** — retrosynthesis (AiZynthFinder, ASKCOS) actually
   proposes a route. A "novel" molecule no one can make is not a design.
3. **Novelty** — not in the training set (exact and scaffold match).
4. **Property checks** — the objective values recomputed independently, not
   from the generator's own predictor.
5. **Diversity** — not 50 copies of the same scaffold.

## Objective gaming

Generative models exploit the objective's blind spots:

- **A predictor that is wrong in one region** becomes a target for generation.
- **Reward hacking:** the model finds molecules that score well on the
  surrogate but are chemically nonsensical.
- **Mitigation:** orthogonal predictors, hard constraints on chemical
  properties, visual inspection, and synthesizability gates.

## Validation

The **surrogate is not reality** (see `deliverable-conformance`):

- The final candidates are selected on **real data** when it exists, not on
  surrogate scores.
- **Docking or predictor scores do not establish binding.** The claim is
  "prioritized for synthesis," not "potent."
- Report the surrogate's applicability domain for the generated set.

## Reporting

State: the objective and its weights/constraints, the search method and its
parameters, the number of candidates generated and filtered at each stage,
the validity/novelty/synthesizability rates, the surrogate models and their
errors, the diversity metrics, and the explicit statement that the output is a
prioritized set requiring experimental testing.

## Anti-patterns

- Reporting generated molecules as validated leads.
- Ignoring synthesizability.
- Optimizing against one predictor and reporting its score as evidence.
- Claiming novelty from a scaffold that is trivially similar to known actives.
