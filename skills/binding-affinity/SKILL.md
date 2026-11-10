---
name: binding-affinity
description: Compute and interpret binding affinities — free energy methods, scoring, and experimental measurement. Use for quantitative binding claims with proper uncertainty.
category: chemistry
tags: [binding, affinity, free-energy, fep, thermodynamics]
disable-model-invocation: true
---

# Binding Affinity

Binding affinity is a free energy. It is measured experimentally or computed
with a stated method error. A docking score is neither.

## Experimental measurement

| Method | Measures | Kd range | Notes |
|---|---|---|---|
| ITC | Kd, ΔH, ΔS, stoichiometry n | nM–mM | Gold standard; direct thermodynamics |
| SPR | Kd, kon, koff | pM–mM | Surface immobilization artifacts |
| MST | Kd | nM–mM | Solution phase, low material |
| FP | Kd | nM–µM | Requires labeled ligand |
| DSF | Tm shift | qualitative | Stabilization, not affinity |

**Report Kd with its CI and the method.** Kd, Ki, IC50 are different quantities:
`Ki = IC50/(1 + [S]/Km)` (Cheng-Prusoff) only under competitive conditions.

## Computed affinity

| Method | Accuracy | Cost | Use |
|---|---|---|---|
| Docking score | Ranking only | Low | Triage |
| MM-GBSA/MM-PBSA | ~2–3 kcal/mol | Medium | Ranking, per-residue decomposition |
| FEP/TI | ~1 kcal/mol | High | Congeneric series, relative ΔΔG |
| ABFE | ~1–2 kcal/mol | Very high | Absolute affinity |

**Relative FEP (ΔΔG) on a congeneric series is the most reliable computation.**
Absolute affinity is harder; report it with a larger error bar.

```python
# Relative binding free energy conceptually
ddG = G_complex(mutant) - G_complex(wt) - (G_ligand(mutant) - G_ligand(wt))
```

## Free energy perturbation discipline

- **Alchemical transformation** must connect chemically similar states; large
  changes need staged transformations.
- **Convergence:** replicate runs, hysteresis between forward and backward
  transformations.
- **Sampling:** enhanced sampling or long enough for the relevant degrees of
  freedom.
- **Error bars from replicate runs**, not from the estimator alone.
- **Validation on known actives/inactives** before trusting the protocol.

## Thermodynamics

```
ΔG = -RT ln Ka = RT ln Kd
ΔG = ΔH - TΔS
```

- **Enthalpy/entropy compensation** is real and often large; a favorable ΔH with
  an unfavorable ΔS is common. Report both where measured (ITC gives both).
- **Standard state:** 1 M; report the standard state for computed values.

## Reporting

State: the method and its error, the temperature and the standard state, Kd/Ki/IC50
clearly distinguished, the CI, the replicate count, the convergence evidence
(for computed), the experimental conditions (buffer, protein state), and the
explicit statement of the method's accuracy range.

## Anti-patterns

- Reporting a docking score as kcal/mol affinity.
- Mixing Kd, Ki, and IC50 as if interchangeable.
- Computed ΔΔG without convergence or replicate error.
- Reporting a computed affinity without its method's accuracy range.
