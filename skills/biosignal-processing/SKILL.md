---
name: biosignal-processing
description: Process and analyze physiological signals — audio, heart sounds, respiratory sounds, ECG, PPG, and accelerometry. Use for any biosignal where the preprocessing determines the result.
category: biology
tags: [biosignals, audio, ecg, ppg, respiratory, signal-processing]
disable-model-invocation: true
---

# Biosignal Processing

Biosignals are noisy, physiological, and modality-specific. The preprocessing
chain is the analysis: a feature computed on badly filtered data is a feature of
the artifact.

## General discipline

1. **Record the acquisition:** device, sampling rate, bit depth, sensor
   placement, room/setting (clinic vs home).
2. **State the full preprocessing chain** with parameters — every filter changes
   the data.
3. **Artifact handling is explicit:** what was removed, how, and how much.
4. **Validate the preprocessing** against a known case or a hand-annotated
   segment.

## Audio (cough, speech, cry)

- **Loading:** resample to a declared rate (16 kHz for speech, 22.05/44.1 for
  audio tasks); state the resampling method.
- **Pre-emphasis / DC removal / silence trimming** stated.
- **Spectrograms:** n_fft, hop length, mel bins, dB scale. These parameters
  define what the model sees; report them.
- **Features:** MFCCs (n coefficients), mel-spectrogram, chroma, spectral
  centroid/rolloff/flux, zero-crossing rate, jitter/shimmer for voice.
- **Segmentation:** cough/event detection has its own error rate; report it if
  the analysis depends on it.
- **Recording conditions matter more than features** for generalization: device,
  room, distance, language. Report the distribution and test across sites.

## Heart sounds (phonocardiography, PCG)

- **Band-pass** 25–200 Hz typical; state the band.
- **S1/S2 detection** drives segmentation; report its accuracy on annotated
  data.
- **Systole/diastole duration**, S3/S4 presence, murmurs — each needs its own
  detection validated against a cardiologist's annotation.
- **Frequency content:** murmurs are broadband; do not over-filter.

## Respiratory sounds

- **Band** 100–2000 Hz (wheeze, crackles); state the band.
- **Wheeze** is a continuous, tonal sound (spectral peak); **crackles** are
  transient (time-localized). Different features, different detectors.
- **Cycle segmentation** (inspiration/expiration) drives everything; report its
  accuracy.
- **Recording site** (tracheal vs chest) changes the spectrum completely.

## ECG

- **Baseline wander removal** (high-pass 0.5 Hz or median filter) and **powerline
  notch** — both stated.
- **R-peak detection** (Pan-Tompkins, NeuroKit) with the sensitivity and PPV
  against an annotated set (MIT-BIH standard).
- **HRV features:** time-domain (SDNN, RMSSD), frequency (LF/HF), nonlinear
  (sample entropy). State the segment length and the artifact handling — HRV is
  very sensitive to missed/extra beats.
- **Atrial fibrillation / ectopy** detection needs its own validated detector.

## PPG

- **Motion artifact** is the dominant problem; accelerometer regression or
  adaptive filtering, stated.
- **Peak detection** and pulse rate variability analogous to HRV.
- **SpO2 calibration** is device-specific; do not recompute SpO2 from raw
  without the calibration curve.

## Validation and reporting

State: the device and acquisition settings, the full preprocessing chain with
parameters, the artifact-removal criteria and the fraction removed, the feature
definitions with their parameters, the segmentation/detection method and its
accuracy against annotation, the number of subjects and recordings, and the
statistical unit (subject, not segment).

## Common errors

- Preprocessing parameters chosen after seeing the result.
- n = segments when n = subjects.
- Features computed on different sampling rates across the cohort.
- Recording device/site confounded with the class label.
- Detector accuracy not reported when the analysis depends on detection.
