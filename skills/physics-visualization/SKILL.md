---
name: physics-visualization
description: Produce figures for physics results — fields, phase spaces, vector plots, spectra, dispersion relations, and uncertainty bands. Use for any physics figure that must read correctly to a physicist.
category: visualization
tags: [physics, fields, spectra, phase-space, simulation]
disable-model-invocation: true
---

# Physics Visualization

Physics figures carry units, uncertainties, and often multi-dimensional
structure. The conventions exist so a reader can extract a number from the image.

## Field and scalar data

| Data | Plot |
|---|---|
| Scalar field on a grid | `imshow`/`pcolormesh` with a colorbar labeled with units and scale |
| Vector field | Quiver or streamlines, with a magnitude reference |
| 2D scalar + contours | Filled contours plus line contours at meaningful levels |
| 3D scalar | Slices or isosurfaces, not a solid blob |

```python
fig, ax = plt.subplots()
c = ax.pcolormesh(X, Y, T, cmap="inferno", shading="auto")
cb = fig.colorbar(c, ax=ax); cb.set_label("Temperature (K)")
ax.set_xlabel("x (m)"); ax.set_ylabel("y (m)")
ax.set_aspect("equal")
```

**Rules:** colorbar with units; aspect ratio that preserves the physics (equal
for isotropic domains); the colormap range is stated (do not let autoscaling
hide the dynamic range); for signed data use a diverging colormap centered at
zero.

## Spectra and dispersion

- **Axes:** frequency/wavelength/wavenumber with units; magnitude in dB or
  linear — stated.
- **Peaks are labelled** with their value, not left to be eyeballed.
- **Windowing and resolution** noted when they affect what is visible. A peak
  that exists only because of the FFT length is not a peak.
- **Dispersion relations:** plot ω(k) with the theoretical curve overlaid;
  state the units of k (rad/m vs 1/m vs normalized).

## Phase space and trajectories

- Trajectories colored by time (with a colorbar), not by arbitrary index.
- Fixed points and limit cycles marked explicitly.
- The same axes limits across panels being compared.

## Uncertainty and fits

- **Data points with error bars** (state: SD, SEM, or CI, and n).
- **Fit curves** drawn over the data, with the fitted parameters in the caption
  and their uncertainties.
- **Residuals panel** when a fit is the point. A fit that looks good in the main
  panel can have structured residuals.
- **Never smooth without saying so.** A smoothed line without a stated method is
  an undocumented transformation of the data.

## Units and dimension

- Every axis label carries units. A dimensionless axis is labelled as such
  (e.g. "t / τ").
- Unit conversions are stated in the caption when the natural unit is not the
  plotted unit.
- When comparing to theory, plot in the units the theory uses so the comparison
  is direct.

## Computational physics figures

- **Convergence:** plot the error against grid size / timestep on log-log axes;
  a convergence figure is the evidence that the numerical result is the answer
  to the equation.
- **Conservation checks:** plot the conserved quantity over time; drift is the
  diagnostic.
- **Phase diagrams:** state the order parameter, the scan resolution, and the
  boundary-finding method.

## Before shipping

- [ ] Units on every axis and colorbar.
- [ ] Aspect ratio preserves the physics.
- [ ] Colormap range stated and appropriate (diverging for signed data).
- [ ] Error bars labelled with what they are and n.
- [ ] Fit parameters and their uncertainties reported.
- [ ] Numerical results accompanied by a convergence or conservation check where
      the claim is numerical.
