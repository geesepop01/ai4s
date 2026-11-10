---
name: ode-solver
description: Solve ordinary differential equations numerically and verify the solution. Use for dynamical systems, kinetics, compartment models, and any initial-value problem.
category: physics
tags: [ode, diffeq, numerical, kinetics, dynamical-systems]
disable-model-invocation: true
---

# ODE Solver

Solving an ODE is easy. Solving it correctly — with the right method, the right
tolerances, and verification that the answer is the equation's solution — is the
work.

## Choosing the method

| Problem | Method |
|---|---|
| Non-stiff, smooth | `RK45` (Dormand–Prince), `DOP853` for tight tolerance |
| Stiff (fast and slow timescales) | `Radau`, `BDF`, `LSODA` |
| Symplectic / Hamiltonian | Velocity Verlet / Yoshida (see `hamiltonian-mechanics`) |
| With events (switching, thresholds) | Event-capable solvers (`solve_ivp` events) |
| Delay differential equations | `jitcdde`, `ddeint` |
| Boundary value problems | `solve_bvp`, shooting methods |

**Stiffness is the main decision.** If the Jacobian has eigenvalues spanning many
orders of magnitude, use an implicit method. Symptoms of stiffness: explicit
solvers taking tiny steps, or failing despite a smooth problem.

## scipy.integrate.solve_ivp

```python
from scipy.integrate import solve_ivp
import numpy as np

def f(t, y):
    return [-0.5 * y[0] + y[1], -0.2 * y[1]]

sol = solve_ivp(f, [0, 50], [1.0, 0.0], method="Radau",
                rtol=1e-8, atol=1e-10, dense_output=True)
assert sol.success
y = sol.sol(np.linspace(0, 50, 500))
```

**Tolerances matter.** `rtol`/`atol` determine the answer. Tighten them until
the quantity you report stops changing; report the tolerance you used.

## Verification (do this every time)

1. **Convergence in tolerance.** Solve at `rtol=1e-6, 1e-8, 1e-10`. If the
   reported quantity changes, the tolerance is too loose.
2. **Convergence in step size** (for fixed-step methods): halve `dt` until the
   answer stops moving. Report the order of convergence if the method claims one.
3. **Conserved quantities.** Energy, mass, charge — whatever the system
   conserves. Drift is the diagnostic.
4. **Analytical limits.** A linearized version of the system often has a known
   solution. Match it.
5. **Residual check.** Differentiate the computed solution numerically and
   compare to `f(t, y)`; the residual should be at the tolerance level.
6. **Independent method.** Compare an explicit and an implicit solver on the same
   problem. Agreement is evidence.

## Common pitfalls

- **Silent failure.** `solve_ivp` returns `success=False` without raising. Check
  it.
- **Unstable discretization.** Explicit Euler on a stiff problem explodes or
  oscillates; that is the method, not the physics.
- **Events not located.** Event times are interpolated; refine `max_step` if the
  event is missed.
- **Vectorization bugs.** `y[0]` vs `y[1]` swapped in the RHS is common and only
  shows up as a wrong trajectory.
- **Units in the RHS.** Rates in s⁻¹ with time in minutes gives a 60× error.
- **Interpreting an unstable numerical artifact as a physical instability.** Check
  step-size convergence before claiming chaos or divergence.

## Reporting

State: the equation, the method and its order, the tolerance or step size and
how it was validated, the initial conditions, the integration interval, the
conserved-quantity or residual check, and the convergence evidence.
