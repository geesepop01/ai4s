---
name: execution-hygiene
description: Run computations so they finish, reproduce, and fit the machine that will re-execute them. Use before launching any non-trivial script, training run, or batch job.
category: core
tags: [execution, reproducibility, performance, jobs, hygiene]
disable-model-invocation: true
---

# Execution Hygiene

Most failed computations fail for boring reasons: an out-of-memory swap storm, a
run killed by a shell timeout, a result that no one can reproduce because the
thread count changed. This skill is the checklist that prevents those.

## Before you run

1. **Know the machine you are targeting.** CPU count, available RAM, GPU model
   and VRAM, disk free. A job sized for a different machine wastes the run and
   often the data.
2. **Cap the thread pools deliberately.** Set `OMP_NUM_THREADS`,
   `MKL_NUM_THREADS`, `OPENBLAS_NUM_THREADS`, and `NUMEXPR_NUM_THREADS` to a
   value that fits the machine and the job. Uncapped BLAS is the most common
   cause of an oversubscribed, thrashing run.
3. **Set seeds first, not last.** `random`, `numpy`, framework-level
   (`torch.manual_seed`, `tf.random.set_seed`), and any dataloader workers. Record
   them in the run manifest.
4. **Estimate the memory footprint** before you allocate. A 10M-row frame read
   with `dtype=str` is not the same job as the same frame read with categoricals.
5. **Write outputs to a run directory** you will not overwrite. See the
   `reproducibility` skill's run-beside rule.

## While it runs

- **Detach long jobs instead of blocking the shell.** A `sleep 7200 && train.sh`
  written into a foreground shell is a job that dies when the session does. Use
  the `jobs` tool or a background process with a PID file and a log path.
- **Log to a file, not to the terminal.** `tee` or redirect stdout and stderr to
  `run.log`. The log is the artifact; the terminal is ephemeral.
- **Checkpoint so a rerun resumes.** Save model state, optimizer state, RNG state,
  and the current epoch/step to disk at intervals you can afford to lose.
- **Watch the failure modes, not just progress.** Loss curve for divergence, RSS
  for leaks, disk free for fills, GPU utilization for a starved pipeline.
- **Do not retry blindly.** An out-of-memory is a sizing problem; a NaN is a
  numerical problem; a permission error is an environment problem. Diagnose from
  the message.

## Reproducing it later

- Record: command, environment, seed, input paths and their hashes, thread caps.
- Pin package versions into `requirements.txt` or `environment.yml` at run time,
  not from memory.
- Name the run with a timestamp or a slug and keep its directory intact. A rerun
  goes beside it, never over it.
- A reported number comes from a saved script run end to end, not from an
  interactive session. Interactive exploration is fine; its conclusions are not
  the result.

## The rerun test

Before delivering a result, re-run the pipeline from the manifest in a fresh
process and confirm the numbers match. If they do not, the run is not
reproducible and the report must say so — or you find the nondeterminism and
pin it.
