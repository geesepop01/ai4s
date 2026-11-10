---
name: experimental-design
description: Design experiments and studies with proper controls, randomization, blocking, and pre-registration. Use before any wet-lab, clinical, A/B, or benchmark study where the design determines what the result can mean.
category: research
tags: [design, experiment, controls, randomization, preregistration]
---

# Experimental Design

The design is what gives a result its meaning. No analysis recovers meaning that
the design did not build in. This skill is the design checklist before any study.

## The design record

```markdown
# Design: <study name>

Question: <one sentence, with the population and the outcome>
Hypothesis and its pre-specified falsifier
Unit of observation: <what one row is: subject, sample, run, well>
Unit of randomization: <what was randomized, and at what level>
Primary outcome: <one, named, with how it is measured>
Secondary outcomes: <named, labelled as such>
Sample size and its basis: <power calculation or precision target>
Inclusion/exclusion criteria: <stated before data collection>
Stopping rule: <when the study ends>
Analysis plan: <the test, its assumptions, the correction family>
```

## The elements that carry the meaning

**Controls.** Every experiment needs the control that tells you what would have
happened anyway:
- *Negative control* — should show no effect. Detects contamination and bias.
- *Positive control* — should show a known effect. Detects a broken assay.
- *Vehicle / sham / baseline* — the treatment without the active component.
- *Historical control* — acceptable only when concurrent controls are impossible,
  and stated as a limitation.

**Randomization.** Randomize at the level of the unit of observation. Randomizing
wells when the outcome is per-subject does not remove subject effects. Record the
seed and the assignment.

**Blocking.** Group nuisance variation (batch, day, plate, operator, site) into
blocks and randomize within blocks. Analyze the block, not as noise but as a
factor. An unblocked batch effect is indistinguishable from a treatment effect.

**Blinding.** Whoever measures the outcome should not know the assignment when
feasible. State who was blinded and who could not be.

**Replication.** Distinguish *technical* replicates (same sample, repeated
measurement) from *biological* replicates (independent samples). Only biological
replicates support inference about biology. Report n at the level you claim.

## Pre-registration

Pre-specify before observing outcomes:

- Primary outcome and its measurement.
- The analysis and its assumptions.
- Inclusion/exclusion criteria and the stopping rule.
- The multiple-testing family.

Anything decided after seeing the data is labelled exploratory and reported as
such. Exploratory findings are hypotheses for the next study, not conclusions of
this one.

## Sample size

State the basis: a power calculation (effect size assumed, alpha, power, test),
or a precision target (CI width), or a resource constraint with its consequence
stated. A study powered for a large effect cannot conclude "no effect" for a
small one; say so.

## Bias checklist before you start

- [ ] Selection: who enters the study, and does that differ from the target population?
- [ ] Measurement: is the instrument or rater consistent across groups?
- [ ] Attrition: is dropout related to the outcome?
- [ ] Confounding: what else moves with the treatment?
- [ ] Order/carryover: does the sequence of conditions matter?
- [ ] Multiplicity: how many outcomes and comparisons will be tested?
