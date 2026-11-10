---
name: attention-mechanisms
description: Implement and reason about attention mechanisms — scaled dot-product, multi-head, efficient variants, and attention diagnostics. Use when attention behavior matters to the result.
category: ml
tags: [attention, transformers, mechanisms, efficiency, diagnostics]
disable-model-invocation: true
---

# Attention Mechanisms

Attention is a routing operation: it decides which values each position
consumes. Its variants trade expressiveness for efficiency, and its patterns
are diagnostics, not explanations.

## The core

```python
import torch, torch.nn.functional as F

def attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = Q @ K.transpose(-2, -1) / d_k**0.5
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float("-inf"))
    return F.softmax(scores, dim=-1) @ V
```

**The 1/√d_k scaling** prevents softmax saturation. Without it, gradients
vanish as dimension grows.

## Variants

| Variant | Change | Trade-off |
|---|---|---|
| Multi-head | Multiple subspaces | Expressiveness; more compute |
| Grouped-query (GQA) | Share K/V across heads | Smaller KV cache |
| Multi-query (MQA) | One K/V for all heads | Fastest inference |
| Sliding window | Local attention | Long context, limited global |
| Sparse (Longformer, BigBird) | Structured sparsity | O(n) with global tokens |
| Linear (Performer, Linformer) | Kernel approximation | O(n), approximation error |
| FlashAttention | IO-aware exact | Speed/memory, no model change |
| Cross-attention | Q from one modality | Multimodal fusion |

**FlashAttention is not a model change** — it computes the exact same attention
with better memory access. Report it as an implementation choice.

## Causal masking

- Decoder-only models use a causal mask (each position attends to earlier only).
- **The mask is the difference between a language model and an autoencoder.**
  Forgetting it produces leakage.

## Diagnostics

- **Attention entropy** — collapse (all mass on one position) or uniformity.
- **Attention distance** — how far positions attend; depth-dependent patterns.
- **Head specialization** — some heads are positional, others syntactic.
- **Attention rollout** for attribution, with the caveat that attention is not
  explanation (see `model-interpretability`).

## Memory and scaling

- **KV cache** dominates inference memory: `2 * layers * heads * d_head * seq_len`.
- **MQA/GQA** reduce the cache; they matter for long-context serving.
- **Sequence length** is the O(n²) driver; efficient variants trade accuracy.

## Implementation correctness

- **Numerical stability:** subtract the max before softmax for long sequences.
- **Masking before softmax**, not after.
- **dtype:** fp16 attention overflows easily; use bf16 or scaled attention.
- **Verify against a reference implementation** on a small case.

## Reporting

State: the attention variant and its parameters (heads, d_head, mask type), the
implementation (FlashAttention version, dtype), the KV-cache configuration for
inference, the sequence length and any truncation, and the diagnostics checked
for the claimed behavior.

## Anti-patterns

- Treating attention weights as explanations.
- Missing causal mask in a language model.
- Claiming an efficiency gain without the accuracy trade-off.
- Comparing models with different attention variants as if identical.
