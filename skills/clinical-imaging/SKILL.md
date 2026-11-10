---
name: clinical-imaging
description: Analyze clinical medical images — X-ray, CT, MRI, ultrasound, and pathology. Use for image-based clinical research, DICOM handling, and radiological analysis.
category: medicine
tags: [medical-imaging, dicom, radiology, mri, ct, xray]
disable-model-invocation: true
---

# Clinical Imaging

Clinical images carry metadata, modality physics, and clinical context. An
image analysis that ignores them produces confident nonsense.

## The data hierarchy

```
DICOM study
  └── series (one acquisition protocol)
       └── instances (slices/frames) with headers
            └── pixel data + rescale slope/intercept
```

**Never analyze pixel values without the header.** The header carries the
modality, the rescale transform (stored values are not Hounsfield units or
real intensity), the orientation (ImageOrientationPatient), the spacing, and
the acquisition parameters.

## Modality specifics

| Modality | Units after rescale | Key considerations |
|---|---|---|
| CT | Hounsfield units (HU) | Windowing is display, not data; air ≈ -1000, water = 0 |
| MRI | arbitrary (sequence-dependent) | No absolute scale; normalization is required and must be stated |
| X-ray | arbitrary | Projection geometry; exposure metadata |
| Ultrasound | arbitrary (dB for spectral) | Operator-dependent; gain affects intensity |
| Pathology | RGB (stain-dependent) | Stain normalization; magnification in metadata |

**MRI intensity is not standardized.** A value of 500 means nothing across
scanners without normalization. State the normalization.

## Handling

```python
import nibabel as nib
import pydicom

# NIfTI (research format)
img = nib.load("sub-01_T1w.nii.gz")
data = img.get_fdata()          # already in real-world units if rescaled
affine = img.affine             # voxel → world
voxel_sizes = img.header.get_zooms()

# DICOM
ds = pydicom.dcmread("slice.dcm")
hu = ds.pixel_array * ds.RescaleSlope + ds.RescaleIntercept
orientation = ds.ImageOrientationPatient
```

**Orientation matters.** RAS/LPS conventions differ between formats; a
left-right flip is the classic silent bug. Use the affine, never assume array
order.

## Registration and segmentation

- **Registration:** state the transform (rigid/affine/nonlinear), the metric
  (mutual information, cross-correlation), and the validation (target
  registration error on landmarks). A registration without a TRE is unverified.
- **Segmentation:** report the metric against the reference (Dice, Hausdorff
  distance, surface distance), **and** the failure cases. Dice alone hides
  boundary errors that matter clinically.

## Deep learning on clinical images

- **Splits by patient, never by slice.** Slices from one scan in train and test
  is leakage that inflates performance catastrophically.
- **Site/scanner generalization** is the real test. A model that works on one
  scanner is not a model.
- **Report per-subgroup performance** (scanner, site, sex, age, pathology
  prevalence).
- **Calibration** matters when the output is a probability used clinically.
- **Reader study** for any claim that the tool helps radiologists, not just
  model-vs-model metrics.

## Reporting

State: the modality and its preprocessing (rescale, normalization, registration),
the voxel spacing and orientation convention, the cohort and its selection, the
split unit (patient), the reference standard and who established it, the metrics
with their definitions, the failure modes, and the generalization limits (sites,
scanners, populations).

## Common errors

- Analyzing stored pixel values as if they were physical units.
- Slice-level splits inflating performance.
- Left-right flips from ignored orientation metadata.
- MRI intensity compared across scanners without normalization.
- Dice reported without boundary metrics for a segmentation whose boundary is
  the clinical question.
