---
name: cancer-genomics-analysis
description: Analyze cancer genomics data — somatic mutations, copy number, structural variants, purity, and clonal evolution. Use for tumor genomic analysis with proper normal/ tumor handling.
category: biology
tags: [cancer, somatic, mutations, copy-number, tcga]
disable-model-invocation: true
---

# Cancer Genomics

Cancer genomics distinguishes somatic from germline, accounts for tumor purity
and heterogeneity, and interprets variants in a clinical context. Each step has
a specific failure mode.

## The pipeline

```
tumor/normal BAMs → somatic variant calling (Mutect2, Strelka2, VarScan2)
  → filtering (panel of normals, germline resource, contamination)
  → annotation (VEP, Oncotator, CIViC, ClinVar)
  → copy number (CNVkit, GATK CNV, FACETS)
  → structural variants (Manta, DELLY)
  → clonal evolution (PyClone, SciClone)
```

## Somatic variant calling

- **Matched normal is essential.** Without it, germline variants leak into the
  somatic calls.
- **Panel of normals (PoN)** filters recurrent artifacts.
- **Germline resource** (gnomAD) to filter common polymorphisms.
- **Contamination estimate** (ContEst, GATK CalculateContamination).
- **Tumor-only calling** is much less reliable; report it as such.

## Variant interpretation

- **Annotation:** VEP/ANNOVAR with the database versions.
- **Actionability:** OncoKB, CIViC, ClinVar — with their evidence levels.
- **Variant allele frequency (VAF)** and **cancer cell fraction (CCF)** are
  different; report which.
- **Mutational signatures** (SigProfiler, deconstructSigs) with enough mutations
  (typically > 200) and the signature version.

## Copy number and purity

- **Purity and ploidy** must be estimated (FACETS, ABSOLUTE, TitanCNA); they
  scale every copy number and VAF interpretation.
- **Focal vs arm-level** events answer different questions.
- **Report the segmentation and the calling threshold.**

## Clonal evolution

- **Clustering mutations by CCF** (PyClone) reveals subclones.
- **The number of clusters depends on the model's assumptions**; report the
  method and its confidence.
- **Longitudinal samples** give the evolution; a single sample gives only a
  snapshot.

## Statistical unit and cohort analysis

- **The patient is n.** For cohort-level claims (mutation frequency,
  association), report the number of patients and the confidence intervals.
- **Multiple testing** for gene-level association (MutSigCV, dNdScv account for
  gene length and mutation rate).
- **The background mutation rate** matters: a gene with many mutations in a
  hypermutated tumor is not necessarily a driver.

## Reporting

State: the callers and their versions with parameters, the panel of normals and
germline resource, the purity/ploidy estimate and its method, the annotation
databases and versions, the actionability source and its evidence level, the
number of patients/samples, the mutational signature analysis and its
prerequisites, and the cohort-level statistics with multiple-testing correction.

## Common errors

- Somatic calls from tumor-only data treated as definitive.
- Ignoring purity/ploidy in VAF and copy number interpretation.
- Reporting mutation frequency without the background rate.
- Mutational signatures from too few mutations.
- Actionability claims without the evidence level.
