---
name: gwas-analysis
description: Analyze genome-wide association studies — QC, population structure, association testing, and fine-mapping. Use for GWAS and genetic association analysis.
category: biology
tags: [gwas, association, snps, genetics, fine-mapping]
disable-model-invocation: true
---

# GWAS Analysis

GWAS requires rigorous QC and population structure control. The Manhattan plot
is the last step; the analysis is decided by the QC and the model.

## The pipeline

```
genotypes → sample QC → variant QC → population structure (PCA) →
  association testing (PLINK, REGENIE, BOLT-LMM) → fine-mapping → annotation
```

## QC

**Sample QC:**
- Call rate > 98%.
- Sex check (discordance).
- Heterozygosity outliers (±3 SD).
- Relatedness (PI_HAT > 0.2): remove or use a mixed model.
- Ancestry outliers (PCA).

**Variant QC:**
- Call rate > 98%, MAF > 1% (or MAC threshold).
- Hardy-Weinberg equilibrium (p > 1e-6 in controls).
- Differential missingness by phenotype.

## Population structure

- **PCA on LD-pruned genotypes** (EIGENSTRAT, PLINK).
- **Include top PCs** in the model; report the number and the variance explained.
- **Genomic inflation factor (λ)** — λ > 1.05 suggests residual structure or
  cryptic relatedness. Report λ and λ1000 for case-control imbalance.

## Association testing

```bash
plink2 --bfile data --glm hide-covar --covar covars.txt --out gwas
```

- **Additive model** is the default; test dominant/recessive only when justified.
- **Covariates:** age, sex, PCs, batch. State every covariate.
- **Mixed models** (BOLT-LMM, REGENIE, GEMMA) for related samples and
  population structure.
- **Multiple testing:** genome-wide significance 5e-8 (or Bonferroni for the
  number of independent variants).

## Fine-mapping

- **Conditional analysis** (GCTA-COJO) to identify independent signals.
- **Fine-mapping** (FINEMAP, SuSiE) to compute credible sets and PIP.
- **Functional annotation** (VEP, FUMA) with the database versions.

## Interpretation

- **A significant SNP is a locus, not a gene.** LD means the causal variant may
  be elsewhere; use fine-mapping and functional data.
- **Effect sizes** (OR/beta with CI) and the variance explained.
- **Replication** in an independent cohort is the standard for a real finding.
- **Winner's curse:** the discovery effect size is inflated; replication gives
  the unbiased estimate.

## Reporting

State: the genotyping platform and imputation panel with its version, the QC
thresholds and the number removed, the population structure method and the
number of PCs, the model and all covariates, the genomic inflation factor, the
significance threshold, the number of samples and variants, the effect sizes
with CIs, the fine-mapping and functional annotation, and the replication status.

## Common errors

- Inadequate population structure control.
- No genomic inflation reporting.
- Claiming a causal gene from a lead SNP without fine-mapping.
- Effect sizes reported without CIs or replication.
