---
name: experimental-reproducibility
description: Ensure computational experiments are reproducible — environment capture, seeds, artifact management, and rerun testing. Use before claiming any computational result is reproducible.
category: core
tags: [reproducibility, environment, artifacts, seeds, rerun]
---

# Experimental Reproducibility

Reproducibility is a property you demonstrate, not one you assert. The rerun
test is the demonstration.

## The four artifacts of a reproducible result

1. **Code** — versioned, with the exact commit recorded.
2. **Environment** — pinned dependencies, container digest or lockfile.
3. **Data** — versioned, with checksums, and the split recorded.
4. **Config** — parameters, seeds, and the exact command.

## Environment capture

```bash
pip freeze > requirements.txt
conda env export > environment.yml
# or a container
docker build -t research:v1 .
docker inspect --format='{{index .RepoDigests 0}}' research:v1
```

- **Pin exact versions**, not ranges. "torch>=2.0" is not reproducible.
- **Container digest** is the strongest guarantee.
- **Record the hardware** where floating-point differences matter (GPU model,
  CUDA version).

## Seeds and determinism

- **Seed every source of randomness:** Python, NumPy, framework, dataloader
  workers.
- **Determinism settings** (cudnn.deterministic) recorded; note that full
  determinism costs performance and some ops lack deterministic kernels.
- **Report the variance across seeds** — a single seed is not the result.

## Artifact management

```
runs/2026-10-22_exp01/
  config.yaml         # the exact config
  code_commit.txt     # git SHA
  env.txt             # frozen environment
  data_manifest.json  # input paths + checksums + split
  run.log             # full stdout/stderr
  outputs/            # results
  metrics.json        # final metrics
```

- **Do not overwrite a run directory.** A rerun goes beside it (see
  `reproducibility`).
- **Checkpoints** saved at intervals so a rerun resumes.

## The rerun test

**Before claiming reproducibility, re-run from the manifest in a fresh
process/environment and confirm the numbers match.** If they do not, either find
the nondeterminism and pin it, or report the run as non-reproducible with the
observed variance.

This is not optional for a result that will be cited.

## What "reproducible" means

- **Reproducible:** same code + environment + data → same numbers (within
  floating-point tolerance).
- **Replicable:** independent implementation → consistent conclusion.
- **Robust:** conclusion holds across reasonable variations.

State which you have demonstrated. Most computational claims demonstrate none.

## Reporting

State: the code commit, the environment (lockfile/container digest), the data
version with checksums, the seeds and determinism settings, the exact command,
the rerun test result, the variance across seeds, and the hardware where
relevant.

## Anti-patterns

- Claiming reproducibility without a rerun test.
- Dependency ranges instead of pins.
- A single seed.
- Overwriting run directories.
- Reporting notebook state as a result.
