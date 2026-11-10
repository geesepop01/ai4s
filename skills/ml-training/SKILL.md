---
name: ml-training
description: Machine learning training workflows. Use for classical ML (sklearn), deep learning (PyTorch), fine-tuning (LoRA/PEFT), distributed training, and experiment tracking.
category: ml
tags: [ml, training, pytorch, sklearn, fine-tuning, lora, deep-learning]
disable-model-invocation: true
---

# ML Training

## Overview

This skill covers ML training workflows from classical models to deep learning and
LLM fine-tuning. Always start with the simplest model that can solve the problem.

## Decision Matrix: What to Use

| Situation | Start Here | Escalate To |
|-----------|-----------|-------------|
| Tabular, < 100k rows | XGBoost / LightGBM / sklearn | Small MLP |
| Text classification | Fine-tune small encoder (BERT) | LLM few-shot |
| Generation / instruction | Prompt strong base → LoRA SFT | Full fine-tune |
| Image classification | Fine-tune pretrained CNN/ViT | Train from scratch |
| Time series | Classical (ARIMA, GBM) | Temporal nets |

## Classical ML (scikit-learn)

```python
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import pandas as pd
import numpy as np

# Load and prepare data
df = pd.read_csv('data.csv')
X = df.drop('target', axis=1)
y = df['target']

# Split BEFORE any preprocessing
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Scale (fit on train only!)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train
model = GradientBoostingClassifier(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# Evaluate
y_pred = model.predict(X_test_scaled)
print(classification_report(y_test, y_pred))

# Cross-validation
cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='f1_weighted')
print(f"CV F1: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
```

## Deep Learning (PyTorch)

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

# Set seeds for reproducibility
torch.manual_seed(42)
np.random.seed(42)

# Model
class SimpleNet(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden_dim, output_dim)
        )

    def forward(self, x):
        return self.net(x)

# Training loop
model = SimpleNet(input_dim=100, hidden_dim=64, output_dim=10)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
criterion = nn.CrossEntropyLoss()

for epoch in range(100):
    model.train()
    for batch_x, batch_y in train_loader:
        optimizer.zero_grad()
        output = model(batch_x)
        loss = criterion(output, batch_y)
        loss.backward()
        optimizer.step()

    if (epoch + 1) % 10 == 0:
        model.eval()
        with torch.no_grad():
            val_loss = criterion(model(X_val), y_val)
        print(f"Epoch {epoch+1}: val_loss={val_loss:.4f}")
```

## LLM Fine-Tuning (LoRA/PEFT)

```python
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer

# Load base model
model_name = "meta-llama/Llama-3.1-8B"
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch.bfloat16)
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

# LoRA config
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)
model = get_peft_model(model, lora_config)
print(f"Trainable params: {model.print_trainable_parameters()}")

# Training
training_args = TrainingArguments(
    output_dir="./output",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    warmup_steps=100,
    logging_steps=10,
    save_steps=500,
    bf16=True,
)

trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
    tokenizer=tokenizer,
    max_seq_length=2048,
)
trainer.train()
```

## Experiment Tracking

```python
import wandb

wandb.init(project="my-research", config={
    "learning_rate": 2e-4,
    "epochs": 3,
    "batch_size": 4,
    "model": "llama-3.1-8b",
    "lora_r": 16,
})

# Log metrics during training
wandb.log({"train_loss": loss.item(), "val_loss": val_loss, "epoch": epoch})
wandb.finish()
```

## Best Practices

1. **Split first**: Never touch test data during training or preprocessing
2. **Audit for leakage**: temporal, group, target, duplicate rows
3. **Start small**: simplest model first, escalate only if needed
4. **Set seeds**: Python, NumPy, framework for reproducibility
5. **Track everything**: use W&B or MLflow for every run
6. **Multiple seeds**: report variance, not a single point
7. **Always run baselines**: majority class, linear model, or previous SOTA
8. **Error analysis**: inspect worst predictions, find systematic failures
