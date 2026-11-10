---
name: sentence-transformers
description: Use sentence-transformers for embeddings — model selection, similarity, retrieval, and evaluation. Use for semantic similarity, clustering, and embedding-based retrieval.
category: ml
tags: [embeddings, sentence-transformers, similarity, retrieval, semantic]
disable-model-invocation: true
---

# Sentence Transformers

Embeddings encode meaning in geometry. The model, the pooling, and the
similarity metric all determine what "similar" means.

## The basics

```python
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("BAAI/bge-large-en-v1.5")
embeddings = model.encode(texts, normalize_embeddings=True,
                          convert_to_tensor=True, show_progress_bar=True)

cos_sim = util.cos_sim(embeddings[0], embeddings[1])
hits = util.semantic_search(query_emb, corpus_embeddings, top_k=10)
```

## Model selection

| Model | Strength |
|---|---|
| `bge-*` | Strong general retrieval, multilingual |
| `e5-*` | Strong, with query/passage prefixes |
| `all-MiniLM-L6-v2` | Fast, small, good baseline |
| `gte-*` | General, long context |
| Domain-specific | Trained on the target domain |

**State the model and its version.** Embedding models change; a result is only
reproducible with the exact model.

## Critical details

- **Query/passage asymmetry.** Some models (E5, BGE) require prefixes
  (`query:`, `passage:`). Skipping them degrades performance substantially.
- **Normalization** for cosine similarity; do not normalize for dot-product
  indexes.
- **Pooling** (CLS vs mean) is model-specific; use the model's default.
- **Max sequence length** truncates long documents; chunk or use a long-context
  model.

## Similarity metrics

- **Cosine** for normalized embeddings (default).
- **Dot product** for unnormalized, when magnitude carries meaning.
- **Euclidean** rarely; equivalent to cosine for normalized vectors.

## Evaluation

- **Retrieval:** recall@k, MRR, NDCG on a labeled query-document set.
- **Semantic similarity:** Spearman correlation with human judgments (STS-B).
- **Clustering:** adjusted Rand index, silhouette against labels.
- **Downstream task performance** is the real test; embedding benchmarks are
  proxies.

## Domain adaptation

- **Fine-tuning** with contrastive learning on domain pairs (positive/negative).
- **Hard negatives** matter most for retrieval quality.
- **Evaluate on the target domain's retrieval set**, not only generic STS.

## Reporting

State: the model and its exact version, the query/passage prefixes used, the
pooling and normalization, the similarity metric, the dimensionality, the
evaluation set and its metrics, the chunking for long documents, and the
downstream task result.

## Anti-patterns

- Comparing models with different prefixes or normalization.
- Evaluating only on generic STS for a domain retrieval task.
- Ignoring max length truncation.
- Reporting similarity without the metric.
