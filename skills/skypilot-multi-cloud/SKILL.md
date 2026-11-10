---
name: skypilot-multi-cloud
description: Orchestrate compute across cloud providers with SkyPilot — provisioning, cost optimization, and job management. Use for multi-cloud or cost-optimized GPU workloads.
category: cloud-compute
tags: [skypilot, multi-cloud, orchestration, cost, jobs]
disable-model-invocation: true
---

# SkyPilot

SkyPilot launches jobs on the cheapest available compute across clouds and
kubernetes. Its value is cost and portability; the discipline is in the config
and the cost reporting.

## The task YAML

```yaml
resources:
  accelerators: A100:8
  cloud: aws          # or gcp, azure, lambda, kubernetes, any
  instance_type: p4d.24xlarge
  disk_size: 500
  use_spot: true

run: |
  python train.py --config config.yaml
```

```bash
sky launch -c mycluster task.yaml
sky exec mycluster task.yaml      # queue on existing cluster
sky logs mycluster               # tail logs
sky down mycluster               # tear down
sky status                       # what is running and its cost
```

## Cost optimization

- **`sky show-gpus`** compares prices across providers.
- **Spot/interruptible** instances are much cheaper; checkpoint to survive
  preemption.
- **Autostop** (`--autostop`) prevents idle billing.
- **The cheapest option may not be the fastest.** Report cost-per-result, not
  cost-per-hour.

## Portability

- **One task file runs on any cloud.** This is the point; avoid provider-specific
  code in the task.
- **Environment** pinned in the setup section; the image is the reproducibility
  artifact.
- **Data** from object storage (S3/GCS) mounted or synced; do not bake into the
  image.

## Spot/preemption

- **Checkpoint frequently** and resume; a spot job that restarts from zero
  wastes its savings.
- **Handle preemption** gracefully; the job must be idempotent.
- **Report the preemption rate** if using spot.

## Job management

- **Queue** jobs (`sky exec`) rather than launching clusters per job.
- **Log paths** recorded; fetch logs back.
- **Verify outputs** after completion; a job that exits 0 and writes nothing is
  a failure.

## Reporting

State: the task YAML and its resources, the provider/instance used, the spot
status and the preemption handling, the cost estimate and the actual cost, the
wall clock, the data sources and checksums, the outputs with their checksums, and
the cost-per-result for comparison.

## Anti-patterns

- No cost estimate or comparison across providers.
- Spot jobs without checkpoint/resume.
- Idle clusters billing without autostop.
- Provider-specific code defeating the portability.
