---
name: wave-propagation
description: Analyze and simulate wave propagation — dispersion, reflection, diffraction, and wave equations. Use for acoustics, optics, seismic, and electromagnetic wave problems.
category: physics
tags: [waves, acoustics, optics, dispersion, scattering]
disable-model-invocation: true
---

# Wave Propagation

Wave problems are governed by dispersion relations, boundary conditions, and
the distinction between propagating, evanescent, and resonant behavior. A
snapshot of a wavefield is not an analysis.

## Governing equations

```
Wave equation:     ∂²u/∂t² = c² ∇²u
Helmholtz:         ∇²u + k² u = 0    (time-harmonic, k = ω/c)
Dispersion:        ω = ω(k)          — the relation that defines the medium
```

The **dispersion relation** is the central object. It gives phase velocity
`v_p = ω/k`, group velocity `v_g = dω/dk`, and the conditions for propagation.

## Key phenomena

| Phenomenon | Condition | What to check |
|---|---|---|
| Reflection | impedance mismatch | reflection coefficient, phase change |
| Refraction | index contrast | Snell's law, total internal reflection |
| Diffraction | aperture ~ wavelength | Fresnel vs Fraunhofer regime |
| Interference | coherent sources | path difference vs wavelength |
| Evanescence | k² < 0 | exponential decay, no energy transport |
| Resonance | boundary match | Q factor, mode structure |
| Dispersion | ω nonlinear in k | pulse broadening, v_g ≠ v_p |

## Numerical methods

| Method | Use |
|---|---|
| FDTD (finite-difference time-domain) | broadband, complex geometry, EM |
| Spectral methods | periodic, smooth, high accuracy |
| BEM (boundary element) | radiation/scattering, infinite domain |
| FEM (Helmholtz) | complex geometry, frequency domain |
| Ray tracing | high-frequency limit (ka ≫ 1) |
| Angular spectrum | propagation in layered/periodic media |

**Grid resolution:** at least 10–20 points per wavelength for FDTD, and check
numerical dispersion — a coarse grid disperses differently from the physical
medium.

## Verification

1. **Analytical solution.** Plane wave, Gaussian beam, reflection from a
   half-space. Match amplitude, phase, and the dispersion relation.
2. **Energy conservation.** For lossless media, the flux through two surfaces
   must match.
3. **Reciprocity.** Swapping source and receiver gives the same result.
4. **Convergence.** Refine the grid and the time step until the quantity of
   interest is stable; report the numerical dispersion.
5. **Boundary reflections.** Absorbing boundaries (PML, Mur) must not reflect.
   Test with a pulse that would otherwise leave the domain.

## Common errors

- Confusing phase and group velocity when reporting propagation speed.
- Numerical dispersion mistaken for physical dispersion.
- A grid that under-resolves the wavelength, producing amplitude decay that is
  not attenuation.
- Absorbing boundaries too close to the region of interest.
- Reporting a time snapshot instead of the steady-state or the spectrum when the
  claim is about frequency behavior.

## Reporting

State: the wave equation and the medium's dispersion relation, frequency/wavelength
range, the numerical method and its dispersion properties, grid points per
wavelength, the boundary treatment, the verification against an analytical case,
and what quantity is reported (amplitude, phase, energy flux, spectrum).
