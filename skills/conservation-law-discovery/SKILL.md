---
name: conservation-law-discovery
description: Discover conserved quantities and symmetries from data or equations. Use when a system appears to have invariants, or when checking a model against conservation.
category: physics
tags: [conservation, symmetry, invariants, noether, discovery]
disable-model-invocation: true
---

# Conservation Law Discovery

Conserved quantities are the strongest constraints a dynamical system has.
Finding them — or confirming them — is often the fastest route to understanding
and the cheapest correctness check.

## From the equations: Noether and direct construction

- **Noether's theorem:** every continuous symmetry of the Lagrangian has a
  conserved current. Time translation → energy; space translation → momentum;
  rotation → angular momentum; gauge → charge.
- **Direct construction:** find I(x) such that `dI/dt = ∇I · ẋ = 0` along the
  flow. For linear systems, left eigenvectors with zero eigenvalue give linear
  invariants; quadratic forms give invariants of Hamiltonian systems.
- **Poisson structure:** for Hamiltonian systems, `{I, H} = 0` for any invariant
  I.

```python
import sympy as sp
t = sp.symbols('t')
x, y = sp.symbols('x y', cls=sp.Function)
# Check dI/dt = 0 symbolically along the vector field
I = x(t)**2 + y(t)**2
f = [-y(t), x(t)]            # rotation field
dIdt = sp.diff(I, t).subs({sp.diff(x(t), t): f[0], sp.diff(y(t), t): f[1]})
sp.simplify(dIdt)            # → 0 confirms conservation
```

## From data: discovering invariants numerically

When only trajectories are available:

1. **Candidate construction.** Fit a candidate invariant I(x) (polynomial, neural
   network, symbolic regression) and test whether `dI/dt ≈ 0` along the data.
2. **SINDy / sparse identification.** Fit `ẋ = Θ(x) ξ` with sparse regression;
   the null space of the learned dynamics reveals conserved linear combinations.
3. **Symbolic regression** (`symbolic-regression`) on the invariant directly:
   search for I(x) with minimal variance along trajectories.
4. **Neural approaches.** A network that predicts I(x) with near-zero time
   derivative along data; or a Hamiltonian neural network that learns H(x,p)
   from which conservation follows.

**Critical caveat:** a quantity that is *nearly* constant over the observed
window is not a conserved quantity. Test on trajectories that differ in initial
conditions, energy, and timescale, and check the derivative rather than the
value's variance.

## Validation of a discovered law

- **Derivative check**, not variance check: compute `dI/dt` along independent
  trajectories; it must be zero within tolerance.
- **Out-of-sample trajectories:** different initial conditions, longer times,
  different parameter values.
- **Known limits:** does it reduce to a known invariant when the system does?
- **Perturbation robustness:** does the candidate survive small changes in the
  data-generating process, or does it fit an artifact?
- **Physical plausibility:** does the invariant have units and a physical
  interpretation? An invariant with no interpretation is a fitting artifact
  until shown otherwise.

## Using conservation as a correctness check

For a simulation, conservation is the verification:

- Integrate and plot E(t), p(t), Q(t). Secular drift means the integrator is
  wrong (see `hamiltonian-mechanics`).
- Report the drift rate, not just "energy is conserved."
- For a discretization, check the discrete conservation property: finite volume
  conserves mass exactly; spectral methods conserve energy to roundoff.

## Reporting

State: the candidate invariant and its expression/units, the method of discovery,
the derivative-check result with tolerance, the out-of-sample test, the
relationship to known symmetries, and — for numerical work — the measured drift
over the integration window.
