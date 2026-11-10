---
name: bioinformatics-pipelines
description: Build reproducible bioinformatics pipelines — workflow managers, containers, provenance, and testing. Use when an analysis must be rerunnable, portable, and auditable.
category: data-engineering
tags: [pipelines, workflows, nextflow, snakemake, reproducibility]
disable-model-invocation: true
---

# Bioinformatics Pipelines

A bioinformatics pipeline is a scientific instrument. It must be reproducible,
portable, and auditable — otherwise the results cannot be checked.

## Workflow managers

| Tool | Model | Best for |
|---|---|---|
| Snakemake | Rule-based, Python | File-centric pipelines, flexible |
| Nextflow | Dataflow, DSL2 | Cloud/HPC portability, containers |
| WDL + Cromwell | Task-based | GATK-style, cloud |
| CWL | Specification | Interoperability |
| Make | File-based | Simple dependency chains |

## The pipeline skeleton

```
pipeline/
  Snakefile / main.nf / workflow
  envs/           conda env YAMLs
  containers/     Dockerfile / Singularity defs
  config/         parameters, samples
  modules/        reusable steps
  tests/          test data + expected outputs
  docs/
```

## Reproducibility

1. **Pin every dependency.** `environment.yml` with exact versions, or a
   container image with a digest.
2. **Pin the reference data** with checksums. Reference files change; the
   analysis changes with them.
3. **Record parameters** in a config file, not in the code.
4. **Seed everything** stochastic.
5. **Provenance:** each run records the workflow version (git commit), the
   container digests, the reference checksums, and the parameters.

```yaml
# config.yaml
samples: samples.tsv
reference:
  genome: refs/hg38.fa
  gtf: refs/gencode.v44.annotation.gtf
  checksums: refs/checksums.md5
params:
  min_read_length: 50
  threads: 8
```

## Containers

```dockerfile
FROM mambaorg/micromamba:1.5.8
COPY environment.yml /tmp/
RUN micromamba install -y -n base -f /tmp/environment.yml && micromamba clean --all -yes
```

- **Use the image digest**, not the tag, in the workflow.
- **Singularity/Apptainer** for HPC where Docker is unavailable.

## Testing

- **Small test data** with expected outputs. A pipeline without a test is
  unverified.
- **CI runs the test** on every change.
- **Golden files** compared with tolerance for floating-point outputs.
- **Integration test** on a realistic (small) sample.

## Error handling

- **Fail loudly.** A step that silently produces an empty file poisons the
  pipeline.
- **Validate inputs** before processing (file exists, format correct, expected
  chromosomes).
- **Checkpoint/resume** so a failure does not restart from zero.
- **Retries with backoff** for transient failures (network, cluster).

## Provenance and reporting

State: the workflow manager and version, the workflow git commit, the container
digests, the reference data versions and checksums, the parameters, the random
seeds, the test results, and the run's log path. This record accompanies every
result.

## Common errors

- Dependencies unpinned ("install latest").
- Reference files without version or checksum.
- Parameters hardcoded in scripts.
- No test data; the pipeline's correctness unverified.
- Silent failures producing empty outputs that pass downstream.
