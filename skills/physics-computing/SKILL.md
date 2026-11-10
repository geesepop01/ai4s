---
name: physics-computing
description: Numerical and symbolic physics computing. Use for differential equations, linear algebra, unit-aware calculation, symbolic derivation, and simulation with numpy, scipy, and sympy.
category: physics
tags: [physics, numerics, simulation, sympy, scipy, ode, linear-algebra]
disable-model-invocation: true
---

# Physics Computing

## Overview

Physics work is mostly numerics plus dimensional reasoning. This skill covers the
standard toolkit and the mistakes that quietly invalidate results.

## Installation

```bash
pip install numpy scipy sympy matplotlib
```

## Dimensional analysis first

Most physics errors are unit errors. Check dimensions **before** writing the solver.

```python
# Carry units explicitly through the derivation, then drop them in the code.
# A quantity with the wrong dimension is a bug, not a rounding issue.
```

When a result is off by ~10^3, 10^6, or ~9.8, suspect a unit conversion before
suspecting the physics. Record the unit of every array in a variable name or
comment — `length_m`, `energy_eV`, `time_s`.

## Symbolic derivation (sympy)

Derive before you approximate.

```python
import sympy as sp

t, m, k, x = sp.symbols('t m k x', positive=True)
omega = sp.sqrt(k / m)
sol = sp.dsolve(sp.Eq(m * sp.Derivative(x(t), t, 2), -k * x(t)), x(t))
print(sol)

# Verify a result by substitution rather than by inspection.
expr = sp.sin(x)**2 + sp.cos(x)**2
print(sp.simplify(expr))          # 1
print(sp.integrate(sp.exp(-x**2), (x, -sp.oo, sp.oo)))   # sqrt(pi)

# Exact eigenvalues of a linearised system
A = sp.Matrix([[0, 1], [-k/m, 0]])
print(A.eigenvals())
```

Use `sp.lambdify` to turn a verified expression into a fast numeric function:

```python
f = sp.lambdify(x, sp.sin(x) * sp.exp(-x), 'numpy')
```

## Numerical integration of ODEs

```python
import numpy as np
from scipy.integrate import solve_ivp

def damped_oscillator(t, y, gamma, omega0):
    x, v = y
    return [v, -2 * gamma * v - omega0**2 * x]

gamma, omega0 = 0.1, 1.0
sol = solve_ivp(
    damped_oscillator, [0, 50], [1.0, 0.0],
    args=(gamma, omega0),
    t_eval=np.linspace(0, 50, 2000),
    rtol=1e-10, atol=1e-12,      # tighten before trusting long integrations
    method='RK45',
)
```

**Stiff systems** need an implicit method — `method='BDF'` or `'Radau'`. A
non-stiff solver on a stiff system either crawls or silently produces garbage.

Always check solver health:

```python
assert sol.success, sol.message
print("steps:", len(sol.t), "final state:", sol.y[:, -1])
```

Re-run with tighter tolerances. If the answer moves, it was not converged.

## Conserved quantities as a correctness check

The strongest cheap test in physics computing: quantities that must be conserved
should stay conserved.

```python
def energy(y, m, k):
    x, v = y
    return 0.5 * m * v**2 + 0.5 * k * x**2

energies = [energy(sol.y[:, i], 1.0, 1.0) for i in range(sol.y.shape[1])]
drift = (max(energies) - min(energies)) / abs(np.mean(energies))
print(f"relative energy drift: {drift:.3e}")
```

Energy drift growing with step count means the integrator or the step size is
wrong. This catches errors that a plot will hide.

## Linear algebra

```python
import numpy as np
from scipy import linalg

A = np.array([[4.0, 1.0], [1.0, 3.0]])
w, v = np.linalg.eigh(A)          # eigh for symmetric/Hermitian — faster, real
print("eigenvalues:", w)

# Solve rather than invert.
b = np.array([1.0, 2.0])
x = np.linalg.solve(A, b)

# Diagnose conditioning before trusting a solution.
print("condition number:", np.linalg.cond(A))

# Decompositions when structure is known
lu = linalg.lu(A)
cho = linalg.cholesky(A)          # requires positive-definite
```

A condition number above ~1e12 means the answer has no significant digits left.
Report it, or regularise.

## Fourier and signal work

```python
from scipy import fft, signal

freqs = fft.rfftfreq(n, d=dt)
spectrum = fft.rfft(data)
power = np.abs(spectrum) ** 2

# Window before transforming non-periodic data, or you measure the window.
windowed = data * signal.windows.hann(n)

# Filter design: specify the cutoff in physical units, and check the response.
sos = signal.butter(4, cutoff_hz, btype='low', fs=sample_rate, output='sos')
filtered = signal.sosfiltfilt(sos, data)
```

## Monte Carlo and uncertainty

```python
rng = np.random.default_rng(42)

def propagate(n=200_000):
    a = rng.normal(1.0, 0.05, n)
    b = rng.normal(2.0, 0.10, n)
    return a * b

samples = propagate()
mean = samples.mean()
ci = np.percentile(samples, [2.5, 97.5])
print(f"{mean:.4f}  95% CI [{ci[0]:.4f}, {ci[1]:.4f}]")
```

Report uncertainties with every physical quantity. A number without an error bar
is not a measurement.

## Units library (optional)

For unit-safe arithmetic, `pint` handles conversion and dimensionality:

```python
import pint
ureg = pint.UnitRegistry()
distance = 3.0 * ureg.kilometer
time = 120.0 * ureg.second
print((distance / time).to(ureg.meter / ureg.second))
```

## Checklist before reporting a numerical result

- [ ] Dimensions check out
- [ ] Solver reported success
- [ ] Tolerances tightened; the answer did not move
- [ ] Conserved quantities stayed conserved
- [ ] Condition number acceptable, or regularisation applied
- [ ] Result reproduced with a different method or step size
- [ ] Uncertainty reported
- [ ] Physical plausibility checked against known limits (e.g. the small-parameter limit)
