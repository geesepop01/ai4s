---
name: dynamical-systems
description: Analyze dynamical systems — stability, bifurcations, equilibria, chaos, and phase portraits. Use for nonlinear dynamics, feedback systems, and time-evolution models.
category: physics
tags: [dynamical-systems, stability, bifurcation, chaos, phase-portrait]
disable-model-invocation: true
---

# Dynamical Systems

A dynamical system is understood through its fixed points, their stability, and
the structure of phase space — not through a single trajectory.

## The framework

```
ẋ = f(x, μ)     x ∈ R^n, μ = parameter(s)

Fixed points:    f(x*) = 0
Stability:       eigenvalues of J = ∂f/∂x|_{x*}
  all Re(λ) < 0  → stable
  any  Re(λ) > 0 → unstable
  any  Re(λ) = 0 → bifurcation point / center (need more analysis)
```

## Stability analysis

1. **Find the fixed points** analytically where possible, numerically otherwise.
2. **Linearize:** compute the Jacobian and its eigenvalues at each fixed point.
3. **Classify:** node, saddle, spiral, center (2D), and the higher-dimensional
   analogues.
4. **Check nonlinear terms** when eigenvalues are marginal — linearization does
   not decide at Re(λ) = 0. Center manifold reduction is the tool.

## Bifurcations

| Type | Signature | Example |
|---|---|---|
| Saddle-node | two fixed points collide and disappear | tipping points |
| Transcritical | two fixed points exchange stability | logistic competition |
| Pitchfork | one → three (symmetric) | buckling, phase transition |
| Hopf | fixed point loses stability to a limit cycle | oscillations onset |
| Period-doubling | route to chaos | logistic map, Lorenz |

**A bifurcation diagram** — the attractor's structure as a function of μ — is
the standard figure. Compute it by continuing a branch or by sweeping μ and
discarding transients.

## Phase portraits

- Plot nullclines (ẋ = 0 and ẏ = 0) and their intersections (the fixed points).
- Draw the flow: streamlines or a quiver with time direction.
- Mark stable/unstable manifolds for saddles — they organize the phase space.
- For 3D+: Poincaré sections are more informative than trajectories.

## Chaos

- **Sensitive dependence:** positive maximal Lyapunov exponent. Compute it from
  two nearby trajectories (Benettin algorithm) with renormalization.
- **Strange attractor:** fractal dimension (correlation dimension), bounded but
  aperiodic.
- **Distinguish chaos from noise and from quasi-periodicity.** A long transient
  is neither. Check the Lyapunov spectrum and the recurrence structure.
- **Numerical caution:** a chaotic trajectory diverges from the exact solution
  exponentially. Long-time predictions are impossible; statistical properties
  are the meaningful output.

## Numerical tools

- `scipy.integrate.solve_ivp` for trajectories (see `ode-solver`).
- `PyDSTool`, `AUTO`, `MATCONT` for numerical continuation and bifurcation
  tracking.
- `nolds` / custom implementations for Lyapunov exponents and dimensions.
- `sympy` for analytical Jacobians and exact fixed points.

## Reporting

State: the model and its parameters, the fixed points and their stability with
the eigenvalues, the bifurcation type and its location (with the method used to
find it), the numerical method and tolerance, the transient discarded, and — for
chaos — the Lyapunov exponent and how it was computed.
