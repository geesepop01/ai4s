---
name: pytorch-lightning
description: Use PyTorch Lightning for structured, reproducible deep learning — modules, trainers, logging, and multi-GPU. Use when a training project needs organization and reproducibility.
category: ml
tags: [lightning, pytorch, training, structure, multi-gpu]
disable-model-invocation: true
---

# PyTorch Lightning

Lightning structures PyTorch training into a standard module. The value is
reproducibility and multi-GPU support; the trap is hiding bugs inside hooks.

## Structure

```python
import pytorch_lightning as pl

class Model(pl.LightningModule):
    def __init__(self, lr=1e-3):
        super().__init__()
        self.save_hyperparameters()
        self.net = ...
        self.loss = nn.CrossEntropyLoss()

    def training_step(self, batch, batch_idx):
        x, y = batch
        logits = self.net(x)
        loss = self.loss(logits, y)
        self.log("train_loss", loss, on_epoch=True, prog_bar=True)
        return loss

    def validation_step(self, batch, batch_idx):
        x, y = batch
        logits = self.net(x)
        loss = self.loss(logits, y)
        self.log("val_loss", loss, on_epoch=True, prog_bar=True)

    def configure_optimizers(self):
        return torch.optim.AdamW(self.parameters(), lr=self.hparams.lr)

trainer = pl.Trainer(max_epochs=50, accelerator="auto", devices="auto",
                     deterministic=True, logger=True,
                     callbacks=[pl.callbacks.EarlyStopping("val_loss")])
trainer.fit(model, train_loader, val_loader)
```

## Reproducibility

- **`deterministic=True`** for reproducible runs (slower).
- **`seed_everything(seed, workers=True)`** seeds the dataloaders too.
- **`save_hyperparameters()`** records the config; use it.
- **Loggers** (TensorBoard, W&B, CSV) record the run; the CSV logger is
  dependency-free and durable.

## Callbacks

| Callback | Use |
|---|---|
| `ModelCheckpoint` | Save best by a monitored metric |
| `EarlyStopping` | Stop on a monitored metric |
| `LearningRateMonitor` | Log the LR |
| `TQDMProgressBar` | Progress |

**Checkpoint selection is a scientific choice.** Monitor a validation metric;
never the test.

## Multi-GPU and scaling

- **DDP** (`strategy="ddp"`) for multi-GPU; batch size scales per GPU — report
  the effective batch size.
- **Mixed precision** (`precision="16-mixed"`) for speed.
- **Gradient accumulation** (`accumulate_grad_batches`).
- **`strategy="deepspeed"`** or FSDP for large models.

## Common Lightning-specific bugs

- **Metrics logged wrong** (`on_step` vs `on_epoch`) — a metric logged on_step
  is not an epoch average.
- **Validation leakage** if `validation_step` touches training data.
- **Distributed sampler** missing, duplicating data across GPUs.
- **`num_workers` and determinism** interact; set `workers=True` in
  `seed_everything`.

## Reporting

State: the Lightning version, the module's hyperparameters (from
`save_hyperparameters`), the trainer configuration (accelerator, devices,
precision, strategy, accumulate), the monitored metric and the checkpoint
criterion, the seed and determinism settings, and the per-seed results.

## Anti-patterns

- Monitoring a test metric for checkpointing.
- A single seed reported as the result.
- Metrics logged without specifying the aggregation.
- Multi-GPU runs with an effective batch size that was never stated.
