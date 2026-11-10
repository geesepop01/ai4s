---
name: variant-interpretation
description: Interpret genetic variants — pathogenicity, population frequency, functional evidence, and ACMG criteria. Use for any clinical or research variant interpretation.
category: biology
tags: [variants, pathogenicity, acmg, genetics, interpretation]
disable-model-invocation: true
---

# Variant Interpretation

Variant interpretation integrates evidence from population frequency, function,
segregation, and computational prediction. The classification is only as strong
as its weakest evidence class.

## The ACMG/AMP framework

Five evidence categories:

- **PVS** — null variant in a gene where loss-of-function is a known mechanism.
- **PS** — strong (functional studies, de novo, case-control).
- **PM** — moderate (rare in population, computational, trans/cis).
- **PP** — supportive (computational, segregation, phenotype).
- **BA/BS/BP** — benign evidence.

Classification: Pathogenic (1 PVS + ≥1 PS, or equivalent combinations), Likely
Pathogenic, VUS, Likely Benign, Benign. **The combination rules matter; apply
them, do not eyeball.**

## Evidence gathering

| Evidence | Source | Caveat |
|---|---|---|
| Population frequency | gnomAD | Ancestry-specific; absence ≠ rare |
| Functional | Literature, ClinVar submissions | Assay validity varies |
| Computational | REVEL, CADD, PolyPhen, SIFT | Predictors agree poorly; use calibrated thresholds |
| Segregation | Family data | Must be informative |
| De novo | Trio data | Confirm parentage |
| Phenotype | HPO matching | Subjective |

**Computational evidence is supporting only (PP3/BP4).** It never establishes
pathogenicity on its own.

## Population frequency

- **Check gnomAD** with the ancestry breakdown. A variant common in one ancestry
  and rare in another is not uniformly rare.
- **The maximum credible allele frequency** for a disease depends on its
  prevalence, genetic heterogeneity, and penetrance. A variant more common than
  the disease is not fully penetrant for it.
- **Coverage:** gnomAD has low coverage in some regions; absence may mean
  unmeasured.

## Functional evidence

- **The assay must be validated** for the disease mechanism. A generic reporter
  assay is not clinical evidence.
- **Direction of effect** must match the disease mechanism (LoF vs GoF).
- **Multiple assays** with consistent results are stronger than one.

## Classification discipline

```markdown
## Variant: <rsID / HGVS>
Gene: <symbol, transcript (MANE Select)>
Protein: <HGVS p.>
Population: <gnomAD AF, max, ancestry breakdown>
Functional: <assays, direction, validation>
Computational: <REVEL, CADD, with thresholds>
Segregation: <family data>
Phenotype: <HPO terms matched>
Classification: <Pathogenic / LP / VUS / LB / Benign>
Criteria applied: <PVS1, PS3, PM2, ... with justification>
Conflicts: <other sources' classifications and their basis>
```

## Reporting

State: the HGVS nomenclature with the transcript, the evidence class for each
piece of evidence, the ACMG criteria applied with their strength, the
population frequency with ancestry, the functional assay validation, the
classification with its date and the criteria, and the conflicting
classifications from other submitters.

## Anti-patterns

- Classifying from computational prediction alone.
- Treating VUS as actionable.
- Ignoring ancestry in frequency assessment.
- Applying ACMG criteria by intuition rather than the combination rules.
- Reporting a classification without the criteria that produced it.
