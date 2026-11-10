---
name: llm-fine-tuning
description: Fine-tune large language models — LoRA/QLoRA, SFT, DPO, and evaluation. Use for adapting LLMs to a task with correct data and evaluation discipline.
category: ml
tags: [llm, fine-tuning, lora, sft, dpo, peft]
disable-model-invocation: true
---

# LLM Fine-Tuning

Fine-tuning is data work more than modeling work. The training data's quality
and the evaluation's honesty determine whether the adaptation is useful.

## Methods

| Method | What it does | When |
|---|---|---|
| Full fine-tune | Updates all weights | Large data + compute; catastrophic forgetting risk |
| LoRA | Low-rank adapters | Default; cheap, reversible |
| QLoRA | LoRA on 4-bit base | Memory-constrained |
| SFT | Supervised instruction tuning | Format/task adaptation |
| DPO / ORPO | Preference alignment | Aligning to preferences without a reward model |
| Continued pretraining | Domain adaptation | Domain vocabulary/knowledge |

```python
from peft import LoraConfig, get_peft_model
config = LoraConfig(r=16, lora_alpha=32, target_modules=["q_proj","v_proj"],
                    lora_dropout=0.05, task_type="CAUSAL_LM")
model = get_peft_model(model, config)
model.print_trainable_parameters()   # confirm the trainable fraction
```

## Training data

- **Quality over quantity.** 1k clean examples beats 50k noisy ones.
- **Format consistency.** The prompt template must match inference exactly.
- **Decontamination.** Ensure the evaluation set is not in the training data;
  a fine-tune tested on its own training distribution is not a test.
- **License and consent** of the training data; record it.

## Training discipline

- **Learning rate** is the key hyperparameter; too high destroys the base
  model. Use a cosine schedule with warmup.
- **Epochs:** 1–3 is typical for SFT; more overfits.
- **Eval during training** on a held-out set; early stop on it.
- **Save the adapter and the base model hash**; an adapter alone is not a model.

## Evaluation

- **Task benchmarks** relevant to the target use.
- **Held-out human evaluation** for generation quality; automated metrics
  (BLEU, ROUGE) correlate weakly with quality.
- **Regression testing:** does the fine-tune break capabilities the base model
  had?
- **The evaluation set must be unseen.** Contamination is the most common way a
  fine-tune looks better than it is.

## Alignment (DPO)

```python
# DPO needs preference pairs: (prompt, chosen, rejected)
```

- **Preference data quality** is the constraint; contradictory preferences
  produce incoherent behavior.
- **Report the win rate** against the base on held-out prompts, with the judge
  method and its validity.

## Reporting

State: the base model and its exact version/hash, the method (LoRA rank,
target modules, QLoRA quantization), the training data with its size, source,
license, and decontamination check, the hyperparameters and schedule, the
evaluation benchmarks and the contamination check, the regression tests, and
the comparison to the base model with its uncertainty.

## Anti-patterns

- Evaluation on contaminated or training-overlapping data.
- Reporting a fine-tune as better from automated metrics alone.
- Forgetting regression testing against base capabilities.
- Inconsistent prompt formatting between training and inference.
