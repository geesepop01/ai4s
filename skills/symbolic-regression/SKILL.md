---
name: symbolic-regression
description: Discover compact symbolic equations from data with PySR or similar tools. Use when the goal is an interpretable closed-form expression rather than a black-box fit.
category: physics
tags: [symbolic-regression, pysr, equations, discovery, interpretable]
disable-model-invocation: true
---

# Symbolic Regression

Symbolic regression searches the space of expressions for one that fits the data
and is simple enough to read. Its output is an equation — which is a hypothesis,
not just a prediction.

## When it is right

- The relationship is expected to be a **law-like expression** (scaling, power
  law, conservation-derived form).
- **Interpretability matters** more than raw accuracy.
- You want to **test whether a compact form exists** in the data.
- The number of features is modest (2–10) and the data is clean.

When it is wrong: high-dimensional data, noisy labels with no underlying simple
form, or when prediction accuracy is the only goal (use a standard model).

## PySR

```python
from pysr import PySRRegressor

model = PySRRegressor(
    niterations=100,
    populations=30,
    binary_operators=["+", "-", "*", "/", "^"],
    unary_operators=["exp", "log", "sqrt", "sin"],
    constraints={"^": (-1, 1)},          # limit operator complexity
    parsimony=0.003,                      # complexity penalty
    maxsize=30,
    random_state=42,
)
model.fit(X, y)

print(model)                # ranked equations
print(model.sympy())        # best expression in SymPy
print(model.equations_)     # full Pareto front: accuracy vs complexity
```

## The Pareto front is the result

Do not report only the most accurate equation. The **Pareto front** — accuracy
versus complexity — is the finding:

```
complexity  loss     equation
     3      0.21     2.1 * x
     7      0.08     2.1 * x + 0.3 * x**2
    12      0.031    2.05 * x + 0.31 * x**2 - 0.02 * x**3
```

Report the front and let the reader see the tradeoff. The knee is usually the
right choice, and it is often not the most complex equation.

## Validating a discovered equation

1. **Dimensional check first** (`dimensional-analysis`). A great fit with wrong
   dimensions is a coincidence.
2. **Behavior at limits.** Does it behave correctly as x → 0, x → ∞, at
   boundaries? Extrapolation failure is where symbolic forms lie.
3. **Residual structure.** Plot residuals against inputs; structure means the
   form is missing something.
4. **Holdout.** Fit on training data, evaluate the expression on held-out data.
   Symbolic regression overfits like any search.
5. **Stability across seeds.** Rerun with different random seeds. If the
   equation changes form but fits similarly, the data does not determine the
   form.
6. **Compare to the known physics.** If the domain has a known form, does the
   discovered equation reduce to it?

## Pitfalls

- **Over-interpreting noise.** A discovered equation over noisy data can encode
  the noise. Check stability and holdout.
- **Operator overfitting.** An expression using `sin` when the phenomenon is
  not periodic is fitting artifacts. Restrict the operator set to what the
  physics allows.
- **Units in the search.** Symbolic regression is not unit-aware; nondimensionalize
  before fitting and re-attach units after, verifying with dimensional analysis.
- **Confusing a fit with a law.** A compact expression that fits one dataset is
  a candidate; a law requires evidence across conditions.

## Reporting

Report: the operator set and constraints, the Pareto front, the chosen
expression with its complexity and loss, the holdout performance, the
dimensional consistency, the stability across seeds, and the range of data over
which the expression was fitted and validated.
