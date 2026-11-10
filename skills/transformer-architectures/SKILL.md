---
name: transformer-architectures
description: Understand and implement transformer architectures — attention, positional encoding, variants, and scaling. Use for building, modifying, or reasoning about transformer models.
category: ml
tags: [transformers, attention, architecture, scaling, llm]
disable-model-invocation: true
---

# Transformer Architectures

Understanding the architecture is what lets you modify it correctly and predict
where it will fail.

## The core

```
Attention(Q, K, V) = softmax(QKᵀ/√d_k) V
MultiHead = Concat(head_1, ..., head_h) W^O
FFN(x) = W₂ · GELU(W₁x + b₁) + b₂
Block = x + Attention(LN(x)); x + FFN(LN(x))       # pre-norm modern
```

- **Pre-norm vs post-norm:** pre-norm (norm before the sublayer) trains more
  stably at depth; post-norm is the original. State which.
- **Attention complexity:** O(n²) in sequence length. This drives every
  long-context variant.

## Variants

| Variant | Change | Motivation |
|---|---|---|
| Multi-head attention | Multiple subspaces | Different relation types |
| Grouped-query / MQA | Share K/V across heads | KV-cache size for inference |
| RoPE / ALiBi | Relative/rotary position | Length extrapolation |
| SwiGLU | Gated FFN | Better performance |
| RMSNorm | Cheaper normalization | Speed |
| FlashAttention | IO-aware exact attention | Speed/memory, not a model change |
| Sparse/linear attention | Approximate O(n) | Long sequences |
| Mixture of Experts | Conditional FFN | Scale parameters without FLOPs |

## Positional encoding

- **Sinusoidal** (original) vs **learned** vs **RoPE** (rotary) vs **ALiBi**.
- **RoPE** is the modern default; its base frequency controls length
  extrapolation.
- **No position** = permutation-invariant; without it a transformer cannot
  order tokens.

## Scaling

- **Chinchilla:** compute-optimal is ~20 tokens per parameter. Training a 7B
  model on 1B tokens is undertrained.
- **Scaling laws** are empirical; report the compute, tokens, and parameters.
- **Emergence claims** are metric-dependent; a smooth capability under one
  metric can look emergent under another.

## When things fail

- **Attention sink / attention collapse** in long contexts.
- **Position extrapolation** beyond training length degrades; RoPE scaling or
  ALiBi mitigates.
- **Over-mixing in deep layers** (representation collapse) at high depth.
- **Training instability:** use pre-norm, careful init (scaled init for depth),
  and learning-rate warmup.

## Modifying a transformer

- **Adding a modality** needs a projection and an interface; the pretraining
  recipe matters more than the layer.
- **Pruning/quantization** changes the model; validate on the target task, not
  only perplexity.
- **Fine-tuning** (LoRA) changes a small subspace; report the rank and which
  modules were adapted.

## Reporting

State: the architecture and its deviations from the baseline (norm placement,
activation, positional encoding, attention variant), the parameter count and the
non-embedding count, the training tokens and compute, the initialization and
warmup, the tokenizer, and the evaluation settings (context length, prompt
format).

## Anti-patterns

- Claiming emergent ability from one metric without checking the metric.
- Comparing models with different tokenizers on token-level metrics.
- Omitting the architecture's deviations from the standard.
- Reporting parameters without tokens/compute.
