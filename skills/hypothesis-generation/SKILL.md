---
name: hypothesis-generation
description: Generate and rank scientific hypotheses with explicit mechanisms, predictions, and falsification tests. Use at the start of a research project or when a surprising result needs new explanations.
category: research
tags: [hypothesis, reasoning, design, falsification, mechanism]
---

# Hypothesis Generation

A hypothesis is not a guess. It is a statement that connects a mechanism to a
prediction, and that admits a test which could prove it wrong.

## The structure of a hypothesis

```markdown
### H<n>: <one-sentence statement>

Mechanism: <why this should be true — the causal or physical story>
Prediction: <what we should observe if it holds, stated as a measurable quantity>
Falsifier: <what observation would rule it out>
Distinguishing test: <what separates it from the nearest rival hypothesis>
Prior support: <verified sources that support the mechanism, with what they showed>
```

If any of these five fields cannot be filled, the statement is not yet a
hypothesis — it is an observation or a wish.

## Generating candidates

1. **Start from the anomaly, not the theory.** What specifically did the data do
   that the current explanation does not cover?
2. **Enumerate mechanisms, not outcomes.** "Because the classifier is
   overfitting" is an outcome; "because the train split contains near-duplicate
   subjects" is a mechanism.
3. **Generate the rival, always.** For every hypothesis, name the strongest
   competing explanation and what separates them. A hypothesis with no rival has
   not been tested; it has been chosen.
4. **Cross fields when the question spans them.** A pediatric audio dataset
   question may have an acoustics answer, a developmental answer, and a
   recording-protocol answer.
5. **Use the literature as a constraint, not a source of hypotheses.** Verified
   prior work rules mechanisms in and out; it does not hand you your hypothesis.

## Ranking

Score each candidate on:

- **Mechanistic specificity** — can you state the causal chain?
- **Falsifiability** — is there a feasible test that could disprove it?
- **Discriminating power** — does it predict something its rivals do not?
- **Prior plausibility** — is it consistent with verified evidence?
- **Test cost** — what does it take to run the discriminating test?

## Recording

The output is `hypotheses.md`, with each hypothesis in the structure above and a
ranking table. This file feeds Stage 3 REASON and Stage 4 METHODOLOGY: the
selected hypothesis's falsifier and distinguishing test become the success
criteria in `methodology.md`.

## Common failure modes

- **Hypothesis = desired conclusion.** If the hypothesis is what you want to be
  true, name that as a bias and generate the rival first.
- **Unfalsifiable statements.** "The model captures something about the data" is
  not a hypothesis.
- **One hypothesis, no rival.** A result that fits one hypothesis and its rival
  equally well has learned nothing.
- **Post-hoc rationalization.** A hypothesis written after seeing the result is
  labelled exploratory and tested on new data before it is called confirmatory.
