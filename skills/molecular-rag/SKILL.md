---
name: molecular-rag
description: Retrieval-augmented generation over molecular and chemical data — retrieving structures, properties, and literature for a molecular query. Use when a chemical question needs grounded retrieval.
category: chemistry
tags: [rag, retrieval, molecules, grounding, chemical-data]
disable-model-invocation: true
---

# Molecular RAG

Molecular retrieval-augmented generation grounds a chemical answer in retrieved
records rather than model memory. The retrieval is the evidence; the generation
must not outrun it.

## What to retrieve

| Question | Source | Record |
|---|---|---|
| What is this compound? | PubChem, ChEMBL | Structure, identifiers, properties |
| What does it do? | ChEMBL, DrugBank | Bioactivity with assay context |
| What binds it? | PDB, ChEMBL | Complexes, activities |
| Is it safe? | FAERS, ClinVar, literature | Signals, reports |
| Is it novel? | Patents, ChEMBL | Prior art, similar actives |
| What is known about it? | PubMed, OpenAlex | Literature with provenance |

## Retrieval discipline

1. **Resolve identity first.** InChIKey, CID, or canonical SMILES — not a name.
   Name ambiguity is the primary retrieval failure.
2. **Retrieve records, not summaries.** A record has provenance; a summary
   does not.
3. **Filter by evidence quality.** Assay confidence, review status, MSI level.
4. **Keep the citations.** Every generated claim must point to the retrieved
   record.

## Grounding

```markdown
Query: <the chemical question>
Retrieved:
  - [PubChem CID 2244] MW 180.16, canonical SMILES ...
  - [ChEMBL CHEMBL25, assay CHEMBL1234] IC50 = 12 nM (binding, human, confidence 9)
  - [PDB 1TUP] co-crystal structure, 2.0 Å
Generated answer:
  <claim> [source]
  <claim> [source]
Unretrieved / not found:
  <what the retrieval did not cover>
```

**Every claim carries its source.** A claim without a retrieved record is
generated text, not an answer.

## Failure modes

- **Identity ambiguity:** "glucose" resolves to open-chain, α, β, or a
  derivative. Resolve explicitly.
- **Cherry-picked retrieval:** the retriever finds the record that supports the
  desired answer. Retrieve broadly and report what was found, including
  contradictions.
- **Stale records:** compounds, activities, and classifications are revised.
  Record retrieval dates.
- **Cross-database mismatch:** the same name maps to different structures in
  different databases. Match on InChIKey.

## When RAG is not enough

- **Quantitative claims** (a specific IC50) need the record, not a summary.
- **Novel chemistry** has no records; the answer is a prediction, and must be
  labelled as such.
- **Safety conclusions** need evidence review, not retrieval.

## Reporting

State: the query and its resolution to identifiers, the databases queried and
the retrieval date, the retrieved records with their provenance, the claims and
their source mapping, the records that contradicted each other, and the
explicitly-not-covered parts of the question.
