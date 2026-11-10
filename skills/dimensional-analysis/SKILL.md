---
name: dimensional-analysis
description: Check equations, code, and results with dimensional analysis. Use when deriving, implementing, or auditing any quantitative model where physical units must be consistent.
category: physics
tags: [units, dimensions, physics, derivation, checking]
disable-model-invocation: true
---

# Dimensional Analysis

A quantity with the wrong dimension is a bug, not a rounding error. Dimensional
analysis is the cheapest correctness check in quantitative work, and it catches
errors that testing misses.

## The discipline

Carry units explicitly through every derivation and every line of a calculation.
Dropping units early is dropping the check.

```
Force      [M L T^-2]
Energy     [M L^2 T^-2]
Pressure   [M L^-1 T^-2]
Power      [M L^2 T^-3]
Diffusivity[L^2 T^-1]
```

## Checking an equation

Both sides must have the same dimensions. Every term in a sum must have the
same dimensions. Arguments of transcendental functions (`sin`, `exp`, `log`)
must be dimensionless.

```python
# Bad: the argument of exp is dimensional
rate = A * exp(-Ea / (k * T))     # Ea/(k*T) is dimensionless ✓

# Bad: adding terms of different dimensions
x = v * t + 0.5 * a               # [L] + [L T^-2] ✗
x = v * t + 0.5 * a * t**2        # ✓
```

## Checking code

Every physical constant carries its unit at the boundary. Prefer a units library
over a comment:

```python
import pint
ureg = pint.UnitRegistry()
Q = 5.0 * ureg("mL/min")
V = 2.0 * ureg("L")
tau = V / Q                         # unit-aware; tau.to("min") → 400 min
```

**Tools:** `pint` (Python, general), `astropy.units` (astronomy), `unyt`,
`SymPy.physics.units` (symbolic). In R: `units` package.

For a symbolic derivation, let the CAS carry the dimensions:

```python
import sympy as sp
from sympy.physics.units import joule, kilogram, meter, second
```

## Non-dimensionalization

Dimensionless groups are how physics is organized:

| Group | Meaning |
|---|---|
| Re = ρvL/μ | inertia vs viscosity |
| Pe = vL/D | advection vs diffusion |
| Da = reaction rate / transport rate | reaction vs transport |
| Kn = λ/L | molecular vs continuum |

When deriving, identify the dimensionless groups first. A result expressed in
them is general; a result expressed in raw variables is a special case.

## Common unit traps

- **Degrees vs radians.** `sin(x)` in code assumes radians; a "90" in degrees is
  not `sin(90)`.
- **Per-time vs per-step.** A rate in s⁻¹ applied to a step of dt seconds needs
  the dt.
- **SI prefixes.** mm vs m, ms vs s. A factor of 1000 is the most common
  physical-unit bug.
- **Bytes vs bits.** 1 GB/s vs 1 Gb/s is 8×.
- **Calendar vs elapsed time.** Years of 365 vs 365.25 days in astronomical or
  geological work.
- **Normalized quantities.** A value "normalized to control" is dimensionless;
  do not re-attach the original unit.

## The check before reporting

For every reported quantity:

1. Write the unit explicitly next to the number.
2. Confirm the magnitude is physically plausible (a human reaction time of
   1000 s is wrong even if the code ran).
3. Confirm the unit in the figure/table is the unit in the computation.
4. If a value is dimensionless (correlation, fraction, normalized), say so.

A quantity that passes dimensional analysis can still be wrong. A quantity that
fails it is definitely wrong.
