---
name: pubchem-database
description: Query PubChem for compound properties, bioassays, and chemical identifiers. Use for chemical structure and property lookup with correct identifier handling.
category: databases
tags: [pubchem, compounds, chemicals, properties, identifiers]
---

# PubChem

PubChem is the largest public chemical database: compounds, substances, and
bioassays. Its identifier hierarchy is the main source of error in chemical data
integration.

## The API

```python
import requests

# Compound by name
r = requests.get("https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/aspirin/property/MolecularWeight,CanonicalSMILES,InChIKey/JSON").json()
props = r["PropertyTable"]["Properties"][0]

# CIDs for a name
r = requests.get("https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/aspirin/cids/JSON").json()

# Bioassay data
r = requests.get("https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2244/assaysummary/JSON").json()
```

## Identifier hierarchy

| Level | Meaning |
|---|---|
| **SID** (Substance) | One depositor's record |
| **CID** (Compound) | One unique chemical structure |
| **AID** (Assay) | One bioassay |

**Many SIDs map to one CID.** A substance record is a submission; the compound
is the standardized structure. When integrating data, use CIDs and record the
SID→CID mapping.

## Structure and properties

- **Canonical SMILES vs Isomeric SMILES.** Stereochemistry is in the isomeric
  form; a canonical SMILES may drop it.
- **InChIKey** is the stable structure identifier; use it for cross-database
  matching.
- **Computed properties** (LogP, TPSA) are calculated, not measured. Report
  which property came from where.
- **Protonation and salt forms.** A "compound" may be the free base or a salt;
  they have different CIDs and different properties.

## Bioassay data

- **Assay data is heterogeneous** in format and quality across depositors.
- **Active/inactive calls** come from the depositor's criteria, not from
  PubChem.
- **The assay description** defines what was measured; read it before comparing
  values.

## Cross-database integration

Match on **InChIKey** (or the first block for the skeleton) across PubChem,
ChEMBL, DrugBank, HMDB. State the matching criterion; name matching is
unreliable.

## Reporting

State: the CIDs used and the SIDs where the data came from, the property source
(computed vs experimental), the stereochemistry form (isomeric vs canonical),
the salt/free-base form, the bioassay AID and its depositor criteria, and the
cross-database matching key.

## Anti-patterns

- Using names as identifiers.
- Comparing properties computed in one tool with experimental values.
- Ignoring stereochemistry when it matters for the claim.
- Treating a bioassay's "active" call as a standardized measurement.
