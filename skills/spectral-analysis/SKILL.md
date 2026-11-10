---
name: spectral-analysis
description: Analyze signals and data in the frequency domain — FFT, power spectra, spectral density, windowing, and filtering. Use for any time series or signal where frequency content matters.
category: physics
tags: [fft, spectrum, signal-processing, frequency, filtering]
disable-model-invocation: true
---

# Spectral Analysis

A spectrum answers "what frequencies are present and how strongly." Getting the
answer right requires the correct normalization, windowing, and an honest
treatment of resolution.

## The basics

```python
import numpy as np
from scipy import signal

# One-sided power spectral density
f, Pxx = signal.welch(x, fs=fs, nperseg=1024, noverlap=512, window="hann")
plt.semilogy(f, Pxx); plt.xlabel("Frequency (Hz)"); plt.ylabel("PSD (V²/Hz)")
```

**State the normalization.** PSD (per Hz) vs power spectrum (per bin) differ by
the bin width. A figure without units on the y-axis is uninterpretable.

## Windowing

A finite sample truncates the signal; the truncation is a multiplication by a
window in time, which convolves the spectrum with the window's transform. That
is **spectral leakage**.

- **Rectangular** (no window): best frequency resolution, worst leakage.
- **Hann/Hamming:** good leakage suppression, wider main lobe.
- **Flat-top:** accurate amplitude, poor resolution — use for amplitude accuracy.
- **Kaiser, Blackman-Harris:** tunable leakage tradeoffs.

**Zero-padding** interpolates the spectrum; it does not improve resolution. The
resolution is set by the record length: `Δf ≈ 1/T`.

## Frequency resolution and aliasing

- **Resolution:** `Δf = 1/T_record`. Two frequencies closer than this cannot be
  distinguished. Report T.
- **Nyquist:** frequencies above `fs/2` alias into the baseband. Anti-alias
  filter before sampling; state that you did.
- **The number of independent frequency bins** (not the FFT length) determines
  the variance of the spectral estimate. Welch's method trades resolution for
  reduced variance; report the segment length and overlap.

## Spectral estimation methods

| Method | Use |
|---|---|
| Periodogram | Quick look; noisy (variance does not decrease with N) |
| Welch | Default; averaged segments, controlled variance |
| Multitaper (DPSS) | Low leakage, controlled variance, good for short records |
| Lomb-Scargle | Unevenly sampled data |
| Parametric (AR, MUSIC) | High resolution on short records; model-dependent |

## Non-stationarity

If the spectrum changes over time, a single FFT averages over the change and
shows nothing:

- **Spectrogram** (short-time FFT) for the time-frequency picture.
- **Wavelets** for multi-scale, non-stationary structure.
- **Empirical mode decomposition** for non-linear, non-stationary signals.

State the window length and its consequence for time vs frequency resolution
(the uncertainty principle `Δt·Δf ≥ 1/(4π)` is not a suggestion).

## Filtering

- **State the filter type** (FIR/IIR), order, cutoff, and zero-phase (filtfilt)
  or causal.
- **filtfilt doubles the effective order** and is non-causal; report it as such.
- **Edge effects:** filter artifacts near the record boundaries; trim or pad.
- **A filter changes the data.** Report the filter alongside the result.

## Reporting

State: sampling rate, record length, window, segment length and overlap (Welch),
normalization (PSD vs power), resolution Δf, any filtering, and the confidence
interval on the spectral estimate (chi-square with the stated DOF).
