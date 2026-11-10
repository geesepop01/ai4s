---
name: scientific-critical-thinking
description: Apply rigorous critical analysis to scientific claims, methods, and evidence. Use when evaluating a claim's strength, checking reasoning, or stress-testing a conclusion.
category: research
tags: [critical-thinking, reasoning, epistemology, skepticism, logic]
---

# Scientific Critical Thinking

Critical thinking is not skepticism for its own sake. It is the discipline of
asking what would have to be true for the conclusion to hold, and checking
whether it is.

## The core questions

For any claim, ask in this order:

1. **What exactly is claimed?** Restate it precisely. Most disagreements dissolve
   here — the claim being examined is often stronger than the claim being made.
2. **What is the evidence?** A measurement, an observation, an authority, an
   analogy? Each supports a different strength of claim.
3. **What would have to be true?** List the assumptions the conclusion requires.
4. **What else would explain the same evidence?** The rival explanation is the
   test. If several explanations fit, the evidence does not select one.
5. **What would change your mind?** If nothing would, this is not a scientific
   belief.

## Reasoning failures to check

| Failure | Test |
|---|---|
| Correlation → causation | Is there a mechanism, a temporal order, and no obvious confounder? |
| Survivorship | What happened to the units that did not make it into the data? |
| Base rate neglect | Given the prevalence, how likely is this signal to be a true positive? |
| Regression to the mean | Was the extreme group selected on the same measure being compared? |
| Selection bias | Who is in the sample, and does that differ from the target population? |
| Simpson's paradox | Does the effect hold within the subgroups, or only in aggregate? |
| Circular reasoning | Does the same data both generate and validate the claim? |
| HARKing | Was the hypothesis formed before or after seeing the result? |
| Anchoring | Would the conclusion differ if the first number you saw were different? |
| Conjunction fallacy | Is the specific scenario being judged less probable than its components? |
| Texas sharpshooter | Was the target drawn after the data were collected? |
| Appeal to complexity | Is a more complex model justified by out-of-sample evidence, not fit? |

## Calibration of language

Match the verb to the evidence:

| Evidence | Language |
|---|---|
| Direct measurement, replicated | "shows", "demonstrates" |
| Single study, well-controlled | "finds", "reports" |
| Observational association | "is associated with", "correlates with" |
| Suggestive, indirect | "suggests", "is consistent with" |
| Speculative | "may", "could", "hypothesis" |
| Not tested | "is unknown", "has not been established" |

**"Proves" is almost never the right word.** Neither is "confirms" for a single
study.

## Steelmanning

Before criticizing a claim, state the strongest version of it and the best
evidence for it. If your criticism only defeats a weaker version, it has not
addressed the claim.

## The adversarial pass

For a conclusion you are about to deliver, run one adversarial pass:

- What is the single most likely way this conclusion is wrong?
- What data would distinguish that from the conclusion?
- Did I actually run that check, or is it an assumption?
- Am I reporting the number I found or the number I expected?

## Applied to your own work

The same rigor applies to your own results, especially the clean ones. A result
that matches the hypothesis exactly, with no noise, is a result that needs
checking for leakage, overfitting, or an accidental use of the answer in the
pipeline.

Report what did not work. Negative results are results.
