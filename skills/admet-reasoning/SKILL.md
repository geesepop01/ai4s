---
name: admet-reasoning
description: Reason about ADMET liabilities mechanistically — metabolic soft spots, transport, clearance pathways, and structural alerts. Use when a compound's fate must be explained, not just predicted.
category: chemistry
tags: [admet, metabolism, mechanism, structure-alerts, medchem]
disable-model-invocation: true
---

# ADMET Reasoning

Prediction gives a number; reasoning explains why. When a compound fails
ADMET, the explanation is what tells you how to fix it.

## Metabolic soft spots

- **Aromatic carbons benzylic to a heteroatom, allylic positions, and exposed
  alkyl groups** are oxidation sites (CYP-mediated).
- **Phase I:** oxidation (CYP3A4/2D6/2C9), reduction, hydrolysis. **Phase II:**
  glucuronidation (UGT), sulfation (SULT), glutathione conjugation (GST).
- **Blocking a soft spot** (fluorine, deuterium, steric shielding, changing the
  position) is standard medchem — but it changes potency and other properties.
- **Metabolite identification** (LC-MS/MS) confirms what the reasoning predicts;
  a predicted soft spot is a hypothesis.

## Transport and distribution

- **P-gp efflux** reduces brain penetration and oral absorption; check for
  P-gp substrate motifs and measure.
- **Permeability** depends on polarity, HBD count, and lipophilicity; the
  "rule of 3" (MW < 300, LogP < 3, HBD ≤ 3) for CNS is a heuristic.
- **Plasma protein binding** reduces free fraction; only free drug is active.
  High PPB is not inherently bad — but it changes free concentration.
- **Lipophilicity (LogP/LogD)** drives most of ADMET; LogD at pH 7.4 is the
  physiologically relevant measure.

## Clearance pathways

- **Hepatic:** CYP metabolism, UGT conjugation, biliary excretion.
- **Renal:** glomerular filtration (only free drug), tubular secretion.
- **Intrinsic clearance** in microsomes/hepatocytes predicts in-vivo; state the
  system used.
- **Species differences** in CYP isoforms are large; a rat clearance does not
  predict human.

## Structural alerts

Known toxicophores (structural alerts) warrant flags, not verdicts:

- Anilines/anilides → methemoglobinemia risk.
- Furans, thiophenes → reactive metabolites.
- Michael acceptors → covalent binding.
- Halogenated alkanes → alkylating metabolites.
- Nitroaromatics → reduction to reactive intermediates.

**An alert is a flag for testing**, not proof of toxicity. Many approved drugs
carry alerts.

## The reasoning chain

```
Structure → soft spot prediction → predicted metabolite →
  structural alert? → clearance route → DDI risk →
  what to change (and what that costs elsewhere)
```

Every link is a hypothesis until measured. State which are measured and which
are reasoned.

## Reporting

State: the proposed metabolic sites and their basis, the predicted metabolites,
the structural alerts present and their literature basis, the transport and
binding reasoning, the species difference caveats, and a clear separation of
measured data from mechanistic reasoning.

## Anti-patterns

- Presenting mechanistic reasoning as measurement.
- Treating a structural alert as a toxicity verdict.
- Ignoring species differences in extrapolating clearance.
- Recommending a modification without noting what it costs (potency,
  solubility, synthesis).
