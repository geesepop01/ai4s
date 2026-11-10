---
name: time-series-forecasting
description: Forecast time series — decomposition, classical models, deep learning, and evaluation with temporal splits. Use for any forecasting problem where the future is what matters.
category: ml
tags: [time-series, forecasting, arima, temporal, prediction]
disable-model-invocation: true
---

# Time Series Forecasting

Forecasting is evaluated on the future. Every split, feature, and model choice
must respect temporal order, or the result is a lookahead artifact.

## The discipline

1. **Temporal split.** Train on the past, validate on the near future, test on
   the later future. **Never random-split a time series.**
2. **Features must be available at prediction time.** A feature computed from
   the future is leakage.
3. **Compare against baselines:** naive (last value), seasonal naive, drift.
   A complex model that cannot beat seasonal naive has not learned anything.

## Decomposition and analysis

- **Trend, seasonality, residual** (STL decomposition).
- **Stationarity** (ADF, KPSS); difference if needed.
- **Autocorrelation / partial autocorrelation** to identify the structure.
- **Seasonality** at the relevant periods (daily, weekly, annual).

## Models

| Model | Use |
|---|---|
| Naive / seasonal naive | Baseline, often hard to beat |
| Exponential smoothing (ETS) | Trend + seasonality |
| ARIMA / SARIMA | Linear, interpretable |
| Prophet | Multiple seasonalities, holidays |
| XGBoost/LightGBM on lags | Strong with exogenous features |
| DeepAR / Temporal Fusion Transformer | Multivariate, many series |
| N-BEATS / PatchTST | Pure forecasting, strong benchmarks |

## Evaluation

- **Metrics:** MAE, RMSE, MAPE (careful with zeros), sMAPE, MASE, CRPS for
  probabilistic forecasts.
- **MASE < 1** means better than the seasonal naive; report it.
- **Rolling-origin evaluation** (walk-forward), not one split.
- **Probabilistic forecasts:** report calibration (coverage of prediction
  intervals), not only point accuracy.

## Uncertainty

- **Prediction intervals** are what make a forecast useful. Report coverage at
  50%, 80%, 95%.
- **Conformal prediction** for distribution-free intervals.
- **The interval must widen with horizon.** A constant-width interval is wrong.

## Common failures

- Random splits producing lookahead leakage.
- Features computed from the full series (e.g. global normalization).
- No baseline comparison.
- MAPE reported on data containing zeros.
- Point forecasts without intervals.

## Reporting

State: the series, its frequency, and the forecast horizon, the temporal split
and the rolling evaluation scheme, the features and their availability at
prediction time, the models compared and the baselines, the metrics with the
baseline values, the prediction interval coverage, and the domain constraints
(e.g. non-negativity).

## Anti-patterns

- Random train/test split.
- Reporting only MAPE.
- Claiming improvement over a model without the naive baseline.
- Evaluation on a single horizon.
