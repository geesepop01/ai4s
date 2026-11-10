---
name: model-interpretability
description: Interpret and explain model behavior — feature attribution, probing, mechanistic analysis, and failure analysis. Use when a model's decisions must be explained or audited.
category: ml
tags: [interpretability, xai, shap, attention, explanations]
disable-model-invocation: true
---

# Model Interpretability

Explanation methods are themselves models of the model. They have assumptions,
and they can be wrong. Use them as diagnostics, not as proof.

## Methods

| Method | What it gives | Caveat |
|---|---|---|
| SHAP | Feature attributions | Assumes feature independence (KernelSHAP) |
| LIME | Local surrogate | Unstable; depends on the neighborhood |
| Integrated Gradients | Attribution for deep nets | Baseline-dependent |
| Attention weights | Where the model "looks" | Attention is not explanation |
| Probing | What a representation encodes | Correlation, not causation |
| Activation patching | Causal role of a component | Requires careful design |
| Counterfactuals | What would change the output | Plausibility of the counterfactual |

## Feature attribution

```python
import shap
explainer = shap.Explainer(model, X_train)
shap_values = explainer(X_test)
shap.plots.waterfall(shap_values[0])
```

- **Global vs local.** A global feature importance is not a per-instance
  explanation.
- **Correlated features** split or mask each other's importance; interpret
  accordingly.
- **Stability:** run with different seeds/backgrounds; unstable attributions are
  not findings.

## Probing and mechanistic

- **Probes** test what is decodable from a representation; a successful probe
  does not mean the model uses it.
- **Causal interventions** (activation patching, ablation) are stronger than
  correlation-based probes.
- **Report the intervention and its control.**

## Failure analysis

Often more useful than explanation:

- **Slice the errors** by category, difficulty, subgroup. The pattern is the
  finding.
- **Counterfactual testing:** change one thing and see if the output changes
  as it should.
- **Out-of-distribution** behavior: does the model degrade gracefully?
- **Adversarial probing:** minimal perturbations that flip the output.

## Reporting

State: the explanation method and its assumptions, the baseline/background used,
the stability across seeds/parameters, the difference between correlation and
causal evidence, the failure slices examined, and the conclusion framed as a
hypothesis about the model, not a proof.

## Anti-patterns

- Treating attention weights as explanations.
- Reporting SHAP values for correlated features without the caveat.
- One local explanation presented as the model's general behavior.
- Explanation without a stability or control check.
