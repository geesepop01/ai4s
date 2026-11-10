---
name: get-available-resources
description: Inventory the compute, data, tools, and credentials actually available before planning work. Use at project start or whenever a plan depends on resources whose availability is unknown.
category: core
tags: [resources, environment, inventory, planning, capabilities]
disable-model-invocation: true
---

# Get Available Resources

Planning around a resource that does not exist wastes the run. This skill is the
inventory pass: what is actually here, before deciding what to do.

## The inventory

```markdown
# Available resources — as of <date>

## Compute
- CPU: <count, architecture>
- RAM: <total, available>
- GPU: <model, VRAM, count> — from `nvidia-smi`, or "none"
- Disk: <free space on each relevant mount>
- OS and version
- Python/R/Node versions and environments

## Data (local)
- Datasets present: <path, size, file count, format>
- Data not present but referenced: <list, with source>
- Permissions: <read-only / writable / restricted>

## Tools
- Installed scientific stack: <torch, scanpy, rdkit, mne, nibabel, ... — verified
  by import, not by assumption>
- External tools on PATH: <samtools, bcftools, plink, slurm, ...>
- Missing tools required by the plan: <list>

## Credentials and access
- Configured: <which services — do NOT record the secrets themselves>
- Missing: <which services the plan needs and cannot reach>

## Remote / compute targets
- SSH hosts reachable: <test result>
- Scheduler present: <slurm/pbs/none>
- Cloud profiles: <configured or not>
```

## How to check, not assume

```bash
nproc; free -h; df -h
nvidia-smi || echo "no GPU"
python -c "import torch; print(torch.__version__, torch.cuda.is_available())"
python -c "import scanpy, rdkit, mne, nibabel" 2>&1 | tail -3
which samtools bcftools plink sbatch || true
ssh -o BatchMode=yes -o ConnectTimeout=5 remote true && echo "ssh OK"
```

**Every availability claim in a plan comes from one of these checks**, with the
check recorded. "PyTorch should be installed" is not an inventory.

## What to do with gaps

A gap is a planning input, not a blocker by default:

- **Missing package:** install (with permission) or substitute. State the
  substitution and its consequences.
- **Missing data:** locate the source, size the download, request access if
  needed, or scope the analysis to what exists and say so.
- **Missing compute:** re-scope to what fits, or plan the dispatch and its cost
  for approval.
- **Missing credential:** request it, or route around it with an alternative
  source, and record that the alternative was used.

Every gap goes into the plan's risks section with its mitigation.

## Refresh triggers

Re-run the inventory when:

- Moving to a different machine or environment.
- After installing a new toolchain (verify it actually imports/links).
- Before a run whose size depends on available memory or disk.
- When a run fails in a way that suggests the environment is not what was assumed.

## Recording

Save as `resources-<date>.md` in the project. The plan cites it. A plan that
depends on GPU hours, a specific package version, or a dataset's presence names
the inventory line that establishes it.
