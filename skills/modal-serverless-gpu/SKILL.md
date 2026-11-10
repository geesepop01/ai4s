---
name: modal-serverless-gpu
description: Run serverless GPU workloads on Modal — functions, images, volumes, and cost control. Use for bursty or embarrassingly parallel GPU compute.
category: cloud-compute
tags: [modal, serverless, gpu, cloud, scaling]
disable-model-invocation: true
---

# Modal Serverless GPU

Modal runs Python functions on serverless GPUs with per-second billing. It is
right for bursty, parallel, or intermittent workloads — not for long-running
persistent jobs.

## The pattern

```python
import modal

app = modal.App("research")
image = modal.Image.debian_slim().pip_install("torch", "numpy")

@app.function(image=image, gpu="A100", timeout=3600, memory=32768)
def train(config: dict):
    import torch
    # ... train ...
    return result

@app.function(image=image, gpu="A100", concurrency_limit=8)
def map_fn(item):
    return process(item)

@app.local_entry_point()
def main():
    results = list(map_fn.map(items))
```

## Cost and control

- **Per-second billing** after a minimum. Idle containers are reaped; design for
  cold starts.
- **`concurrency_limit`** caps parallel GPUs. Exceeding it queues; state the
  limit.
- **`timeout`** hard-kills; set it generously but deliberately.
- **Volumes / NetworkFilesystem** for data; do not bake large data into the
  image.
- **Secrets** via `modal.Secret`, never in code.

## Images

- **Build once, cache.** The image is the environment; record its definition.
- **Pin versions** in `pip_install`. An unpinned image changes under you.
- **Custom images** for CUDA/PyTorch matching the GPU.

## Data handling

- **Mount volumes** for datasets and checkpoints; snapshot checkpoints so a
  preemption is survivable.
- **Return values** must be serializable; write large outputs to a volume.
- **Fetch artifacts back** with checksums; a listed artifact is not a retrieved
  one.

## Cost estimation before dispatch

```
cost = gpu_rate_per_hour × hours × count
```

State the estimate, the GPU type, the wall clock, and get approval before a paid
run. See `cloud-compute` for the dispatch record.

## Verification

- **Assert on expected outputs** after the job. A job that exits and writes
  nothing is a failure.
- **Logs** retrieved and kept.
- **Determinism:** fix seeds and record the environment for reproducibility.

## Reporting

State: the app/image definition and its pinned versions, the GPU type and count,
the concurrency limit and timeout, the data paths and their checksums, the cost
estimate and its basis, the wall clock, the outputs with their checksums, and
the run manifest.

## Anti-patterns

- No cost estimate before a paid dispatch.
- Unpinned image dependencies.
- Large data baked into the image.
- No output verification after the job.
