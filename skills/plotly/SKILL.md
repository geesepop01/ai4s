---
name: plotly
description: Interactive visualization for exploration, dashboards, and web-embedded charts. Use when hover, zoom, pan, or linked selection is needed; use matplotlib or scientific-visualization for static publication figures.
category: visualization
tags: [plotly, interactive, dashboard, visualization, web]
---

# Plotly

Interactive visualization answers a different question than a static figure:
"what is this specific point" and "what happens when I filter." Use it for
exploration and communication of complex data; use static figures for
publication.

## When interactive is right

- **Exploration:** hover to identify outliers, zoom into a dense region, pan
  across a long time series, lasso a cluster and inspect its members.
- **Dashboards:** a stakeholder who needs to filter by their own criteria.
- **Web deliverables:** a report where the reader should be able to interrogate
  the data.
- **Large data:** downsampling + WebGL rendering where a static image would be
  unreadable.

## When static is right

Publication figures, print, slides where the reader cannot hover, any figure that
must be read as an image. Do not deliver an interactive chart as the sole record
of a result — export a static snapshot too.

## Core patterns

```python
import plotly.express as px
import plotly.io as pio

fig = px.scatter(df, x="age", y="score", color="group",
                 hover_data=["subject_id", "session"],
                 title="Score by age and group")
fig.update_layout(template="plotly_white", font=dict(size=14))
fig.write_html("figures/score_by_age.html", include_plotlyjs="cdn")
fig.write_image("figures/score_by_age.png", scale=3)   # static export
```

**Linked views and dashboards:**

```python
from dash import Dash, dcc, html, Input, Output
app = Dash(__name__)
app.layout = html.Div([
    dcc.Dropdown(id="group", options=[{"label": g, "value": g} for g in groups]),
    dcc.Graph(id="main"),
])
@app.callback(Output("main", "figure"), Input("group", "value"))
def update(g): ...
```

## Performance

- **WebGL traces** (`scattergl`, `heatmapgl`) for >10k points.
- **Downsample before plotting** for overview; keep the raw data for the zoom.
- **`include_plotlyjs="cdn"`** in exported HTML keeps the file small.
- Avoid too many traces; facet into subplots instead.

## Accessibility and correctness

- **Colorblind-safe discrete palettes** (Okabe-Ito, or `color_discrete_sequence`).
- **Do not rely on hover to convey essential information.** The axis labels and
  the title carry the meaning; hover adds detail.
- **Units and n are in the title or axis label**, not only in the hover tooltip.
- **Export a static image alongside the HTML** so the result exists without the
  interaction.

## Export formats

| Target | Command |
|---|---|
| HTML (interactive) | `fig.write_html("out.html")` |
| PNG (static) | `fig.write_image("out.png", scale=3)` (needs `kaleido`) |
| SVG/PDF | `fig.write_image("out.svg")` / `.pdf()` |
| Notebooks | `fig.show()`; also save so the result outlives the notebook |

The interactive file is a convenience; the saved static image and the data
behind it are the deliverable.
