---
name: scientific-visualization
description: Publication-quality scientific figures with matplotlib, seaborn, and plotly. Use for data visualization, figure generation, and creating publication-ready plots.
category: visualization
tags: [visualization, matplotlib, seaborn, plotly, figures, publication]
---

# Scientific Visualization

## Overview

Every research project should produce clear, publication-quality figures. This skill
covers matplotlib, seaborn, and plotly for scientific data visualization.

## Installation

```bash
pip install matplotlib seaborn plotly
```

## Publication Standards

- **Resolution**: 300 DPI minimum for print
- **Font size**: 8-12 pt for axis labels, 10-14 pt for titles
- **Color palettes**: colorblind-safe (viridis, cividis, Okabe-Ito)
- **Format**: vector (SVG, PDF) for line art; raster (PNG, TIFF) for images
- **Figure size**: typically 3.5" × 2.5" (single column) or 7" × 5" (double column)

## Setup

```python
import matplotlib.pyplot as plt
import matplotlib as mpl
import seaborn as sns
import numpy as np

# Publication-ready defaults
mpl.rcParams.update({
    'font.size': 10,
    'font.family': 'sans-serif',
    'axes.labelsize': 11,
    'axes.titlesize': 12,
    'xtick.labelsize': 9,
    'ytick.labelsize': 9,
    'legend.fontsize': 9,
    'figure.dpi': 300,
    'savefig.dpi': 300,
    'savefig.bbox': 'tight',
})

# Colorblind-safe palette
sns.set_palette('colorblind')
```

## Common Plot Types

### Scatter Plot

```python
fig, ax = plt.subplots(figsize=(4, 3))
scatter = ax.scatter(x, y, c=colors, s=sizes, alpha=0.7, cmap='viridis', edgecolors='white', linewidth=0.5)
ax.set_xlabel('X Label (units)')
ax.set_ylabel('Y Label (units)')
plt.colorbar(scatter, label='Color Label')
ax.set_title('Scatter Plot Title')
plt.savefig('scatter.pdf', bbox_inches='tight')
```

### Bar Chart with Error Bars

```python
fig, ax = plt.subplots(figsize=(5, 3))
x = np.arange(len(categories))
bars = ax.bar(x, means, yerr=errors, capsize=5, color=sns.color_palette('colorblind', len(categories)),
              edgecolor='black', linewidth=0.5)
ax.set_xticks(x)
ax.set_xticklabels(categories, rotation=45, ha='right')
ax.set_ylabel('Metric (units)')
ax.set_title('Bar Chart Title')
plt.savefig('bar_chart.pdf', bbox_inches='tight')
```

### Box Plot / Violin Plot

```python
fig, axes = plt.subplots(1, 2, figsize=(8, 3))

# Box plot
sns.boxplot(data=df, x='group', y='value', ax=axes[0], palette='colorblind')
axes[0].set_title('Box Plot')

# Violin plot
sns.violinplot(data=df, x='group', y='value', ax=axes[1], palette='colorblind', inner='box')
axes[1].set_title('Violin Plot')

plt.savefig('box_violin.pdf', bbox_inches='tight')
```

### Heatmap

```python
fig, ax = plt.subplots(figsize=(6, 5))
sns.heatmap(data_matrix, annot=True, fmt='.2f', cmap='RdBu_r', center=0,
            xticklabels=col_labels, yticklabels=row_labels, ax=ax,
            cbar_kws={'label': 'Correlation'})
ax.set_title('Heatmap Title')
plt.savefig('heatmap.pdf', bbox_inches='tight')
```

### Line Plot with Confidence Bands

```python
fig, ax = plt.subplots(figsize=(5, 3))
ax.plot(x, mean_values, color='#2196F3', linewidth=2, label='Mean')
ax.fill_between(x, lower_ci, upper_ci, alpha=0.2, color='#2196F3', label='95% CI')
ax.set_xlabel('X Label')
ax.set_ylabel('Y Label')
ax.legend()
ax.set_title('Line Plot with CI')
plt.savefig('line_ci.pdf', bbox_inches='tight')
```

### Subplot Grid

```python
fig, axes = plt.subplots(2, 3, figsize=(12, 8))
for i, (ax, data, title) in enumerate(zip(axes.flat, datasets, titles)):
    ax.hist(data, bins=30, color=sns.color_palette('colorblind')[i], alpha=0.7)
    ax.set_title(title)
    ax.set_xlabel('Value')
    ax.set_ylabel('Count')
plt.tight_layout()
plt.savefig('subplot_grid.pdf', bbox_inches='tight')
```

### Seaborn Statistical Plots

```python
# Regression plot
sns.lmplot(data=df, x='x_var', y='y_var', hue='group',
           palette='colorblind', height=4, aspect=1.3)
plt.savefig('regression.pdf', bbox_inches='tight')

# Pair plot for multivariate data
g = sns.pairplot(df, hue='group', palette='colorblind', diag_kind='kde')
g.savefig('pairplot.pdf')

# FacetGrid for conditioned plots
g = sns.FacetGrid(df, col='condition', row='group', height=2.5, aspect=1.2)
g.map_dataframe(sns.scatterplot, x='x', y='y', alpha=0.6)
g.savefig('facet.pdf')
```

### Interactive (Plotly)

```python
import plotly.express as px

fig = px.scatter(df, x='x_var', y='y_var', color='group', size='size',
                 hover_data=['name'], title='Interactive Scatter')
fig.write_html('interactive_scatter.html')
fig.write_image('static_scatter.png', scale=3)  # Static export
```

## Color Palettes

```python
# Colorblind-safe palettes
okabe_ito = ['#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2',
             '#D55E00', '#CC79A7', '#000000']

# Sequential: viridis, plasma, inferno, magma, cividis
# Diverging: RdBu_r, coolwarm, BrBG, PiYG
# Qualitative: colorblind, Set2, tab10

# Custom discrete palette
palette = sns.color_palette('colorblind', n_colors=8)
```

## Best Practices

1. **Label everything**: axes with units, legend, title
2. **Colorblind-safe**: avoid red-green combinations; use viridis, cividis, or Okabe-Ito
3. **300 DPI minimum** for publication; use vector formats when possible
4. **Appropriate chart type**: scatter for correlation, bar for comparison, box/violin for distribution
5. **Show data points** when N is small (< 50); use summary statistics for large N
6. **Error bars**: always show uncertainty (SD, SE, CI, or IQR)
7. **Consistent styling**: same fonts, colors, and sizes across all figures in a paper
8. **Save as PDF/SVG** for LaTeX; PNG/TIFF for Word
9. **Figure captions** should be self-contained — reader should understand the figure without reading the text

## Render, then look at it

Saving the file is not the last step. Before delivering:

1. **Open every figure at its intended reading size** — the size a reader will see
   it in the paper or on the slide, not a thumbnail and not a zoomed-in working
   view. A label that fits at 200% can collide at 100%.
2. **Fix what you see**: overlapping or clipped labels, text too small to read,
   legend covering data, cut-off axes, missing units, inconsistent scales across
   a multi-panel figure.
3. **Re-read after fixing.** An edit after a check voids the check — the version
   you verified is the version you ship.
4. For a compiled document, read **every page** the same way and confirm every
   figure and table number in the text resolves to a real object.

A figure that is wrong at the size someone reads it is a wrong figure, no matter
how correct the underlying code is.
