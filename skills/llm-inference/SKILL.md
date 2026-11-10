---
name: llm-inference
description: Serve and evaluate LLM inference — batching, quantization, vLLM, and inference-time compute. Use for deploying or benchmarking language model inference.
category: ml
tags: [inference, vllm, serving, quantization, throughput]
disable-model-invocation: true
---

# LLM Inference

Inference is a systems problem: throughput, latency, memory, and quality trade
off. The serving configuration is part of the model's identity.

## Serving

| Tool | Strength |
|---|---|
| vLLM | Paged attention, high throughput |
| TGI | Production, HF-native |
| llama.cpp / GGUF | CPU/edge, quantized |
| TensorRT-LLM | NVIDIA-optimized |
| SGLang | Structured generation, fast |

```bash
vllm serve meta-llama/Llama-3.1-8B-Instruct \
  --max-model-len 8192 --tensor-parallel-size 2 \
  --quantization awq --dtype auto
```

## Quantization

| Method | Quality | Memory |
|---|---|---|
| FP16/BF16 | Reference | 2 bytes/param |
| INT8 (LLM.int8) | Near-lossless | 1 byte/param |
| AWQ / GPTQ | Small loss | 4 bit/param |
| GGUF (Q4_K_M) | Small loss | ~4.5 bit/param |

**Quantization changes the model.** Evaluate the quantized model on the target
task, not only on perplexity. Report the method and the bits-per-weight.

## Throughput vs latency

- **Continuous batching** (vLLM) maximizes throughput; latency per request
  varies.
- **Batch size** trades latency for throughput; state the operating point.
- **KV-cache size** limits the batch and the context; report it.
- **Speculative decoding** improves latency for some workloads.

## Inference-time compute

- **Chain-of-thought, self-consistency, best-of-n, tree search** — each trades
  compute for quality.
- **Report the token budget and the sampling settings.** "Score 82" is
  meaningless without them.
- **The inference configuration is part of the result identity** (see
  `ml-benchmark-evaluation`).

## Evaluation of a deployment

- **Latency percentiles** (p50, p95, p99), not just the mean.
- **Throughput** at a stated concurrency.
- **Quality regression** after quantization/optimization.
- **Cost per 1k tokens** with the pricing basis.

## Reproducibility

- **Sampling settings** (temperature, top_p, top_k, seed) recorded.
- **The prompt template and the tokenizer version** recorded.
- **Deterministic decoding** (temperature=0, greedy) where reproducibility
  matters; note that GPU nondeterminism can still vary outputs.

## Reporting

State: the model and its exact version, the serving engine and its version, the
quantization method and bits, the context length and KV-cache, the batch
configuration, the sampling settings and seed, the latency percentiles and
throughput at the stated concurrency, the quality regression check, and the cost
basis.

## Anti-patterns

- Comparing quality across different inference configurations without labeling
  them.
- Reporting latency without percentile distribution.
- Quantizing without a task-level quality check.
- Omitting the sampling settings from a reported generation.
