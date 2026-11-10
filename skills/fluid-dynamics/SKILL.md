---
name: fluid-dynamics
description: Analyze and simulate fluid flow — conservation laws, turbulence, CFD setup, and validation. Use for transport, flow modeling, and fluid-structure problems.
category: physics
tags: [fluids, cfd, turbulence, navier-stokes, transport]
disable-model-invocation: true
---

# Fluid Dynamics

Fluid problems live or die on non-dimensional numbers, boundary conditions, and
grid convergence. A colorful velocity field is not a validated result.

## The governing equations

```
Continuity:   ∇·u = 0                         (incompressible)
Momentum:     ∂u/∂t + (u·∇)u = -∇p/ρ + ν∇²u + f
```

Incompressible Navier–Stokes. Compressible adds the energy equation and an
equation of state.

## The non-dimensional numbers

| Number | Definition | Meaning |
|---|---|---|
| Re = UL/ν | inertia / viscosity | turbulence threshold, flow regime |
| Ma = U/a | flow / sound speed | compressibility |
| Fr = U/√(gL) | inertia / gravity | free-surface behavior |
| We = ρU²L/σ | inertia / surface tension | droplet/bubble breakup |
| Pr = ν/α | momentum / thermal diffusion | heat transfer |
| Pe = UL/D | advection / diffusion | scalar transport |

**State Re and the relevant numbers in every result.** "Turbulent flow" without
Re is not a description.

## CFD setup

1. **Geometry and mesh.** Mesh resolution must resolve the boundary layer
   (`y+` for wall-resolved RANS/LES) and the smallest relevant eddies (LES).
   State `y+` and the mesh count.
2. **Boundary conditions.** Inlet profile, outlet condition (outflow/pressure),
   walls (no-slip, slip, moving), symmetry. Wrong BCs produce plausible wrong
   flow.
3. **Turbulence model.** Laminar (Re low), RANS (k-ω SST, k-ε) for
   engineering quantities, LES/DNS for unsteady physics. State the model and its
   constants; RANS is a modeling choice with consequences.
4. **Solver settings.** Discretization schemes (upwind vs central), pressure-
   velocity coupling (SIMPLE, PISO), time step, convergence criteria.

## Grid convergence (mandatory)

Solve on three systematically refined meshes and compute the Grid Convergence
Index (GCI, Roache):

```
order p from the three grids, then GCI = F_s · |ε| / (r^p - 1)
```

A result reported on one mesh is a grid-dependent number, not a solution.

## Validation

- **Verification:** does the code solve the equations right? (MMS, method of
  manufactured solutions.)
- **Validation:** does the model represent reality? Compare to experiment or
  benchmark (cylinder flow, lid-driven cavity, backward-facing step, Turek-Hron).
- Report both; they are different questions.

## Analytical checks

- **Mass conservation:** flux in = flux out for steady incompressible flow.
- **Momentum balance** across a control volume.
- **Symmetry:** if the geometry and BCs are symmetric, the solution must be.
- **Fully developed flow:** Poiseuille profile `u = (1/2μ)(-dp/dx)(R² - r²)` is a
  standard code check.

## Reporting

State: the equations and their non-dimensional form, Re and other relevant
numbers, the mesh (count, `y+`, refinement study, GCI), the turbulence model and
its constants, the BCs, the solver and discretization, the convergence criteria,
the validation case, and the uncertainty band.
