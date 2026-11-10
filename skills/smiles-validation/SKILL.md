---
name: smiles-validation
description: Validate, standardize, and correct chemical structures from SMILES and other representations. Use whenever chemical strings must be trusted before computation.
category: chemistry
tags: [smiles, validation, standardization, structures, sanitization]
disable-model-invocation: true
---

# SMILES Validation

A string that looks like SMILES is not necessarily a chemically meaningful
molecule. Validation and standardization before computation prevents most
chemistry errors.

## Parsing and validation

```python
from rdkit import Chem
from rdkit.Chem.MolStandardize import rdMolStandardize

mol = Chem.MolFromSmiles(smiles)          # None if invalid
if mol is None:
    # Try to diagnose
    from rdkit import RDLogger
    # MolFromSmiles with sanitize=False to see where it fails
    m = Chem.MolFromSmiles(smiles, sanitize=False)
    problem = Chem.DetectChemistryProblems(m)
    for p in problem:
        print(p.GetType(), p.Message())
```

**Common failure causes:** valence errors, unclosed rings, invalid aromaticity,
bad stereochemistry, stray characters from copy-paste.

## Standardization

```python
from rdkit.Chem.MolStandardize import rdMolStandardize

unc = rdMolStandardize.Uncharger()
mol = un.uncharge(mol)

normalizer = rdMolStandardize.Normalizer()
mol = normalizer.normalize(mol)

tautomer = rdMolStandardize.TautomerEnumerator()
mol = tautomer.Canonicalize(mol)

parent = rdMolStandardize.FragmentParent(mol)   # largest fragment
```

**State the standardization applied:** uncharging, normalization, tautomer
canonicalization, salt stripping. Different standardization gives different
molecules and different properties.

## Stereochemistry

```python
Chem.AssignStereochemistryFrom3D(mol)   # from a 3D conformer
centers = Chem.FindMolChiralCenters(mol, includeUnassigned=True)
```

- **Unspecified stereocenters** produce ambiguous molecules. Enumerate them for
  a complete analysis, or state that stereo is unspecified.
- **Double bond stereo (E/Z)** matters for activity; `Chem.FindPotentialStereo`.

## Batch validation

```python
import pandas as pd
from rdkit import Chem

def validate_smiles_column(df, col="smiles"):
    results = []
    for i, s in enumerate(df[col]):
        m = Chem.MolFromSmiles(s) if isinstance(s, str) else None
        results.append({
            "row": i, "valid": m is not None,
            "canonical": Chem.MolToSmiles(m) if m else None,
            "inchikey": Chem.MolToInchiKey(m) if m else None,
        })
    return pd.DataFrame(results)

report = validate_smiles_column(df)
print(report["valid"].value_counts())
```

**Report the invalid fraction and the reasons.** A dataset with silently dropped
rows has a changed n.

## Identifier consistency

- **Canonical SMILES** for deduplication (different strings, same molecule).
- **InChIKey** for cross-database matching (first block = skeleton).
- **Salt/solvate forms** are different records; decide and state the policy.

## Common data problems

| Problem | Detection | Fix |
|---|---|---|
| Invalid valence | Parse failure | Fix source or drop |
| Salts/mixtures | Multiple fragments | FragmentParent |
| Unspecified stereo | `FindMolChiralCenters` flags | Enumerate or state |
| Tautomer duplicates | InChIKey match, different SMILES | Canonicalize |
| Counter-ions | Fragment analysis | Strip or retain |
| Duplicates | Canonical SMILES match | Deduplicate, record count |

## Reporting

State: the input format and its source, the standardization steps applied, the
invalid rate and its reasons, the stereo handling, the deduplication criterion
and count, and the resulting record count. This is the data-quality section for
any chemistry pipeline.
