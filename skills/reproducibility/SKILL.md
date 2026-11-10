---
name: reproducibility
description: Research reproducibility practices. Use for seed control, environment capture, script manifests, provenance tracking, and making a result re-runnable by a third party who has only the artifacts.
category: research
tags: [reproducibility, seeds, provenance, manifest, environment, versioning]
---

# Reproducibility

## Overview

A result nobody else can re-run is an anecdote. This skill covers the minimum
machinery that makes computational work reproducible.

## The four pillars

1. **Determinism** — same inputs, same outputs, every time.
2. **Capture** — the exact environment and parameters are recorded, not remembered.
3. **Provenance** — every reported number traces back to the script that produced it.
4. **Portability** — a third party can reconstruct the run from artifacts alone.

## Seeds

Set every relevant generator, and record them.

```python
import os, random
import numpy as np

SEED = 42

random.seed(SEED)
np.random.seed(SEED)
os.environ["PYTHONHASHSEED"] = str(SEED)

try:
    import torch
    torch.manual_seed(SEED)
    torch.cuda.manual_seed_all(SEED)
    # Slower, and some ops have no deterministic kernel — enable deliberately.
    torch.use_deterministic_algorithms(True, warn_only=True)
except ImportError:
    pass
```

Record the seed in the output artifact, not just in the script. A seed you cannot
see is a seed you cannot reproduce.

**Run multiple seeds for any headline metric.** A single-seed result has no error
bar and cannot be distinguished from luck. Report mean ± std across seeds.

## Environment capture

```bash
python -m pip freeze > requirements.lock.txt
python --version > environment.txt
python -c "import platform, sys; print(platform.platform(), sys.version)" >> environment.txt
```

For conda, `conda env export --no-builds > environment.yml`. For a container,
record the image digest, not the tag — tags are mutable.

Capture GPU/driver state too when compute matters (`nvidia-smi` output saved to a file).

## Script manifest

Append one JSON line per script execution to `_script_manifest.jsonl`. This is
what makes every number traceable.

```python
import json, subprocess, sys, datetime, hashlib, pathlib

def log_run(script, args, outputs, notes=""):
    entry = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "script": str(script),
        "script_sha256": hashlib.sha256(pathlib.Path(script).read_bytes()).hexdigest(),
        "args": args,
        "python": sys.version.split()[0],
        "outputs": [str(p) for p in outputs],
        "notes": notes,
    }
    with open("_script_manifest.jsonl", "a", encoding="utf-8") as handle:
        handle.write(json.dumps(entry) + "\n")
    return entry
```

The hash matters: without it you cannot tell whether a re-run used the same code.

## Provenance for reported numbers

Every number in a report must answer three questions:

- **Which script** produced it, identified by hash.
- **Which output file** holds it.
- **Which command** regenerates it.

The number must come from a **saved script run end to end**, not from interpreter
state. Interactive exploration is fine; its conclusions are not the result. Name
the script beside the number in the write-up so a reader can point at both.

Keep raw outputs immutable. Write derived tables to new files rather than editing
raw ones in place — an edited raw output destroys the audit trail.

## The run-beside rule

Never delete or overwrite a data or result directory to make room for a rerun,
unless the user explicitly asks. A rerun writes **beside** the earlier result or
into a fresh directory:

```
results/
  2026-10-22_baseline/     # kept, not overwritten
  2026-10-22_seed7/        # new run goes beside it
```

When something fails midway, keep the partial results and state exactly what is
missing and why. A directory of partial output is more useful than an empty one
you deleted because the run did not finish.

## External data provenance

For anything fetched from a database or repository, record:

```
source:      UniProt REST
endpoint:    https://rest.uniprot.org/uniprotkb/search?query=TP53&format=json
retrieved:   2025-01-15T10:32:00Z
accession:   P04637
sha256:      <hash of the saved payload>
```

Save the raw payload to disk. Remote records change, get re-annotated, and
occasionally disappear — a result that depends on a live API is not reproducible.

## Data splitting

Splitting is a reproducibility concern, not only a leakage one.

- Fix the split **once** and persist it (`split.json`, or a fold assignment column).
- Never regenerate a random split on each run — fold membership will drift and
  your metric will move for no reason.
- For grouped or temporal data, the grouping key is part of the split definition.

## Container and environment isolation

Do not install into a global interpreter.

```bash
uv venv .venv 2>/dev/null || python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
uv pip install -r requirements.txt 2>/dev/null || pip install -r requirements.txt
```

Pin exact versions in `requirements.txt`. Ranges are not reproducibility.

## A minimal reproducible project layout

```
project/
  README.md                 how to re-run, in order
  requirements.lock.txt     exact versions
  environment.txt           interpreter and platform
  data/
    raw/                    immutable, never edited
    processed/              regenerable from raw
  src/                      numbered scripts, run in order
  results/
    figures/
    tables/
  _script_manifest.jsonl    one line per execution
  split.json                frozen split definition
```

## The re-run test

Before declaring work reproducible, ask: **could a competent stranger reproduce
the headline number from these artifacts alone, without asking me anything?**

If the answer is no, the missing piece is a bug in the deliverable. Common gaps:

| Gap | Fix |
|---|---|
| Seed not recorded | Write it into the results artifact |
| Environment not pinned | Commit a lock file |
| Raw output edited in place | Regenerate from an immutable raw copy |
| Split not frozen | Persist the split |
| Manual step in the pipeline | Script it, or document it explicitly |
| API result not cached | Save the payload and hash it |
| Single-seed metric | Re-run across seeds, report variance |
