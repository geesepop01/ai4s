---
name: genome-assembly
description: Assemble genomes from sequencing reads — quality control, assembly, polishing, and validation. Use for de novo assembly and genome finishing.
category: biology
tags: [assembly, genome, contigs, ngs, polishing]
disable-model-invocation: true
---

# Genome Assembly

Assembly is a graph problem. The result's quality depends on the read data, the
assembler, and the validation — not on a single N50 number.

## The pipeline

```
reads → QC (FastQC, fastp) → error correction (optional) → assembly
  → polishing → contamination check → validation
```

## Choosing reads and assembler

| Data | Assembler | Notes |
|---|---|---|
| Short reads (Illumina) | SPAdes, MEGAHIT, SKESA | High accuracy, fragmented |
| Long reads (ONT, PacBio) | Flye, Canu, hifiasm | Contiguous, higher error |
| Hybrid | Unicycler, MaSuRCA | Combines strengths |
| HiFi (PacBio) | hifiasm | High accuracy + contiguity |
| Hi-C scaffolding | SALSA2, YaHS | Chromosome-scale |

**Assembly parameters are k-mer choices and coverage thresholds;** report them.

## Validation metrics

- **N50/NG50** — half the assembly in contigs of this size or larger. **N50 is
  not a quality metric by itself.** A wrong assembly can have high N50.
- **BUSCO** — completeness against conserved single-copy orthologs (report the
  lineage dataset and the percentages: complete, fragmented, missing).
- **QUAST** — misassemblies, genome fraction, largest contig.
- **Read mapping back** — coverage and proper-pair rate.
- **Reference-based** (when a reference exists): alignment identity and
  structural agreement.

## Contamination

- **BlobTools, CheckM, Kraken2** to detect contamination.
- **Remove contaminants** and report what was removed.
- **Mitochondrial/chloroplast** reads often contaminate; handle explicitly.

## Polishing

- **Pilon** (Illumina), **Medaka** (ONT), or long-read polishing for high
  accuracy.
- **Polish iteratively** and validate; over-polishing introduces errors.

## Genome finishing

- **Gap closing**, **repeat resolution** with long reads or Hi-C.
- **Circularization** for bacterial/plasmid genomes: verify the junction.
- **Chromosome conformation (Hi-C)** for scaffolding; report the contact map.

## Reporting

State: the sequencing platform and read characteristics (length, coverage,
quality), the assembler and its version with parameters, the assembly metrics
(N50, largest contig, total size), completeness (BUSCO with lineage),
misassemblies (QUAST), contamination assessment, polishing steps, the reference
used for validation, and the known unresolved regions.

## Common errors

- N50 reported as the quality metric.
- No BUSCO/QUAST validation.
- Contamination not checked.
- Over-polishing introducing errors.
- Circularization claimed without junction verification.
