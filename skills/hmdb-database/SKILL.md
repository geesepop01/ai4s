---
name: hmdb-database
description: Query the Human Metabolome Database for metabolite identification, concentrations, and biological context. Use for metabolomics and metabolite interpretation.
category: databases
tags: [hmdb, metabolomics, metabolites, biomarkers, mass-spectrometry]
disable-model-invocation: true
---

# HMDB

HMDB is the reference for human metabolite data: concentrations, biological
fluids, pathways, and spectral references. Its concentration data is compiled
from the literature and varies widely in quality.

## Access

```python
import requests

# Search
r = requests.get("https://hmdb.ca/metabolites.json",
                 params={"search": "glucose"}).json()

# Metabolite record
r = requests.get("https://hmdb.ca/metabolites/HMDB0000122.json").json()
```

XML downloads are available for bulk access; the REST API is rate-limited.

## Metabolite identification (the hard part)

In untargeted metabolomics, a feature is not a metabolite until identified:

| MSI level | Evidence | Confidence |
|---|---|---|
| 1 | Authenticated standard, two orthogonal properties | Confirmed |
| 2 | Spectral library match (MS/MS) | Putative |
| 3 | Class-level, or diagnostic evidence | Putative class |
| 4 | Unknown feature | Unknown |

**Report the MSI identification level for every metabolite named.** A "putative
annotation" (level 2) is not a confirmation.

## Concentration data

- HMDB concentrations are **compiled from many studies** across populations,
  methods, and conditions. They are reference ranges, not ground truth.
- **Biological fluid matters** (serum, plasma, urine, CSF). Values are not
  interchangeable.
- **Fasted vs fed, diurnal, and disease state** change concentrations.
- Report the fluid, the study source, and the range — not a single number.

## Mass spectrometry cross-references

- **m/z, retention time, and MS/MS spectra** links to experimental references.
- **Adduct and ionization mode** matter for matching; a feature matched in ESI+
  is not the same evidence as one in ESI−.
- **Isomeric compounds** (leucine/isoleucine) cannot be distinguished by mass
  alone. State when a feature resolves to an isomer group.

## Pathway context

- HMDB links to KEGG, Reactome, and SMPDB pathways.
- **A metabolite in a pathway does not mean the pathway is active.** The same
  caution as any pathway analysis.

## Reporting

State: the HMDB accession, the MSI identification level, the evidence for the
identification (spectral match, standard, RT), the biological fluid and the
preparation, the concentration with its source and range, the adduct/ionization
mode for MS-based work, and the isomer ambiguity where it exists.

## Anti-patterns

- Naming a metabolite from an accurate-mass match alone (that is MSI level 3–4).
- Reporting an HMDB concentration as the expected value for your cohort.
- Ignoring isomer ambiguity.
- Citing a pathway conclusion from metabolite presence alone.
