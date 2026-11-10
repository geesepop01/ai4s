---
name: curated-bio-datasets
description: Find, access, and use curated biological datasets — reference genomes, expression atlases, model databases, and benchmark collections. Use for selecting and integrating established biological data resources.
category: databases
tags: [datasets, bioinformatics, reference, benchmarks, resources]
disable-model-invocation: true
---

# Curated Biological Datasets

A curated dataset is a scientific contribution with its own conventions,
licenses, and limitations. Using it correctly means citing it and knowing what
it does not cover.

## Major resources

| Resource | Content | Key caveat |
|---|---|---|
| GEO / SRA | Expression, sequence archives | MIAME/MIAME-ness varies; check the sample metadata |
| ArrayExpress | Functional genomics | Same as GEO |
| TCGA / GDC | Cancer omics + clinical | Controlled vs open data; batch effects large |
| GTEx | Tissue expression | Postmortem; tissue-specific sampling bias |
| ENCODE | Regulatory elements | Cell-line vs tissue distinction matters |
| UK Biobank | Cohort + imaging + genomics | Access-controlled; healthy-volunteer bias |
| PDB / AlphaFold DB | Structures | Experimental vs predicted; confidence scores |
| ClinVar / gnomAD | Variant annotation/frequency | Submission quality varies; ancestry-specific |
| DepMap | Cancer cell lines | Cell line ≠ tumor |
| Human Protein Atlas | Protein/RNA expression | Antibody validation varies |
| 1000 Genomes / TOPMed | Population variation | Ancestry composition |
| MIMIC / eICU | Clinical ICU | De-identified; coding practices vary |
| HBN, ABCD | Developmental neuroimaging | Consent and access restrictions |

## Selecting a dataset

1. **Does the population match the question?** Age, ancestry, sex, disease
   stage, tissue. A dataset's coverage is its most important property.
2. **What is the unit?** Sample, subject, cell, specimen, image — and is it
   independent?
3. **What are the labels, and who established them?** Curated by experts,
   self-reported, or algorithmically assigned?
4. **What is the license and the access tier?** Controlled data needs an
   agreement; state the data-use limits in the report.
5. **What is the known bias?** Healthy-volunteer, site, batch, platform.

## Integrating datasets

- **Batch effects across datasets are the norm.** ComBat/limma for expression;
  site harmonization for imaging; always include dataset as a covariate.
- **Identifier mapping** is a source of silent error (gene symbols vs Ensembl vs
  Entrez). Use a versioned mapping table; record the version.
- **Coordinate/reference consistency** for genomic data (see
  `genomic-coordinates`).
- **Do not pool blindly.** Analyze per-dataset and meta-analyze when the
  protocols differ substantially.

## Documentation and citation

- **Cite the dataset paper and its accession.** Datasets are cited works.
- **Record the release/revision** you used. Datasets are versioned and revised.
- **Record the download date and file checksums** for reproducibility.
- **Report the data-use agreement** that applies.

## When a dataset does not fit

Do not force it. State the mismatch and either find the right resource or scope
the claim to what the data supports. A well-known dataset applied to a
population it does not cover is a systematic error, not a generalization.

## Anti-patterns

- Using a dataset whose population does not match the question.
- Ignoring the controlled/open access distinction.
- Pooling datasets without modeling the batch.
- Citing a dataset without its release version.
- Treating a cell line dataset as a tumor dataset, or predicted structures as
  experimental ones.
