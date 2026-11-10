---
name: compute
description: Choose and run compute for research work — local shell or kernel, a detached job on this machine, a saved SSH or Slurm host, or cloud GPUs — with the target discovered from what is actually configured and the run sized and priced before dispatch.
category: core
tags: [compute, jobs, hpc, remote, scheduling, gpu]
disable-model-invocation: true
---

# Compute

Choosing where a run happens is a research decision, not an implementation
detail. The right target is the cheapest one that finishes in time without
corrupting the result.

## Discover what is actually configured

Do not assume a target exists. Check before you plan around it:

- **Local** — CPU count, RAM, GPU (`nvidia-smi`), disk free.
- **Detached local job** — is a job runner available (`jobs` tool, `nohup`,
  `systemd-run`)? Can it survive the session ending?
- **SSH host** — is there a saved host config? Does `ssh -o BatchMode=yes host
  true` succeed without an interactive prompt?
- **Slurm / PBS / scheduler** — `squeue`, `sinfo`, `sacct` present? What queue and
  partition? What account and QOS?
- **Cloud GPU** — is a credentials profile configured? Which region? What quota?

If a target is not configured, say so and propose the closest configured one.

## Size the run before dispatch

| Question | Why |
|---|---|
| Wall-clock estimate for one epoch / one sample | Determines whether it fits the queue and the budget |
| Peak memory (weights + activations + data batch) | Determines instance or node type |
| Disk for data + checkpoints + logs | A run that fills the disk is a lost run |
| Need for warm start / checkpoint resume | Determines whether preemption is survivable |
| Data locality | Moving 500 GB to a GPU node is often slower than the compute |

Price it: instance rate × hours × count, plus storage and egress. Get explicit
approval before any paid dispatch.

## Target-by-target discipline

**Local shell/kernel.** Fine for exploration, profiling, and small runs. Cap
threads. Never block the shell on a multi-hour run.

**Detached local job.** Use for anything over a few minutes. Write a PID and log
path; verify it is alive after the shell returns.

**SSH host.** Sync data first (`rsync` with a manifest), run under a process
supervisor, write logs to a known path, fetch artifacts back with checksums.

**Slurm/PBS.** Write a batch script with explicit `--time`, `--mem`, `--cpus`,
`--gres`, `--output`. Submit once, capture the job id, poll with `sacct`/`squeue`.
Set a requeue policy and checkpoint interval if the queue preempts.

**Cloud GPU.** Pin the container image digest. Mount data rather than baking it
in. Set a hard spend cap. Tear down explicitly — an idle GPU bills.

## The dispatch record

Every dispatched run records:

```
target: slurm/gpu-a100 (or: local/rtx4090, ssh/cluster-a, modal/h100)
command: <exact>
image/env: <digest or env-file hash>
resources: <cpus, ram, gpus, time limit>
input hashes: <paths + sha256>
output dir: <run-beside path>
est. cost: <amount + basis>
est. wall clock: <duration>
approved by: <user, timestamp>
```

This goes into the run manifest alongside the seed and the thread caps.

## Verification after the run

Assert on expected output files, verify their size and checksum, and re-run at
least the summary step locally before reporting. A job that exits zero and writes
nothing is a failed job. Fetch the logs and keep them; the stderr is what
diagnoses the next failure.
