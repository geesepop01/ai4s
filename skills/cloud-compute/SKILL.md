---
name: cloud-compute
description: Cloud GPU compute for research. Use for platform selection, job submission patterns, cost estimation, and the spend-approval protocol that must run before any paid job is launched.
category: compute
tags: [gpu, cloud, compute, modal, cost, approval, training]
disable-model-invocation: true
---

# Cloud Compute

## Overview

Research compute that costs money is a decision requiring user consent. This skill
covers platform selection, cost estimation, launch patterns, and the approval
protocol.

## The non-negotiable rule

**Never launch a job that spends money without explicit user approval.**

Before any paid command — GPU allocation, large batch inference, paid API fan-out:

1. Present **estimated cost**, **wall-clock**, **platform**, and **resource type**.
2. Wait for an explicit "yes", "approved", or "go ahead".
3. If declined, offer a cheaper path — smaller model, shorter run, spot capacity,
   a subsample, or CPU.

An estimate is a range plus the assumption behind it. "About $4–6, assuming 40
minutes on one A10G at the current spot rate" is an estimate. "Cheap" is not.

## Where work belongs

| Workload | Local CPU | Cloud GPU | Note |
|---|---|---|---|
| Profiling, EDA | yes | | Fast on CPU |
| Classical ML (sklearn, XGBoost) | yes | | CPU-bound, often faster locally |
| Small encoder fine-tune (< ~1B, LoRA) | | yes | T4 / A10G is usually enough |
| Full fine-tune, large LoRA | | yes | A100 / H100 |
| RL post-training | | yes | Long-running, checkpoint often |
| Multi-node training | | yes | FSDP / DeepSpeed |
| Serving and batch inference | | yes | vLLM / SGLang |
| Evaluating a hosted model by API | yes | | Network-bound, not GPU-bound |

Prefer the smallest allocation that answers the question. A pilot on 1% of the
data at 1% of the cost, run first, routinely prevents an expensive mistake.

## Estimating cost

```
cost ≈ (hourly rate) × (estimated wall-clock hours) × (number of instances)
```

Always add overhead for:

- **Image and dependency build** — often several minutes on every cold start.
- **Data transfer** — large datasets can dominate a short job's cost.
- **Queue and retry time** — a preempted spot job may need to restart.
- **Idle GPU while your code loads data** — the most common waste.

Estimate, then **multiply by 1.5** for the first attempt with new code.

Record actual spend as you go:

```markdown
## Budget
- Approved: $50.00
- Spent: $23.40
- Remaining: $26.60
```

Stop when the remaining budget approaches zero, not after it does.

## Checkpointing

Any job longer than a few minutes must checkpoint.

- Write checkpoints on a time interval, not only at epoch boundaries.
- Make the job resumable from the latest checkpoint without manual repair.
- Push checkpoints off the ephemeral instance — local disk is lost on preemption.
- Verify a checkpoint actually loads **before** launching the long run.

A four-hour job without checkpointing is a four-hour bet.

## Launch discipline

1. **Smoke test on a tiny input** — seconds, not minutes — before the real run.
2. **Log everything to files** — stdout to `run.log`, metrics to a tracked run.
3. **Set seeds** so a re-run is comparable (see the `reproducibility` skill).
4. **Capture the environment** — image digest, package versions, GPU model.
5. **Check in periodically** — a job nobody watches is a job that burns budget
   producing nothing.
6. **Tear down** — confirm the instance stopped. Idle GPUs still bill.

## Failure modes to plan for

| Failure | Prevention |
|---|---|
| Out of memory on GPU | Estimate footprint first, or reduce batch size and accumulate |
| Preemption on spot | Checkpointing, plus a restart policy |
| Data loading starves the GPU | Pre-fetch, shard, and cache the dataset |
| Silent NaN divergence | Watch the loss curve, not just the final number |
| Disk fills mid-run | Check free space; stream rather than materialise |
| Run "succeeds" but wrote nothing | Assert on expected output files after the job |

## Job lifecycle discipline

A submitted job is not a black box. Treat it as a lifecycle you drive and record:

```
doctor → setup → plan → start → status → wait → logs → artifacts → verify → cancel/retry/release
```

- **doctor / setup** — confirm the target environment exists and the runtime is
  reachable before you submit. Fail here, not after burning an hour of queue.
- **plan** — write down what will run, on what input, producing what output, with
  what budget. This is the artifact you compare reality against later.
- **start** — record the job id and the exact submission parameters. Bind the run
  to a pinned environment (image digest, commit, container version) so a rerun is
  the same job.
- **status / wait** — poll explicitly and record transitions. Do not assume a
  submission is progressing because the console is quiet. Respect a concurrency
  limit: if the platform caps parallel jobs, a start beyond the cap must fail
  visibly rather than sit in a queue you cannot see.
- **logs** — keep the full stdout/stderr as files, not as chat memory. When a job
  fails, the preserved stderr is what diagnoses it.
- **artifacts** — fetch outputs back to the project, then verify size and
  checksum. A listed artifact is not a retrieved artifact.
- **verify** — assert on the expected outputs before you trust the run. A job that
  exits zero and writes nothing is a failed job.
- **cancel / retry** — cancel the remote job, not just the local request. Before a
  retry, recover the existing job id rather than double-submitting and paying
  twice.
- **release** — tear down the compute. Idle GPUs bill.

Keep partial results when a job fails midway, and name what is missing. See the
`reproducibility` skill for the run-beside rule and the `deliverable-conformance`
skill for verifying outputs against spec.

## Provider-agnostic submission shape

Whatever the provider, the submit script should express the same four things —
image, command, resources, and outputs — so a provider swap is a config change.

```bash
# Illustrative shape; substitute the provider's own CLI.
submit \
  --image  research-base:cu121 \
  --cmd    "python src/train.py --config configs/pilot.yaml" \
  --gpu    1xA10G \
  --hours  1 \
  --volume ./checkpoints:/checkpoints \
  --output ./results
```

Keep the environment definition in the repository, not in a provider dashboard.
Infrastructure a collaborator cannot see is infrastructure they cannot reproduce.

## Reporting compute in the write-up

State the platform, GPU type, wall-clock, and cost, plus the pilot-to-final
scaling decision. A result that required $400 should say so; it is part of the
method, and it bounds how easily the work can be repeated.
