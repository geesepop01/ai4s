---
name: hamiltonian-mechanics
description: Work with Hamiltonian and Lagrangian dynamics — canonical equations, symplectic integration, conserved quantities, and variational methods. Use for classical mechanics, dynamical systems, and simulation where structure preservation matters.
category: physics
tags: [hamiltonian, lagrangian, symplectic, dynamics, conservation]
disable-model-invocation: true
---

# Hamiltonian Mechanics

Hamiltonian systems have structure — symplectic geometry, conserved quantities,
time-reversal symmetry. Numerical methods that respect that structure give
qualitatively better long-time behavior.

## The formalism

```
L(q, q̇) = T - V
p = ∂L/∂q̇
H(q, p) = Σ p_i q̇_i - L

Hamilton's equations:
  q̇ = ∂H/∂p
  ṗ = -∂H/∂q
```

Conserved: H (autonomous), plus every symmetry by Noether's theorem (translation
→ momentum, rotation → angular momentum, time invariance → energy).

## Symplectic integration

Standard integrators (Euler, RK4) do not preserve the symplectic form; energy
drifts secularly. Symplectic integrators keep energy bounded.

**Velocity Verlet (separable H = T(p) + V(q)):**

```python
def velocity_verlet(q, p, dt, force, mass):
    p_half = p + 0.5 * dt * force(q)
    q_new  = q + dt * p_half / mass
    p_new  = p_half + 0.5 * dt * force(q_new)
    return q_new, p_new
```

- **Second-order, time-reversible, symplectic.** Energy oscillates but does not
  drift.
- **Higher order:** Yoshida composition (4th order), implicit symplectic
  Runge–Kutta for non-separable H.
- **Adaptive step size breaks symplecticity.** Use fixed steps, or a symplectic
  method with a time transformation.

## The checks that matter

1. **Energy conservation** (or bounded oscillation) over the integration window.
   Plot E(t); a secular trend means the integrator or the step is wrong.
2. **Momentum/angular momentum conservation** where the symmetry holds.
3. **Time reversibility:** integrate forward then backward; you should return to
   the initial state to within roundoff.
4. **Phase-space structure:** for a non-integrable system, check KAM tori and
   the onset of chaos (Poincaré section, Lyapunov exponent).

## Lagrangian and variational methods

- **Euler–Lagrange:** `d/dt(∂L/∂q̇) - ∂L/∂q = 0`. Use when constraints are
  holonomic and generalized coordinates simplify the problem.
- **Constraints:** Lagrange multipliers for holonomic; RATTLE/SHAKE for
  constrained MD.
- **Variational integrators** (discretize the action, not the equations) inherit
  the geometric structure; good for long-time simulation.

## When to use which formalism

| Situation | Formalism |
|---|---|
| Few degrees of freedom, analytic insight | Hamiltonian / Lagrangian |
| Long-time molecular simulation | Symplectic (Verlet) |
| Dissipative systems | Not Hamiltonian; use appropriate ODE methods |
| Field theory | Hamiltonian density / Lagrangian density |
| Optimal control | Pontryagin (Hamiltonian structure) |

## Reporting a simulation

State: the Hamiltonian and its parameters, the integrator and its order, the
time step and how it was chosen, the integration length, the energy drift or
oscillation measured, other conserved quantities checked, and the initial
conditions and their sampling.
