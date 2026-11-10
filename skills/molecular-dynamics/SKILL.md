---
name: molecular-dynamics
description: Run and analyze molecular dynamics simulations — system setup, equilibration, force fields, sampling, free energy, and error analysis. Use for atomistic or coarse-grained MD studies.
category: physics
tags: [molecular-dynamics, force-field, simulation, free-energy, gromacs]
disable-model-invocation: true
---

# Molecular Dynamics

MD is a sampling method. The question is never "did the simulation run" but
"did it sample the ensemble the claim depends on."

## The workflow

```
1. System setup   — coordinates, topology, force field, solvent, ions
2. Minimization   — remove bad contacts
3. Equilibration  — NVT then NPT, until properties stabilize
4. Production     — the run you analyze, at fixed ensemble
5. Analysis       — properties, errors, convergence
```

## System setup

- **Force field choice** is a scientific decision: AMBER (proteins, nucleic
  acids), CHARMM (membranes, proteins), OPLS (small molecules), GROMOS
  (coarse-grained). State it and the water model (TIP3P, SPC/E, TIP4P/2005);
  the water model affects the answer.
- **Protonation states** at the pH of interest. Check pKa of His, Cys, Glu, Asp
  in context — the default is often wrong.
- **Box size:** at least 1.0–1.2 nm beyond the solute with periodic boundaries.
  Too small a box creates self-interaction artifacts.
- **Ions** to neutralize and to the target ionic strength.

## Equilibration

- Minimize until the maximum force is below the threshold (typically 1000
  kJ/mol/nm).
- **NVT** first to reach temperature; then **NPT** to reach density. Do not skip
  NPT for condensed-phase work.
- Monitor temperature, pressure, density, energy. Equilibrium is when these
  plateau and stay there. **Equilibration length is determined by the data, not
  by a default.**

## Production and integration

- **Time step:** 1 fs with constrained H bonds (LINCS/SHAKE), 2 fs typical; 4 fs
  with hydrogen mass repartitioning. Larger is not free — check energy drift.
- **Cutoffs:** van der Waals 1.0–1.2 nm; electrostatics with PME (not a cutoff).
- **Thermostat:** velocity rescale or Nosé–Hoover (not Berendsen for production
  — it does not sample the true ensemble).
- **Barostat:** Parrinello–Rahman or Monte Carlo barostat for production.
- **Constraints:** LINCS/SHAKE on bonds to H.

## Sampling and convergence

**A single trajectory is one sample.** The claim needs converged sampling:

- **Block analysis:** split the trajectory into blocks; the property must be
  stable across blocks. Report the block average and its spread.
- **Autocorrelation time:** `N_eff ≈ N_frames / (2τ)`. Report the effective
  sample size, not the frame count.
- **Multiple independent replicas** are stronger than one long run. Report the
  between-replica variance.
- **Enhanced sampling** (replica exchange, metadynamics, umbrella sampling) when
  the timescale exceeds the accessible window — and validate the method's
  convergence (e.g. PMF overlap in umbrella sampling).

## Free energy

- **Thermodynamic integration / FEP:** needs overlap between states; check the
  overlap matrix. Poor overlap is the most common source of a wrong ΔG.
- **Umbrella sampling:** WHAM/MBAR; check window overlap and the PMF's
  convergence along the reaction coordinate.
- **Metadynamics:** check for convergence via the free-energy surface's
  stabilization and by reweighting.

## Errors

Report: the block analysis or replica spread, the effective sample size, and
the sensitivity to the setup choices you made (cutoff, force field, box size).
An MD result without an error estimate is an anecdote.

## Before reporting an MD result

- [ ] Force field and water model stated.
- [ ] Equilibration justified by the property's plateau.
- [ ] Ensemble and thermostat/barostat appropriate for the claim.
- [ ] Sampling convergence shown (blocks/replicas, not one trajectory).
- [ ] Error bars from block analysis or replica spread.
- [ ] System-size and setup sensitivity addressed.
