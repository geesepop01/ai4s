---
name: materialsscience-databases
description: Access materials science databases — Materials Project, AFLOW, OQMD, and crystallographic resources. Use for materials property lookup and crystal structure analysis.
category: databases
tags: [materials, materials-project, crystallography, dft, properties]
disable-model-invocation: true
---

# Materials Science Databases

Materials databases store computed (DFT) and experimental properties. The two
are different evidence and must be labelled distinctly.

## Databases

| Source | Content | Evidence type |
|---|---|---|
| Materials Project (MP) | DFT structures, energies, band gaps | Computed |
| AFLOW | DFT properties, prototypes | Computed |
| OQMD | Thermodynamic quantities | Computed |
| ICSD | Experimental crystal structures | Experimental (licensed) |
| COD | Open crystal structures | Experimental |
| NOMAD | Calculations and workflows | Computed |
| NIST WebBook | Thermophysical/spectral data | Experimental |

## The Materials Project API

```python
from mp_api.client import MPRester

with MPRester("API_KEY") as mpr:
    docs = mpr.summary.search(material_ids=["mp-149"], fields=["material_id", "band_gap", "formation_energy_per_atom"])
    # Structure
    struct = mpr.get_structure_by_material_id("mp-149")
```

## Computed vs experimental

- **DFT band gaps are systematically underestimated** (PBE underestimates by
  ~30–50%). Report the functional and the correction (GGA/GGA+U/HSE).
- **Formation energies** depend on the phase diagram reference; state the
  chemical potential limit.
- **Elastic, magnetic, and dielectric properties** carry the calculation's
  settings; report the functional, U values, and convergence parameters.

## Crystallography

- **Structure comparison** by space group, lattice parameters, and Wyckoff
  positions. Match structures with `pymatgen`'s StructureMatcher; report the
  tolerance.
- **Phase diagrams** from computed energies; the stability window depends on
  the chemical potentials.
- **Polymorphs:** report the phase; different polymorphs have different
  properties.

## Property interpretation

- **A computed property is a prediction with a method error.** Report the
  method alongside the value.
- **Stability:** `energy_above_hull = 0` means thermodynamically stable within
  the computed phase diagram; it does not mean synthesizable.
- **Hull distance** is the standard stability metric; report it.

## Reporting

State: the database and its version, the material identifier (mp-id, aflow-id),
the evidence type (computed/experimental), the calculation method (functional,
U, cutoff) for computed values, the phase/polymorph, the property's conditions
(temperature, pressure), and the known systematic error for the method.

## Anti-patterns

- Reporting a DFT value as an experimental measurement.
- Ignoring the functional's systematic error (e.g. band gaps).
- Claiming synthesizability from hull stability alone.
- Mixing computed and experimental values in one table without labels.
