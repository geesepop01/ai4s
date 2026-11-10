---
name: pde-solver
description: Solve partial differential equations — finite differences, finite elements, spectral methods, and physics-informed neural networks. Use for field problems, transport, wave equations, and continuum models.
category: physics
tags: [pde, fem, finite-difference, spectral, pinns]
disable-model-invocation: true
---

# PDE Solver

A PDE solution is only as good as its discretization, its boundary conditions,
and the evidence that the numerical solution converges to the continuous one.

## Choosing the method

| Situation | Method |
|---|---|
| Regular geometry, simple BCs | Finite differences (fast to implement, easy to verify) |
| Complex geometry, variable coefficients | Finite elements (FEniCS, deal.II, scikit-fem) |
| Smooth periodic problems | Spectral / pseudo-spectral (exponential convergence) |
| Conservation laws, shocks | Finite volume (conservative by construction) |
| No mesh, sparse data, inverse problems | PINNs (DeepXDE, NVIDIA Modulus) |
| Wave propagation | Spectral or high-order FD with absorbing BCs |

## Boundary and initial conditions

**The BCs are part of the problem statement, not a detail.** State them:

- Dirichlet (value specified), Neumann (derivative/flux), Robin (mixed),
  periodic, absorbing/sommerfeld (for waves).
- Well-posedness: a diffusion equation needs one BC per boundary and one IC;
  a wave equation needs both u and ∂u/∂t. Getting this wrong produces a
  solution that is not the problem's.

## Discretization discipline

1. **Mesh refinement study.** Solve on h, h/2, h/4 and compute the observed
   order of convergence `p = log2(||e_h|| / ||e_{h/2}||)`. If it does not match
   the method's theoretical order, the implementation or the BCs are wrong.
2. **Time-step and space-step coupling.** Explicit methods need CFL: `c·Δt/Δx ≤
   1` (wave), `α·Δt/Δx² ≤ 1/2` (diffusion). Violating CFL is unstable, not
   inaccurate — it explodes.
3. **Stability vs accuracy.** Implicit methods are unconditionally stable but
   still need a small enough step for accuracy.
4. **Conservation.** Check that mass, energy, or momentum is conserved as the
   continuous equation requires. Finite volume guarantees conservation; FD/FEM
   only approximately.

## Physics-informed neural networks

```python
import deepxde as dde
# u_t = ν u_xx on [0,1], t in [0,1]
geom = dde.geometry.Interval(0, 1)
timedomain = dde.geometry.TimeDomain(0, 1)
geomtime = dde.geometry.GeometryXTime(geom, timedomain)

def pde(x, y):
    dy_t = dde.grad.jacobian(y, x, i=0, j=1)
    dy_xx = dde.grad.hessian(y, x, i=0, j=0)
    return dy_t - nu * dy_xx

bc = dde.icbc.DirichletBC(geomtime, lambda x: 0, lambda _, on_b: on_b)
ic = dde.icbc.IC(geomtime, lambda x: np.sin(np.pi * x[:, 0:1]), lambda _, on_i: on_i)
data = dde.data.TimePDE(geomtime, pde, [bc, ic], num_domain=2000, num_boundary=100)
```

**PINN caveats:** they are weak at sharp fronts and stiff problems; the loss
weights between PDE residual and BC/IC matter; and a low training loss is not a
verification of the solution. Verify against a classical solver on a test case.

## Verification (the essential step)

- **Manufactured solution (MMS).** Pick an analytic u(x,t), derive the source
  term that makes it a solution, solve, and measure the error. This is the
  gold-standard code verification.
- **Method of exact solutions** where one exists (separation of variables,
  Green's functions).
- **Convergence order** as above.
- **Grid-independent result:** the quantity you report must be stable under
  refinement.

## Reporting

State: the PDE, its BCs and ICs, the method and its order, the mesh/time-step
and the refinement study, the observed convergence order, the conservation
check, the solver and its tolerances, and the range of parameters over which the
solution was validated.
