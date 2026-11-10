---
name: brenda-database
description: Query BRENDA for enzyme kinetic parameters, reactions, and organism-specific data. Use for enzyme kinetics, metabolic modeling, and biochemical characterization.
category: databases
tags: [brenda, enzymes, kinetics, kcat, km, biochemistry]
disable-model-invocation: true
---

# BRENDA

BRENDA is the reference for enzyme kinetic data: Km, kcat, Ki, substrates,
inhibitors, and organisms. Its data is extracted from literature, and values for
the same enzyme vary enormously across studies.

## Access

```python
import requests

# SOAP (BRENDA's documented interface)
# https://www.brenda-enzymes.org/information.php for access details
# REST endpoints at https://www.brenda-enzymes.org/brenda-website/brenda-rest/
```

BRENDA's API access requires registration for heavy use. Record the access route
and date.

## Kinetic parameters

| Parameter | Meaning | Typical trap |
|---|---|---|
| Km | Substrate concentration at half Vmax | Varies with conditions, not a constant |
| kcat | Turnover number (s⁻¹) | Depends on active enzyme concentration |
| kcat/Km | Catalytic efficiency | The most comparable parameter |
| Ki | Inhibition constant | Mechanism-dependent (competitive, uncompetitive...) |
| Vmax | Maximum rate | Depends on enzyme concentration |

**kcat/Km is the most robust comparison across studies** because it normalizes
enzyme concentration.

## Conditionality

Kinetic parameters are **condition-dependent**:

- **Temperature, pH, buffer, cofactors** change Km and kcat substantially.
- **The measurement method** (steady-state vs pre-steady-state) gives different
  numbers.
- **Enzyme source (organism, isoform)** matters; a human enzyme's kinetics are
  not the E. coli enzyme's.

**Always report the conditions with the value.** A parameter without its
conditions is not transferable.

## The parameter spread

For a given enzyme, BRENDA lists values from many publications. The spread can
be 10-fold or more. Report:

- The number of measurements.
- The median and the range.
- The source studies for the values you use.

**Do not quote a single value as "the" Km.** Quote the value with its source and
the conditions.

## Metabolic modeling

For FBA or kinetic models:

- **Use kcat (or a proxy) for Vmax** in enzyme-constrained models; state the
  source and the uncertainty.
- **Missing parameters** are common; state how they were imputed (e.g. from a
  homolog, or a typical value) and its effect.
- **Parameter uncertainty propagates.** A model fitted to point estimates
  without uncertainty is overconfident.

## Reporting

State: the enzyme (EC number) and its organism/source, the parameter with its
conditions (temperature, pH, buffer), the measurement method, the number of
measurements and their spread, the source publications for the values used, and
the imputation method for any missing parameter.

## Anti-patterns

- Quoting a single Km as a constant.
- Mixing parameters from different organisms or conditions without saying so.
- Using kinetic parameters in a model without propagating their uncertainty.
- Ignoring the measurement method's effect on the value.
