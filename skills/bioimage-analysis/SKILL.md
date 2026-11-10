---
name: bioimage-analysis
description: Analyze biological microscopy images — segmentation, tracking, colocalization, morphometry, and quantitative imaging. Use for microscopy, fluorescence, and image-based assays.
category: biology
tags: [bioimage, microscopy, segmentation, tracking, quantification]
disable-model-invocation: true
---

# Bioimage Analysis

Image analysis is quantitative measurement. The pipeline — from raw pixels to
the reported number — must be documented and validated against ground truth.

## The pipeline

```
raw images → preprocessing (background, flat-field) → segmentation
  → object classification/filtering → measurement → per-sample summary → statistics
```

## Preprocessing

- **Background subtraction** (rolling ball, flat-field correction) — state the
  method and its radius/kernel.
- **Deconvolution** where the PSF is known; state the PSF and iterations.
- **Do not denoise before measuring intensity** unless the denoising is
  calibrated — smoothing changes intensity measurements.

## Segmentation

| Method | Use |
|---|---|
| Threshold (Otsu, adaptive) | Simple, bright objects on dark background |
| StarDist / Cellpose | Nuclei and cells; generalizes across images |
| ilastik | Interactive, small training sets |
| U-Net / custom | Complex or modality-specific |
| Watershed | Touching objects after a marker step |

**Validate against ground truth.** Report Dice, Jaccard, object-level F1
(detection), and split/merge errors. Pixel Dice hides object-count errors.

## Object measurement

- **Morphometry:** area, perimeter, circularity, eccentricity, Feret diameter.
- **Intensity:** mean, max, integrated (corrects for size), normalized to a
  control.
- **Colocalization:** Pearson's r (covariation), Manders' M1/M2 (fractional
  overlap). **Manders with thresholding**, and state the threshold method. A
  high Pearson in a dense cell is not evidence of interaction.
- **Spatial:** nearest-neighbor distances, Ripley's K for clustering.

## Tracking

- **Linking cost** (distance, appearance) and the algorithm (LAP, trackpy,
  TrackMate) stated.
- **Report track quality:** number of gaps, mean track length, the fraction of
  objects tracked.
- **Motility metrics:** mean squared displacement, velocity, persistence — with
  the time step and the localization error considered.

## Reproducibility

- **The pipeline is a script** with parameters saved. Thresholds set by hand on
  one image and applied to a batch are a batch artifact waiting to happen.
- **Batch:** apply the same parameters across conditions; randomize processing
  order.
- **Blind the analysis** to condition where feasible.
- **Positive and negative control images** processed alongside.

## Statistical unit

The **field of view is not n.** Objects within one well/animal are nested.
Summarize to the well/animal level and test across wells/animals. Report n at
the level of the claim.

## Reporting

State: the imaging modality and settings, the preprocessing steps, the
segmentation method and its validation metrics, the object filters, the measured
parameters and their definitions, the colocalization method and threshold, the
per-sample summarization, the number of independent samples, and the statistical
test.

## Common errors

- n = objects when n = animals/wells.
- Intensity measured after smoothing.
- Colocalization claimed from Pearson's r alone.
- Hand-tuned thresholds not saved with the analysis.
- Segmentation validated on the same images used to tune it.
