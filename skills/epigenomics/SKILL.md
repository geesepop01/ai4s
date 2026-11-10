---
name: epigenomics
description: Analyze epigenomic data — ChIP-seq, ATAC-seq, DNA methylation, and chromatin accessibility. Use for regulatory and chromatin studies with proper peak and background handling.
category: biology
tags: [epigenomics, chip-seq, atac-seq, methylation, chromatin]
disable-model-invocation: true
---

# Epigenomics

Epigenomic data is peak-based, background-sensitive, and highly dependent on the
antibody or enzyme. The peak call is a statistical claim.

## ChIP-seq

```
reads → QC → alignment (BWA/Bowtie2) → duplicate removal →
  peak calling (MACS2/SEACR) → annotation → differential binding (DiffBind)
```

- **Input control is mandatory.** Peaks without a matched input are suspect.
- **Antibody quality** determines the result. Validate with known targets.
- **Peak calling parameters** (q-value, fold enrichment, broad vs narrow) must
  be stated. Histone marks need broad callers (MACS2 --broad, SICER).
- **FRiP** (fraction of reads in peaks) as a QC metric; low FRiP means weak
  signal.

## ATAC-seq

- **Tn5 bias** creates sequence-specific cuts; account for it.
- **Nucleosome-free vs nucleosome-occupied** regions differ in interpretation.
- **Peak calling** (MACS2 with ATAC settings) and **footprinting** for TF
  binding.
- **QC:** TSS enrichment, fragment size distribution, duplicate rate.

## DNA methylation

- **Bisulfite sequencing (WGBS/RRBS):** conversion rate is the critical QC;
  incomplete conversion inflates methylation.
- **Array (EPIC/450K):** probe filtering, cross-reactive probes, batch
  normalization.
- **Differential methylation** with appropriate models (DSS, limma,
  bumphunter); account for cell-type composition.
- **Report the CpG context** (island, shore, shelf, open sea) — biology differs.

## Differential analysis

- **DiffBind/DESeq2** for differential binding/accessibility with the design
  including batch and covariates.
- **Multiple testing** at the peak level (FDR).
- **Peak overlap** between conditions: report the number and the method
  (`bedtools intersect` parameters).

## Annotation

- **Genomic annotation** (TSS, exon, intron, intergenic) with the annotation
  version.
- **Motif enrichment** (HOMER, MEME-ChIP) with the background set matched for
  GC and accessibility.
- **Functional enrichment** with the appropriate background.

## Reporting

State: the assay and its protocol, the antibody/enzyme and its validation, the
alignment and duplicate handling, the peak caller and its parameters, the
control/input used, the QC metrics (FRiP, TSS enrichment, conversion rate),
the differential analysis design and its covariates, the annotation versions,
and the number of peaks/regions with their thresholds.

## Common errors

- Peaks without input control.
- No antibody validation.
- Peak thresholds not reported.
- Methylation without conversion rate QC.
- Motif enrichment with an unmatched background.
