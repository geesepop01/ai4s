---
name: opentargets-database
description: Query Open Targets for drug-target-disease evidence, target tractability, and associated evidence. Use for target validation and drug discovery evidence review.
category: databases
tags: [opentargets, drug-target, disease, evidence, tractability]
disable-model-invocation: true
---

# Open Targets

Open Targets integrates evidence linking targets to diseases from genetics,
genomics, literature, and drug data. It is an evidence aggregator: its score is
a summary of heterogeneous evidence, not a measurement.

## The GraphQL API

```python
import requests

query = """
query {
  target(ensemblId: "ENSG00000141510") {
    id approvedSymbol approvedName
    associatedDiseases(page:{size:10}) {
      rows {
        disease { id name }
        score
        datatypeScores { componentId score }
      }
    }
  }
}
"""
r = requests.post("https://api.platform.opentargets.org/api/v2/graphql",
                  json={"query": query})
```

## Understanding the evidence

- **The overall association score** is a harmonic-sum combination of datatype
  scores. It is not a probability and not comparable across diseases with
  different evidence density.
- **Datatype scores** (genetic_association, somatic_mutation,
  known_drug, literature, animal_model, rna_expression, affected_pathway) tell
  you *why* the association exists. Report them separately, not only the total.
- **Evidence direction** matters: is the genetic evidence for loss-of-function
  or gain-of-function? Does it support agonism or antagonism?

## Target tractability

The tractability assessment answers a different question than association:
"can this target be modulated by a drug-like molecule?"

- **Small molecule / antibody tractability** by modality and by pocket/druggability
  assessment.
- **A highly associated target that is not tractable** is a biology finding, not
  a drug program.

## Common queries

- **Target → diseases:** what is this gene implicated in?
- **Disease → targets:** what are the candidate targets for this disease?
- **Drug → target → disease:** what is the evidence for an existing drug's
  indication?
- **Evidence for a specific pair:** the underlying studies, with their scores.

## Interpretation rules

- **Association ≠ causation ≠ druggability.** Three separate claims; the platform
  addresses them separately.
- **Evidence density bias.** Well-studied targets accumulate scores; a
  low-scoring novel target is not necessarily weaker.
- **Literature evidence** is text-mined and includes co-mention, not
  experimental support. Check the source.
- **Genetic evidence** is the most causal; give it the most weight when it
  exists.
- **Check the evidence record**, not just the score. The score summarizes; the
  record is the evidence.

## Reporting

State: the target and disease identifiers, the platform version/query date, the
overall score **and** the datatype breakdown, the strongest evidence with its
source, the direction of effect where available, the tractability assessment for
a druggability claim, and the caveats (evidence density, text-mining, species).

## Anti-patterns

- Quoting the overall score as if it were a probability of success.
- Claiming causality from association scores.
- Ignoring the datatype breakdown.
- Calling a target "validated" from a database score alone.
