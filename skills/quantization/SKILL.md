---
name: quantization
description: Quantize models for efficiency — post-training quantization, quantization-aware training, and quality validation. Use when deploying models under memory or compute constraints.
category: ml
tags: [quantization, efficiency, compression, deployment, int8]
disable-model-invocation: true
---

# Quantization

Quantization reduces precision to save memory and compute. It changes the
model; the quality check on the target task is what licenses the deployment.

## Methods

| Method | Bits | Training needed | Quality |
|---|---|---|---|
| Dynamic | INT8 | No | Good for weights; activations dynamic |
| Static (PTQ) | INT8 | Calibration set | Good with calibration |
| QAT | INT8 | Yes (fake-quant) | Best INT8 |
| GPTQ | 4 | Calibration | Good for LLMs |
| AWQ | 4 | Calibration | Good for LLMs |
| GGUF | 2–8 | No | Good for edge/CPU |
| FP8 | 8 | Optional | Near-lossless on H100 |

## Calibration

- **The calibration set must represent the deployment distribution.** A
  calibration set from the wrong distribution produces a wrong quantized model.
- **Percentile / MSE / min-max** ranges; report which.
- **Tensor-level vs channel-wise** — channel-wise is more accurate.

## Quantization-aware training

```python
# PyTorch QAT
model.qconfig = torch.quantization.get_default_qat_qconfig('fbgemm')
model_prepared = torch.quantization.prepare_qat(model)
# ... train ...
model_quantized = torch.quantization.convert(model_prepared)
```

QAT simulates quantization during training; it recovers accuracy that PTQ loses.

## LLM-specific

- **Weight-only quantization** (GPTQ/AWQ) keeps activations in higher precision;
  it is the practical default.
- **KV-cache quantization** reduces inference memory at some quality cost.
- **Evaluate on the target tasks**, not only perplexity. Quantization can
  degrade specific capabilities more than average metrics suggest.

## Validation (mandatory)

- **Task-level evaluation** on the target use, before and after.
- **Per-category degradation** — some inputs degrade more than others.
- **Latency and memory measured** on the deployment hardware, not estimated.
- **The quality-cost tradeoff** reported, not only the compression ratio.

## Reporting

State: the method and its bit-width, the calibration set and its size and source,
the per-tensor/per-channel choice, the quality delta on the target task, the
memory and latency measured on the target hardware, the comparison to the
unquantized model, and the failure cases.

## Anti-patterns

- Reporting the compression ratio without the quality delta.
- Calibration on a non-representative set.
- Evaluating only perplexity for an LLM.
- Deploying without a task-level regression test.
