---
name: chembl-database
description: Query ChEMBL for compound bioactivity, target, and assay data. Use for retrieving and correctly comparing potency and selectivity measurements.
category: databases
tags: [chembl, bioactivity, compounds, potency, assays]
---

# ChEMBL

ChEMBL is the reference for curated quantitative bioactivity data. Its value is
the assay context; its trap is comparing numbers that were measured differently.

## The API

```python
import requests

# Molecule
r = requests.get("https://www.ebi.ac.uk/chembl/api/data/molecule/CHEMBL25.json").json()
print(r["pref_name"], r["molecule_structures"]["canonical_smiles"])

# Activities for a target
r = requests.get("https://www.ebi.ac.uk/chembl/api/data/activity",
                 params={"target_chembl_id": "CHEMBL203",
                         "standard_type": "IC50",
                         "limit": 1000}).json()
```

## The assay is the measurement context

**Never compare IC50 values across assays without checking the assay:**

- **Assay type:** binding (B) vs functional (F) vs ADMET (A) — different
  questions.
- **Assay organism and tissue.** Human vs rat vs cell-free gives different
  numbers.
- **The `assay_chembl_id`** links to the assay description. Read it.
- **Confidence score** (0–9): how reliably the assay is linked to the target.
  9 = direct single protein target; lower = homologous or non-specific.
- **`standard_relation`**: `=`, `<`, `>`. A `>` value is a bound, not a
  measurement. Do not treat censored data as exact.

## Potency values

| Field | Meaning |
|---|---|
| `standard_type` | IC50, EC50, Ki, Kd, potency... — the measurement type |
| `standard_value` | Normalized numeric value |
| `standard_units` | nM, uM, etc. — normalized to nM in `standard_value` |
| `pchembl_value` | -log10(molar) — comparable across assays of the same type |
| `data_validity_comment` | Flags for suspect values |

**Use `pchembl_value` for cross-compound comparison of the same measurement
type.** It normalizes units and scale. Still filter by assay type and
confidence.

## Selectivity

Selectivity requires comparing the same compound, the same measurement type,
across targets — ideally in the same assay format. A compound's IC50 in one
target's functional assay versus another's binding assay is not a selectivity
ratio.

## Structure searching

```python
r = requests.get("https://www.ebi.ac.uk/chembl/api/data/similarity/{smiles}/80.json").json()
```

Similarity is Tanimoto on ECFP unless specified. State the fingerprint and the
threshold; "similar" is method-dependent.

## Reporting

State: the ChEMBL version, the molecule and target identifiers, the assay type
and confidence score, the measurement type (IC50/Ki/Kd) and its relation (=,<,>),
the pchembl values with their assay context, the number of measurements and
their spread, and — for selectivity — that the comparison is across matched
assay formats.

## Anti-patterns

- Comparing IC50 values across different assay types.
- Treating `<` or `>` values as exact measurements.
- Reporting a single potency value as "the" IC50 for a compound.
- Ignoring the confidence score.
- Claiming selectivity from unmatched assay formats.
