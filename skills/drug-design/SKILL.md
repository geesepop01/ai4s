---
name: drug-design
description: Design drug candidates — hit-to-lead, lead optimization, SAR, and multi-parameter optimization. Use for medicinal chemistry design decisions and compound series progression.
category: chemistry
tags: [drug-design, medchem, sar, lead-optimization, mpo]
disable-model-invocation: true
---

# Drug Design

Drug design is multi-objective optimization under uncertainty: potency,
selectivity, ADMET, and synthesizability must improve together. A change that
fixes one and breaks another is not progress.

## The design cycle

```
hypothesis → design → synthesize → test → analyze SAR → update hypothesis
```

Every cycle should change **one** thing so the SAR is interpretable.

## Hit-to-lead

- **Confirm the hit first:** orthogonal assay, dose-response, counter-screens,
  aggregation/artifact checks (see `pharmacology-wetlab`).
- **Establish the SAR** around the hit with a focused set (10–30 analogs).
- **Identify the pharmacophore:** which features are essential (H-bond
  donor/acceptor, hydrophobic contact, charge).
- **Check IP and novelty** early (see `patent-mining`).
- **Assess tractability:** can the series be improved without losing the core?

## Lead optimization

Multi-parameter optimization. Track the whole panel, not just potency:

| Parameter | Typical goal | Tool |
|---|---|---|
| Potency (IC50/Ki) | < 100 nM (context-dependent) | Assay |
| Selectivity | > 30–100× over counterscreens | Assay |
| Metabolic stability | > 30 min in human microsomes | Assay |
| Solubility | > 10–50 µg/mL | Assay |
| Permeability | Papp > 10⁻⁶ cm/s | PAMPA/Caco-2 |
| hERG | IC50 > 30× free Cmax | Assay |
| PK | Oral exposure, half-life | In vivo |

**Multi-parameter score (MPS)** or desirability functions aggregate them; use
them for ranking, not as a single truth.

## SAR discipline

- **One change at a time** for interpretable SAR.
- **Matched molecular pair analysis** isolates the effect of a single
  structural change across a series.
- **Report the assay's variability.** A 2-fold change within assay noise is not
  SAR.
- **3D SAR** (stereochemistry, conformation) often matters more than 2D
  changes.

## Design strategies

- **Rigidification** reduces entropy cost and improves potency/selectivity.
- **Bioisosteric replacement** maintains activity while fixing ADMET.
- **Prodrugs** for solubility/permeability.
- **Soft drugs** for local action with systemic clearance.
- **Deuterium** at metabolic soft spots (modest, often overstated).
- **Fragment growing/linking** from a validated fragment.

## The decision record

```markdown
## Design round <n>
Change: <the single structural change>
Hypothesis: <what it should improve and why>
Result: <potency, selectivity, ADMET deltas with assay variability>
Decision: <advance / modify / drop — and the reason>
```

## Reporting

State: the assay and its variability, the potency and its CI, the full ADMET
panel (not only the improved parameter), the SAR with the structural changes
explicit, the matched-pair analysis where used, the synthesized/unsynthesized
status, and the multi-parameter view of each candidate.

## Anti-patterns

- Optimizing potency alone and discovering ADMET failure later.
- Reporting a potency shift smaller than assay variability as SAR.
- Skipping orthogonal confirmation of a hit.
- Claiming a design principle from one analog pair.
