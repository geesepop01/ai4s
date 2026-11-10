---
name: jupyter-notebooks
description: Use Jupyter notebooks effectively for exploration — reproducibility, execution order, and conversion to scripts/reports. Use for interactive analysis that must remain trustworthy.
category: core
tags: [jupyter, notebooks, exploration, reproducibility, ipython]
disable-model-invocation: true
---

# Jupyter Notebooks

Notebooks are for exploration. The trap is that their state is not their code: a
notebook run out of order produces results no one can reproduce.

## The reproducibility discipline

1. **Restart & Run All before trusting any result.** If it does not reproduce
   from a clean kernel, it is not a result.
2. **Top-to-bottom execution.** Out-of-order execution is the notebook's silent
   failure mode.
3. **No hidden state.** A variable defined in cell 20 and used in cell 5 is the
   classic bug.
4. **Seed everything** at the top.

## Structure

```python
# Cell 1: setup
import numpy as np, pandas as pd, matplotlib.pyplot as plt
SEED = 42
np.random.seed(SEED)

# Cell 2: load
df = pd.read_csv("data.csv")

# Cells 3+: analysis, one idea per cell
```

- **One idea per cell.** Re-runnable, self-contained enough to debug.
- **Markdown narrative** between cells: what this step does and why.
- **Parameters at the top**, not buried in cell 14.

## When to leave the notebook

- **A result that goes in a report** must come from a script, run end to end.
  The notebook is where you found it; the script is the evidence.
- **Reusable logic** goes into a module, imported by the notebook.
- **Long-running or production** work goes to a script or a pipeline.

## Converting

```bash
jupyter nbconvert --to script notebook.ipynb
jupyter nbconvert --to html notebook.ipynb   # shareable record
papermill notebook.ipynb output.ipynb -p seed 42   # parameterized runs
```

**Papermill** makes notebooks parameterizable and batch-runnable; it is the
bridge between exploration and pipeline.

## Output hygiene

- **Clear outputs before committing** (or use nbstripout) to keep the diff
  clean — or commit outputs deliberately as a record, but be consistent.
- **Figures saved to files**, not only displayed inline. A figure in a notebook
  is not an artifact.
- **Data written to files** with the paths recorded.

## Reporting

State: that the result came from a script (with its path) run end to end, not
from notebook state; the notebook's role in the discovery; the seed and the
environment; and the artifacts (figures, tables) written to disk.

## Anti-patterns

- Reporting a number from a notebook that was not Restart & Run All'd.
- Hidden state across cells.
- Figures that exist only inline.
- A notebook committed with stale outputs that contradict the current code.
