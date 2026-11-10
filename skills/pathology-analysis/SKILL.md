---
name: pathology-analysis
description: Analyze histopathology and tissue images — whole-slide imaging, tissue detection, nuclei segmentation, staining quantification, and spatial analysis. Use for digital pathology research.
category: biology
tags: [pathology, wsi, histology, ihc, tissue, digital-pathology]
disable-model-invocation: true
---

# Pathology Analysis

Whole-slide images are enormous, multi-scale, and stained. Analysis must respect
the tissue hierarchy (slide → region → cell), the stain variability, and the
fact that a pathologist's annotation is the reference standard.

## Data handling

```python
import openslide
slide = openslide.OpenSlide("slide.svs")
level = 0  # or a downsampled level
region = slide.read_region((x, y), level, (w, h))  # RGBA PIL image
mpp = slide.properties.get("openslide.mpp-x")       # microns per pixel
```

**Always record mpp.** Cell-size and morphometry claims are meaningless without
the physical scale.

## Tissue detection and tiling

- **Tissue mask** first (Otsu on saturation/value, or a trained classifier) to
  skip background.
- **Tiling at a fixed physical size** (e.g. 256×256 at 0.5 µm/px), not a fixed
  pixel count — different scanners have different mpp.
- **Exclude artifacts:** pen marks, folds, blur, bubbles. A QC classifier is
  standard practice.

## Stain handling

- **Stain normalization** (Macenko, Reinhard, Vahadane) across slides or
  scanners; state the method and the reference slide.
- **H&E vs IHC:** IHC quantification needs a chromogen-specific method (DAB
  optical density) and a positive/negative control on the slide.
- **H-score / Allred / % positive cells** — state which, and how positivity is
  thresholded.

## Nuclei and cells

- **Segmentation:** HoVer-Net, Cellpose, StarDist, or a U-Net trained on the
  tissue type. Validate on annotated regions.
- **Metrics:** detection F1, Dice for masks, and the split/merge rate. Report
  object-level performance, not only pixel overlap.
- **Classification:** cell type from morphology/markers; report the confusion
  matrix and the class imbalance handling.

## Spatial analysis

- **Spatial statistics:** Ripley's K, nearest-neighbor between cell types,
  spatial autocorrelation (Moran's I).
- **Tumor microenvironment:** cell-type neighborhoods, interaction scores.
- **Multiple regions per patient are nested.** The patient is n.

## Reference standard

- **Pathologist annotations** are the ground truth, and they are variable.
  Report inter-observer agreement where multiple annotators exist.
- **A model's output is not the reference.** Validating against another model's
  output is circular.

## Reporting

State: the scanner and mpp, the staining and the normalization method, the
tiling scheme and QC, the segmentation/classification method and its validation
metrics, the quantification method and thresholds, the number of slides and
patients, the annotation protocol and its agreement, and the statistical unit
(patient, not tile).

## Common errors

- n = tiles when n = patients.
- Stain variation across batches unaddressed.
- No physical scale (mpp) recorded.
- Validation on regions used to tune the pipeline.
- Pixel Dice reported for a cell-count question.
