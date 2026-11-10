---
name: eeg-analysis
description: Analyze EEG and electrophysiological signals — MNE-Python, preprocessing, artifact rejection, spectral analysis, ERPs, and source localization. Use for EEG, MEG, and related neural signals.
category: biology
tags: [eeg, meg, mne, erp, neuroscience, signal-processing]
disable-model-invocation: true
---

# EEG Analysis

EEG is a time series with reference, montage, artifacts, and a temporal
structure that the analysis must respect. An ERP measured on unrepaired data is
an artifact study.

## Data handling

```python
import mne
raw = mne.io.read_raw_edf("sub-01.edf", preload=True)
raw.set_montage("standard_1020")
raw.info["bads"] = ["Fp1"]            # mark bad channels
events = mne.find_events(raw)
```

**Record:** sampling rate, reference electrode, montage, electrode impedances,
filter settings at acquisition, and the task/event structure.

## Preprocessing (state the full chain)

1. **Filter:** high-pass 0.1–1 Hz (for ERP; 1 Hz shifts the ERP baseline),
   low-pass 30–40 Hz (for ERP) or 100 Hz (for high-gamma). Report the filter
   type, order, and transition bands.
2. **Re-reference:** common average, linked mastoids, or REST. The reference
   changes the data; state which and why.
3. **Bad channel interpolation** — from the marked bads, before ICA.
4. **ICA** for ocular/cardiac artifacts (ICA, FastICA, or AMICA). **Remove
   components based on objective criteria** (ICLabel, correlation with EOG/ECG),
   and report how many were removed and why. Blind component removal is
   unreproducible.
5. **Epoching:** baseline correction window stated; rejection thresholds
   (peak-to-peak, z-score) stated with the rejection rate per condition.

## ERP analysis

- **Baseline window** matters: a wrong baseline biases the amplitude. State it.
- **Component definition:** the time window and the electrode cluster, defined
   **a priori** or from independent data, not from the same data being tested.
- **Peak amplitude vs mean amplitude:** mean over a window is more robust; peak
   is noisier. State which.
- **Global field power / topographies** for the whole-scalp picture.

## Spectral analysis

See `spectral-analysis` for method detail. For EEG specifically:

- **Welch with the right parameters** (window length, overlap, tapers); report
  them.
- **Band definitions** are conventions (delta 1–4, theta 4–8, alpha 8–13, beta
  13–30, gamma 30–100) — state yours, especially for individual alpha frequency.
- **Power normalization:** dB relative to baseline, or log power; state which.
- **1/f aperiodic component:** separate the aperiodic exponent from band power
  (FOOOF/specparam); otherwise "increased gamma" may just be a steeper 1/f.

## Time-frequency

- **Morlet wavelets or multitaper.** Report cycles/width and the time-frequency
  smoothing.
- **Baseline normalization** in dB or percent change; the baseline window is
  stated.
- **Cluster-based permutation tests** for time-frequency maps with multiple
  comparisons.

## Source localization

- **Forward model** from an MRI and the electrode positions; state the head
  model (BEM, single shell).
- **Inverse method** (dSPM, sLORETA, eLORETA, beamformer) with its parameters.
- **Source estimates are model output, not measurement.** Report the method and
  the resolution limits.

## Statistics

- **The unit is the subject.** Trials within a subject are not independent.
- **Cluster-based permutation** for sensor/time-frequency maps (Maris &
  Oostenveld).
- **Mixed models** for trial-level designs with subject random effects.

## Reporting

State: the recording system and reference, the full preprocessing chain with
parameters and component-removal counts, the rejection rate per condition, the
baseline and windows, the component definitions and their justification, the
spectral/time-frequency parameters, the statistical unit and test, and the
number of subjects and trials retained.
