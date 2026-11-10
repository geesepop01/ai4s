---
name: physics-databases
description: Access physics data repositories — NIST, Particle Data Group, astro databases, and physical constants. Use for authoritative physical reference data.
category: databases
tags: [physics, nist, constants, reference-data, pdg]
disable-model-invocation: true
---

# Physics Databases

Physical reference data is authoritative and versioned. Using it correctly means
citing the source and the version, and respecting the reported uncertainty.

## Sources

| Source | Content | Notes |
|---|---|---|
| NIST Chemistry WebBook | Thermochemistry, spectra, kinetics | Authoritative; cite the source |
| NIST Reference on Constants, Units, Uncertainty | Physical constants (CODATA) | Cite the CODATA year |
| Particle Data Group (PDG) | Particle properties | Annual review; cite the edition |
| NIST SRD | Standard reference data | Includes uncertainty |
| IAEA/NNDC | Nuclear data | Half-lives, decay data |
| IAU/IERS | Astronomical constants, Earth orientation | Edition-dependent |
| CRC Handbook | Compiled reference data | Cite the edition |

## Constants

```python
from scipy.constants import c, h, k, N_A, physical_constants
print(physical_constants["Bohr magneton"])   # value, unit, uncertainty
```

- **Cite the CODATA adjustment year** (2018, 2022...) for any constant.
- **The uncertainty is part of the value.** `α = 7.2973525693(11)×10⁻³` — the
  parenthetical is the uncertainty in the last digits. Propagate it.
- **Exact values:** the SI redefinition (2019) made c, h, e, k, N_A exact. Do
  not report uncertainty for them.

## Uncertainty propagation

```
For f(x, y): σ_f² = (∂f/∂x)² σ_x² + (∂f/∂y)² σ_y²   (independent)
```

Report the propagated uncertainty with the derived quantity. A calculated value
without its uncertainty is not a measurement.

## Reference data usage

- **A reference value is a measurement with conditions.** NIST WebBook
  enthalpies are at a stated temperature and phase.
- **Phase and temperature matter.** A value for the gas phase is not the liquid
  value.
- **Isotopic composition** affects atomic weights and some properties.
- **Versioned.** Cite the database version or the review edition.

## Reporting

State: the source and its edition/version, the value with its uncertainty and
the uncertainty convention, the conditions (temperature, phase, isotopic
composition), the CODATA adjustment year for constants, and the propagation
method for derived quantities.

## Anti-patterns

- Reporting a constant without its CODATA year or uncertainty.
- Mixing values from different editions in one calculation.
- Quoting a reference value without its conditions (T, phase).
- Dropping uncertainty when propagating.
