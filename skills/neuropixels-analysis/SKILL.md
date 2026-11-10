---
name: neuropixels-analysis
description: Analyze Neuropixels electrophysiology — loading, preprocessing, spike sorting, quality metrics, and curation. Use for extracellular recording data from Neuropixels 1.0/2.0 probes.
category: biology
tags: [neuropixels, ephys, spike-sorting, kilosort, neurons]
disable-model-invocation: true
---

# Neuropixels Analysis

Neuropixels data is high-density extracellular recording. The chain from raw
data to a unit's firing rate has many steps, each of which can change the
answer; the sorting quality determines what the analysis can even claim.

## The pipeline

```
raw (SpikeGLX/OpenEphys/Neuropixels) → preprocessing (filter, CMR, motion)
  → spike sorting (Kilosort4) → quality metrics (SpikeInterface)
  → curation (Allen/IBL criteria) → analysis (rates, tuning, coupling)
```

## Loading

```python
import spikeinterface.full as si

recording = si.read_spikeglx("session_g0", stream_id="imec0.ap")
print(recording)            # channels, sampling rate, duration
```

Record: probe model (1.0/2.0), shank, sampling rate (30 kHz), the acquisition
software and version, and the geometry (channel positions).

## Preprocessing

- **Bandpass filter** 300–6000 Hz for spikes (state the filter).
- **Common median reference** or destriping for high-density probes.
- **Motion correction** (for chronic/long recordings): Kilosort4 or
  `motion_correction` in SpikeInterface. Record the displacement trace.
- **Bad channel detection** and removal; record which were removed.

## Spike sorting

- **Kilosort4** is the current default; state the version and its parameters
  (threshold, nearest templates, etc.).
- **Run quality metrics before trusting units:** `SpikeInterface` quality metrics
  — SNR, ISI violation ratio, amplitude cutoff, presence ratio, drift.

## Quality and curation

Use **Allen/IBL-style criteria**:

| Metric | Typical threshold |
|---|---|
| ISI violations | < 0.5 (refractory period contamination) |
| Amplitude cutoff | < 0.1 |
| Presence ratio | > 0.9 |
| SNR | > 3 |
| Drift | minimal displacement over the recording |

**Report the counts at each filter step** — total units, well-isolated units,
single units. The unit quality is the sample size for anything you claim.

## Analysis

- **Firing rates:** baseline and evoked; report the time window and the
  normalization.
- **Tuning:** PSTHs with confidence bands; the unit is the neuron, but the
  replicate is the animal/session.
- **Spike-LFP coupling:** phase-locking value with the surrogate control.
- **Population:** decoding, dimensionality reduction, with cross-validation.

## Statistical unit

**Neurons are not independent replicates.** The animal/session is n. Report
per-animal summaries and test across animals. Nested-neuron analyses must use
mixed models or per-animal aggregation.

## Reporting

State: the probe and acquisition configuration, the preprocessing chain and
its parameters, the sorter and version with its parameters, the quality metrics
and the curation criteria with counts at each step, the motion correction, the
number of animals/sessions/units, and the statistical unit used for each claim.

## Common errors

- n = neurons when n = animals.
- Units included without quality filtering.
- No motion correction on long recordings.
- Firing rate windows not stated.
- Sorting quality differences across conditions mistaken for a biological effect.
