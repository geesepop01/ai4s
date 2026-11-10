---
name: statistical-mechanics
description: Apply statistical mechanics — ensembles, partition functions, phase transitions, critical phenomena, and Monte Carlo methods. Use for problems in thermodynamics, condensed matter, or many-body statistical physics.
category: physics
tags: [statistical-mechanics, thermodynamics, phase-transitions, monte-carlo, ensembles]
disable-model-invocation: true
---

# Statistical Mechanics

Statistical mechanics connects microscopic dynamics to macroscopic
thermodynamics. Its power is that the macroscopic result does not depend on the
microscopic details — which is also where its assumptions must be checked.

## The ensembles

| Ensemble | Fixed | Fluctuates | Potential |
|---|---|---|---|
| Microcanonical (NVE) | N, V, E | everything else | S = k_B ln Ω |
| Canonical (NVT) | N, V, T | E | F = -k_B T ln Z |
| Grand canonical (μVT) | μ, V, T | N, E | Ω = -k_B T ln Ξ |
| Isobaric-isothermal (NPT) | N, P, T | V, E | G = -k_B T ln Δ |

**Equivalence of ensembles** holds in the thermodynamic limit for short-range
interactions. It fails for small systems, long-range interactions, or near a
first-order transition. State which ensemble you used and whether the equivalence
is safe.

## Partition functions and observables

```
Z = Σ_i exp(-β E_i)                 β = 1/(k_B T)
⟨A⟩ = (1/Z) Σ_i A_i exp(-β E_i)
F = -k_B T ln Z
S = -∂F/∂T|_V    P = -∂F/∂V|_T    C_V = -T ∂²F/∂T²
```

Fluctuation–response relations are the practical route in simulation:
`C_V = (⟨E²⟩ - ⟨E⟩²)/(k_B T²)`.

## Phase transitions

- **First order:** discontinuous first derivative of the free energy;
  coexistence, latent heat, hysteresis. Finite-size simulations show
  pseudo-transitions; look for the order parameter distribution's bimodality.
- **Second order (continuous):** diverging correlation length, critical
  exponents, scaling laws. Universality means the exponents depend on symmetry
  and dimension, not on microscopic details.
- **Finite-size scaling:** `L^(β/ν)` scaling of the order parameter, Binder
  cumulant crossings to locate T_c. A transition located only at one system size
  is not located.

## Monte Carlo

**Metropolis:**

```python
def metropolis_step(state, beta, energy_fn, rng):
    trial = propose(state, rng)
    dE = energy_fn(trial) - energy_fn(state)
    if dE <= 0 or rng.random() < np.exp(-beta * dE):
        return trial
    return state
```

**Discipline:**
- Detailed balance: the proposal must be symmetric, or use the Hastings
  correction.
- **Equilibration before measurement.** Do not average over the approach to
  equilibrium. Measure the autocorrelation time and thin or average over blocks.
- **Error bars are correlated.** `N_independent ≈ N_samples / (2τ_int)`. Naive
  error bars on correlated samples are too small.
- **Cluster algorithms** (Wolff, Swendsen–Wang) beat local updates near critical
  points, where critical slowing down makes local MC useless.
- **Check against an exactly solvable limit** before trusting the code.

## Common errors

- Using `exp(-βE)` when the state should be weighted by `exp(-β(E - μN))`.
- Reporting a transition temperature from one system size without finite-size
  scaling.
- Error bars computed as if samples were independent.
- Mixing unit conventions (k_B = 1 is fine if stated; attach units in reporting).
- Claiming universality from one model without checking the exponents.

## Reporting

State: the Hamiltonian and its parameters, the ensemble, the algorithm and its
updates, system sizes, equilibration length, measurement protocol, the
autocorrelation time, the error-estimation method, and finite-size scaling
analysis for any transition claim.
