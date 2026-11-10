---
name: rdkit
description: Use RDKit for cheminformatics — molecular properties, fingerprints, similarity, substructure, and descriptor calculation. Use for any molecular computation where chemical correctness matters.
category: chemistry
tags: [rdkit, cheminformatics, molecules, fingerprints, descriptors]
---

# RDKit

RDKit is the standard open-source cheminformatics toolkit. Chemical correctness
— sanitization, stereochemistry, tautomer/protonation state — determines whether
the numbers mean anything.

## The core

```python
from rdkit import Chem
from rdkit.Chem import Descriptors, rdMolDescriptors, AllChem, Draw
from rdkit.Chem.Draw import IPythonConsole

mol = Chem.MolFromSmiles("CC(=O)Oc1ccccc1C(=O)O")
if mol is None:
    raise ValueError("invalid SMILES")

print(Descriptors.MolWt(mol), Descriptors.MolLogP(mol))
print(rdMolDescriptors.CalcTPSA(mol), rdMolDescriptors.CalcNumHBD(mol))
print(Chem.MolToSmiles(mol))          # canonical
```

## Chemical correctness (check every time)

- **Sanitization.** `MolFromSmiles` returns `None` for invalid input; check it.
  Sanitization normalizes valence and aromaticity.
- **Protonation state.** The dominant species at pH 7.4 is often not the input
  SMILES. Use `rdMolStandardize` (Uncharger, Normalizer) or Epik/Dimorphite-DL;
  state which and at what pH.
- **Tautomers.** Different tautomers have different properties and different
  fingerprints. Use the canonical tautomer or state that the input tautomer was
  kept.
- **Stereochemistry.** SMILES without stereo is ambiguous. `Chem.FindMolChiralCenters`
  to enumerate; do not claim stereo-specific properties from an unspecified
  structure.
- **Salts.** Strip to the parent (or keep, and say so). `rdMolStandardize.FragmentParent`.

## Descriptors and properties

- **Computed properties** (LogP, TPSA, QED) are estimates with method error.
  Report them as computed.
- **Lipinski Ro5** is a rule of thumb for oral absorption, not a filter for
  activity. Report the counts, not a pass/fail as if it were truth.
- **Descriptors** (`rdMolDescriptors`, `Mordred`, `mordredcommunity`) for ML;
  record the descriptor set and version.

## Fingerprints and similarity

```python
from rdkit.Chem import rdFingerprintGenerator
from rdkit import DataStructs

gen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
fp1, fp2 = gen.GetFingerprint(mol1), gen.GetFingerprint(mol2)
sim = DataStructs.TanimotoSimilarity(fp1, fp2)
```

- **State the fingerprint type, radius/size, and the similarity metric.**
  "Similar" is method-dependent.
- **ECFP/Morgan** is the default for activity; MACCS keys for substructure-like
  questions.

## Substructure and matching

```python
patt = Chem.MolFromSmarts("[NX3][CX3](=[OX1])")
hits = mol.GetSubstructMatches(patt)
```

- **SMARTS for queries.** Remember aromaticity perception can differ; test the
  pattern on known positives and negatives.

## 3D

```python
mol3d = Chem.AddHs(mol)
AllChem.EmbedMolecule(mol3d, randomSeed=42)
AllChem.MMFFOptimizeMolecule(mol3d)
Chem.MolToMolFile(mol3d, "conf.sdf")
```

Embedding is stochastic — fix the seed. MMFF/UFF are force fields with known
limits; state which.

## Reporting

State: the input format and its standardization (protonation, tautomer, salt),
the RDKit version, the descriptor/fingerprint definitions, the stereo handling,
the 3D method and its seed, and whether the property was computed or taken from
a database.

## Anti-patterns

- Ignoring `None` returns from SMILES parsing.
- Computing descriptors on an unspecified protonation state.
- Comparing fingerprints without stating the type and parameters.
- Presenting a computed property as a measured one.
