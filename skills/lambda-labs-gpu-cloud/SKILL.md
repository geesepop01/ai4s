---
name: lambda-labs-gpu-cloud
description: Run GPU workloads on Lambda Cloud — instances, SSH access, data transfer, and cost control. Use for persistent GPU instances and interactive development.
category: cloud-compute
tags: [lambda, gpu, cloud, ssh, instances]
disable-model-invocation: true
---

# Lambda Labs GPU Cloud

Lambda provides persistent GPU instances with SSH access. It is right for
interactive development and long-running training, unlike serverless.

## The workflow

```
launch instance → SSH in → sync data → set up env → run under a process
  supervisor → monitor → fetch artifacts → tear down
```

## Instances and cost

- **GPU types** (A10, A100, H100) at hourly rates. State the rate and the
  estimate before launch.
- **Persistent instances bill while running**, including idle. Set a reminder to
  tear down.
- **Spot/interruptible** where available; checkpoint to survive.

## SSH and setup

```bash
ssh -i ~/.ssh/lambda ubuntu@<ip>
# Environment
conda create -n research python=3.11 -y
pip install -r requirements.txt
# Or use a container for reproducibility
```

- **Key-based access**; BatchMode for scripts.
- **The environment is not reproducible unless pinned.** Use a container or a
  lockfile.

## Data

- **Lambda FS** or object storage for datasets; `rsync` for transfer.
- **Record checksums** on both ends; a failed transfer looks like a successful
  one until the run produces nonsense.
- **Egress costs** on transfer out; state them.

## Running jobs

- **Run under a supervisor** (tmux, nohup, systemd) so a dropped SSH session
  does not kill the job.
- **Log to a file** with a known path.
- **Checkpoint** periodically to the filesystem so a restart resumes.
- **Monitor** GPU utilization, memory, and disk.

## Cost control

```
est_cost = rate_per_hour × hours
```

- **Estimate before launch**, state it, and get approval for paid runs.
- **Tear down explicitly**; idle instances bill.
- **Set a budget alarm** if the provider supports it.

## Verification

After the run: fetch artifacts with checksums, verify the outputs, keep the
logs. A job that "completed" but wrote nothing is a failure.

## Reporting

State: the instance type and GPU, the image/AMI and the environment definition,
the data sources and their checksums, the job command and its supervisor, the
cost estimate and the actual, the outputs with their checksums, and the teardown
confirmation.

## Anti-patterns

- Leaving an idle instance running.
- Unpinned environments.
- No data checksum verification.
- Long jobs run in a bare SSH session that can drop.
