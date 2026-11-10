---
name: pytorch
description: Use PyTorch for deep learning — models, training loops, debugging, and reproducibility. Use for any neural network work where the training must be correct and reproducible.
category: ml
tags: [pytorch, deep-learning, training, neural-networks, debugging]
---

# PyTorch

PyTorch is flexible, which means the bugs are yours. Reproducibility and
correctness discipline separate a working experiment from a plausible-looking
one.

## Reproducibility

```python
import torch, random, numpy as np

def seed_everything(seed=42):
    random.seed(seed); np.random.seed(seed); torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

# DataLoader workers
g = torch.Generator().manual_seed(42)
loader = DataLoader(ds, batch_size=64, shuffle=True, num_workers=4, generator=g,
                    worker_init_fn=seed_worker)
```

**Full determinism is expensive** (slower) and some ops have no deterministic
kernel. Choose deliberately and report which you used.

## The training loop

```python
model.train()
for epoch in range(epochs):
    for x, y in loader:
        optimizer.zero_grad()
        out = model(x)
        loss = loss_fn(out, y)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
    scheduler.step()
```

- **`.train()` / `.eval()`** switch dropout and BatchNorm. Forgetting is a silent
  correctness bug.
- **`optimizer.zero_grad()`** every step (or `set_to_none=True` for speed).
- **Gradient clipping** for RNNs/transformers; report the threshold.
- **Validation loop under `torch.no_grad()`** and `.eval()`.

## Debugging

- **Overfit a single batch first.** If the model cannot drive one batch to zero
  loss, the bug is in the model/loss, not the data.
- **Check input/output shapes at every layer** (`torchinfo.summary`).
- **Gradient flow:** verify every parameter that should train has a non-None,
  non-zero gradient. `assert p.grad is not None`.
- **NaN/Inf:** check the loss at the first step; use `torch.autograd.set_detect_anomaly(True)`.
- **Learning rate:** the most common hyperparameter bug. A warmup + scheduler is
  standard for transformers.

## Data discipline

- **Split before any fitting** (normalization, augmentation statistics).
- **DataLoader `drop_last`, `pin_memory`, `num_workers`** affect results and
  speed; report them.
- **Augmentation** on the train split only; state the transforms.
- **Class imbalance:** weighted loss, oversampling, or focal loss — state the
  choice.

## Evaluation

- **`model.eval()` + `torch.no_grad()`** for inference.
- **Per-class metrics**, not just accuracy (see `ml-evaluation`).
- **Multiple seeds** for the reported result; the mean and spread.
- **Checkpoint selection** by validation, never test.

## Performance

- **Mixed precision** (`torch.cuda.amp`) for speed; watch for underflow.
- **`torch.compile`** for speedups; verify it does not change the result.
- **Gradient accumulation** for large effective batch sizes.
- **Profile** with `torch.profiler` before optimizing blindly.

## Reporting

State: the model architecture with its parameter count, the loss and its
reduction, the optimizer and scheduler with their parameters, the batch size and
effective batch size, the augmentation, the seeds and determinism settings, the
checkpoint selection criterion, and the per-seed results.

## Anti-patterns

- Forgetting `.eval()`/`.train()`.
- Fitting normalization on the full dataset.
- Reporting a single seed.
- Selecting the checkpoint on test performance.
- A model that cannot overfit one batch being trained on the full dataset.
