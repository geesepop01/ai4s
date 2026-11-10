---
name: metagenomics
description: Analyze metagenomic data — taxonomic profiling, functional annotation, assembly, and diversity. Use for microbial community analysis with correct handling of compositionality.
category: biology
tags: [metagenomics, microbiome, taxonomy, diversity, 16s]
disable-model-invocation: true
---

# Metagenomics

Metagenomics profiles a microbial community. The analysis is dominated by the
extraction/sequencing protocol, the reference database, and the compositional
nature of the data.

## The pipeline

```
reads → QC → host removal → taxonomic profiling (MetaPhlAn, Kraken2) or
  amplicon (DADA2) → functional profiling (HUMAnN) → assembly (MEGAHIT)
  → diversity and statistics
```

## Taxonomic profiling

- **Marker-gene (MetaPhlAn)** vs **k-mer (Kraken2)** vs **assembly-based** —
  different biases; state which.
- **Reference database version** drives the result. State the database and its
  version.
- **A taxon absent from the database cannot be detected.** Novel taxa are missed.

## 16S amplicon

```r
library(dada2)
# Filter, dereplicate, denoise, merge, remove chimeras
seqtab <- makeSequenceTable(mergers)
seqtab.nochim <- removeBimeraDenovo(seqtab)
taxa <- assignTaxonomy(seqtab.nochim, "silva_nr99_v138.1_train_set.fa.gz")
```

- **ASVs (DADA2/Deblur)** rather than OTUs; state the method.
- **Primer region** determines what is amplified and what is not.
- **Chimera removal** is essential.
- **Taxonomy assignment** with the database and confidence threshold.

## Compositional data (the central issue)

Relative abundances sum to 1. An increase in one taxon forces decreases in
others.

- **Do not use standard t-tests on relative abundances.**
- **ANCOM-BC, ALDEx2, or CLR-transformed analyses** handle compositionality.
- **Absolute quantification** (spike-in, flow cytometry, qPCR) is the honest
  solution where available.
- **State the method and its assumptions.**

## Diversity

- **Alpha diversity** (Shannon, Simpson, richness) — with the rarefaction depth
  stated.
- **Beta diversity** (Bray-Curtis, UniFrac, weighted/unweighted) with PERMANOVA
  for group comparison; report the R² and the dispersion test (PERMDISP).
- **Dispersion differences** confound PERMANOVA; test dispersion first.

## Functional analysis

- **HUMAnN** for pathway abundance; state the database.
- **Assembly and binning** (MEGAHIT, MetaBAT) for MAGs; report completeness and
  contamination (CheckM).

## Reporting

State: the extraction and sequencing protocol, the read processing and host
removal, the profiling tool and its reference database version, the
compositional data method, the rarefaction depth for diversity, the PERMANOVA
and dispersion tests, the number of samples and their depth, and the
contamination controls (blank extraction, negative controls).

## Common errors

- Standard statistics on compositional data.
- No reference database version.
- PERMANOVA without a dispersion test.
- No negative/blank controls to detect contamination.
- Taxonomy claimed below the resolution the marker provides.
