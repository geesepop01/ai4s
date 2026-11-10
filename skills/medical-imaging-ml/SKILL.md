---
name: medical-imaging-ml
description: Build ML models for medical images — data handling, segmentation, classification, validation, and regulatory considerations. Use for clinical imaging AI with proper validation.
category: ml
tags: [medical-imaging, segmentation, classification, deep-learning, clinical-ai]
disable-model-invocation: true
---

# Medical Imaging ML

Medical imaging models are clinical instruments. The validation must match the
deployment condition, and the failure modes must be understood before the model
sees a patient.

## Data

- **Split by patient, never by slice or image.** Slices from one scan in train
  and test is leakage that inflates performance catastrophically.
- **Site/scanner variation** is the dominant generalization challenge. Test
  across sites.
- **Label provenance:** who annotated, how, and with what agreement. The
  reference standard is the ceiling on measured performance.
- **Preprocessing** (resizing, normalization, windowing) recorded; CT windowing
  is a data transformation, not a display choice.

## Tasks

| Task | Model | Metric |
|---|---|---|
| Segmentation | U-Net, nnU-Net, TransUNet | Dice, Hausdorff, surface distance |
| Classification | ResNet, EfficientNet, ViT | AUROC, AUPRC, calibration |
| Detection | Faster R-CNN, RetinaNet | Sensitivity at FP/scan |
| Registration | VoxelMorph, Elastix | TRE |
| Generation | GAN, diffusion | FID + clinical validity |

**nnU-Net** is the strong baseline for segmentation; beat it before claiming a
novel architecture.

## Validation

- **Internal** (cross-validation) is not enough. **External validation** on a
  different site/scanner is the standard for any deployment claim.
- **Temporal validation** (train earlier, test later) before prospective use.
- **Prospective silent deployment** before influencing care.
- **Reader study** for claims that the tool helps clinicians; model-vs-model
  metrics do not establish clinical value.

## Metrics that matter clinically

- **Sensitivity at a fixed false-positive rate** (screening).
- **Calibration** (does a 30% risk mean 30%?).
- **Subgroup performance** (sex, age, site, ethnicity, device).
- **Failure case analysis** — where and why it fails.

## Deployment considerations

- **Out-of-distribution detection.** The model should refuse rather than
  extrapolate.
- **Inference time and hardware** for the clinical setting.
- **Monitoring** for drift after deployment.
- **Regulatory** status (FDA/CE) is a legal determination; this skill does not
  make it.

## Reporting

State: the cohort and its selection, the split unit (patient), the preprocessing,
the architecture and its parameter count, the training and augmentation, the
validation scheme (internal/external/temporal), the metrics with CIs, the
calibration and subgroup table, the failure analysis, and the deployment
boundary.

## Anti-patterns

- Slice-level splits.
- No external validation for a deployment claim.
- Dice reported for a classification question.
- No calibration or subgroup analysis.
- A model evaluated only against another model's labels.
