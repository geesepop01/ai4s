---
name: hugging-face-model-trainer
description: Train and share models with Hugging Face — Trainer API, configuration, model cards, and Hub publishing. Use for standard NLP/transformer training with reproducibility.
category: ml
tags: [huggingface, trainer, transformers, training, hub]
disable-model-invocation: true
---

# Hugging Face Model Trainer

The Trainer API standardizes training, but the configuration is where the
science is. Reproducibility and correct evaluation are on you.

## The setup

```python
from transformers import (AutoModelForSequenceClassification, AutoTokenizer,
                          TrainingArguments, Trainer, set_seed)
set_seed(42)

model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased",
                                                            num_labels=3)
args = TrainingArguments(
    output_dir="out", num_train_epochs=3,
    per_device_train_batch_size=16, learning_rate=2e-5,
    evaluation_strategy="epoch", save_strategy="epoch",
    load_best_model_at_end=True, metric_for_best_model="f1",
    logging_steps=50, seed=42, report_to=["none"],
)

trainer = Trainer(model=model, args=args, train_dataset=train,
                  eval_dataset=val, compute_metrics=compute_metrics)
trainer.train()
```

## Data

- **Tokenization** with the model's tokenizer; truncation/padding settings
  recorded.
- **Split before tokenization** and before any fitting.
- **Class imbalance:** `compute_metrics` should report per-class; use
  `weight` in the loss or resampling.
- **Decontamination** for evaluation sets.

## Training configuration

- **Learning rate and schedule** are the key choices; use the model card's
  recommended LR as a starting point.
- **Warmup** (`warmup_ratio=0.06` typical).
- **Gradient accumulation** for large effective batch.
- **Mixed precision** (`fp16`/`bf16`) for speed; check for underflow.
- **`load_best_model_at_end` with a validation metric** — never test.

## Evaluation

- **`compute_metrics`** must report the metrics that matter (per-class F1,
  AUPRC for imbalance), not just accuracy.
- **Multiple seeds** (`set_seed` + loop); report the mean and spread.
- **The test set is evaluated once**, on the frozen best model.

## Sharing

```python
trainer.push_to_hub("namespace/model-name")
```

**The model card is required** for anything shared:

```markdown
---
license: apache-2.0
metrics: [f1, accuracy]
datasets: [dataset-name]
---
# Model Card: intended use, training data, evaluation, limitations, bias
```

## Reporting

State: the base model and its version, the tokenizer and its settings, the
training arguments (all of them; save `training_args.bin`), the data and its
splits, the metric definitions, the seeds and the per-seed results, the
evaluation on the untouched test set, and the model card.

## Anti-patterns

- Reporting accuracy alone on imbalanced data.
- Selecting the checkpoint on test performance.
- No model card for a shared model.
- A single seed.
