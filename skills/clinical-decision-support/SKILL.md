---
name: clinical-decision-support
description: Build and evaluate clinical decision support tools with evidence grading, safety analysis, and appropriate validation. Use for clinical prediction, triage, or diagnostic support systems.
category: medicine
tags: [clinical, decision-support, prediction, safety, validation]
disable-model-invocation: true
---

# Clinical Decision Support

A clinical decision support tool affects patients. The bar is not "the model
performs well" but "the tool helps clinicians and does not harm."

## Framing

State the exact decision the tool supports and who makes it:

```markdown
Decision: <what clinical action, by whom, at what point in the workflow>
Population: <who the tool applies to, explicitly>
Action threshold: <what output triggers what action>
Comparator: <what the clinician does without the tool>
Harm model: <what failure modes cause harm, and how they are detected>
```

**A prediction is not a decision.** The tool predicts a risk; the clinician
decides. The tool's output is one input to that decision.

## Development discipline

- **Target population matches the training population**, and the difference is
  stated. A model trained on adults is not validated for children because the
  AUC is similar.
- **Outcome definition is precise and clinically meaningful**, not a proxy chosen
  for convenience. "ICU admission within 24h" is not "deterioration."
- **Predictors are available at the time of prediction.** A model that uses
  information documented after the decision point is leakage, even if the
  timestamps look fine.
- **Pre-specify** the model, the predictors, and the evaluation before fitting.

## Evaluation

| Metric | Why it matters clinically |
|---|---|
| Discrimination (AUROC) | Ranking ability; necessary but insufficient |
| Calibration | Do predicted risks match observed rates? Clinicians act on risk, not rank |
| Sensitivity/Specificity at the action threshold | What the tool actually does |
| PPV/NPV at prevalence | The false-alarm burden on the ward |
| Decision curve analysis | Net benefit vs treat-all/treat-none across thresholds |
| Subgroup performance | Does it work equally across sex, age, ethnicity, site? |

**Calibration is the metric most often skipped and most consequential.** A model
can have excellent AUROC and be dangerously miscalibrated.

## Validation

- **Temporal validation** (train on earlier, test on later) before any
  prospective use. Random splits overestimate performance.
- **External validation** on a different site or population. Internal validation
  is not enough for deployment claims.
- **Prospective silent deployment** before the tool influences care: run it live
  without showing output, measure real performance.
- **Impact study** before claiming benefit: does the tool change decisions and
  outcomes, not just predictions?

## Safety

- **Failure modes are identified before deployment**: what happens when the
  input is missing, wrong, or out of distribution?
- **Out-of-distribution detection.** A tool should say "I don't know" rather
  than extrapolate silently.
- **Human override** is always available and is the default path.
- **Monitoring** after deployment: performance drift, alert fatigue, subgroup
  disparities.
- **Regulatory status** stated: is this a medical device in the relevant
  jurisdiction? This skill does not make that determination; counsel does.

## Reporting

Follow TRIPOD+AI for prediction models, CONSORT-AI for trials of AI
interventions, DECIDE-AI for early-stage clinical evaluation. Report the
calibration plot, the decision curve, the subgroup table, and the limitations
with the deployment boundary stated.

## Anti-patterns

- Reporting AUROC alone.
- A random split presented as validation.
- Calling a tool "validated" after internal cross-validation.
- Silent extrapolation outside the training distribution.
- Evaluating on data where the outcome is defined using post-decision information.
