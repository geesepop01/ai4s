---
name: rag
description: Build retrieval-augmented generation systems — chunking, embeddings, retrieval, reranking, and grounded evaluation. Use when an LLM must answer from specific documents with citations.
category: ml
tags: [rag, retrieval, embeddings, grounding, citations]
disable-model-invocation: true
---

# Retrieval-Augmented Generation

RAG grounds generation in retrieved documents. Its quality is determined by the
retrieval, not the generator: if the right passage is not retrieved, the answer
cannot be correct.

## The pipeline

```
documents → chunk → embed → index → query → retrieve → rerank →
  generate with context → verify citations
```

## Chunking

- **Chunk size and overlap** are the most consequential choices. Too small
  loses context; too large dilutes the signal.
- **Structure-aware chunking** (by heading, paragraph, table) beats fixed-size
  for documents.
- **Preserve metadata** (source, section, page) for citation.

## Embeddings and indexing

- **Embedding model** choice matters (bge, e5, OpenAI, Cohere); state the model
  and its version.
- **Index type:** FAISS, HNSW, pgvector. The recall/latency tradeoff.
- **Hybrid retrieval** (BM25 + dense) is stronger than either alone for many
  corpora.
- **Metadata filtering** before or during retrieval.

## Retrieval and reranking

- **Top-k** is a tuning parameter; measure recall@k on a labeled set.
- **Reranking** (cross-encoder, ColBERT) substantially improves precision; it is
  worth the cost for quality-critical use.
- **Query rewriting** (HyDE, multi-query) for hard queries.

## Grounded generation

- **The context must be in the prompt with its source markers.** Cite the source
  for every claim.
- **Refuse when retrieval fails.** A model asked about something not in the
  corpus should say so, not hallucinate.
- **Long contexts** degrade attention to middle content; put the most relevant
  passages where the model uses them.

## Evaluation (the part everyone skips)

- **Retrieval metrics:** recall@k, MRR, NDCG on a labeled query set.
- **Generation faithfulness:** is every claim supported by the retrieved
  context? (RAGAS, or human judgment.)
- **Answer relevance** to the query.
- **End-to-end** with a gold answer set and a judge with validity (see
  `llm-as-judge-evaluation`).

**Without retrieval evaluation, a RAG system's failure is unattributable.**

## Reporting

State: the corpus and its size/version, the chunking strategy, the embedding
model and its version, the index and its parameters, the retrieval and
reranking configuration, the top-k and the recall@k on the labeled set, the
generation settings, the faithfulness and relevance evaluation with its method,
and the citation verification.

## Anti-patterns

- Tuning the generator while the retrieval is broken.
- No retrieval metrics, only end-to-end answer quality.
- Hallucinated citations (the model invents a source).
- Chunking that splits mid-table or mid-argument.
