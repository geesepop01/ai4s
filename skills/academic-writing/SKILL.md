---
name: academic-writing
description: Academic writing and LaTeX document preparation. Use for writing research papers, reports, grant proposals, and managing citations with BibTeX.
category: writing
tags: [writing, latex, academic, paper, bibtex, citations, report]
---

# Academic Writing

## Overview

This skill covers academic writing conventions and LaTeX document preparation for
research papers, reports, and grant proposals.

## LaTeX Paper Template

```latex
\documentclass[11pt,a4paper]{article}

% Packages
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{amsmath,amssymb}
\usepackage{graphicx}
\usepackage{booktabs}       % Professional tables
\usepackage{hyperref}
\usepackage[margin=1in]{geometry}
\usepackage{natbib}         % Citation management
\usepackage{caption}        % Better figure/table captions
\usepackage{subcaption}     % Subfigures
\usepackage{float}          % Better float control
\usepackage{siunitx}        % SI units

% Title and authors
\title{Paper Title}
\author{
  Author One\textsuperscript{1,2} \and
  Author Two\textsuperscript{1}
}
\date{
  \textsuperscript{1}Department, University \\
  \textsuperscript{2}Institute \\
  \texttt{email@university.edu}
}

\begin{document}
\maketitle

\begin{abstract}
% 150-300 words. State: background, objective, methods, results (with numbers),
% and conclusion. Write this LAST.
Background text. Objective statement. Methods summary.
Key results with numbers (e.g., accuracy of 95.3\%).
Conclusion and significance.
\end{abstract}

\section{Introduction}
% Structure: broad context → specific gap → your contribution
% Paragraph 1: Broad context and importance
% Paragraph 2: What is known (key citations)
% Paragraph 3: What is not known (the gap)
% Paragraph 4: What you did and why it matters

\section{Methods}
% Reproducibility is key. Include enough detail for replication.
\subsection{Data}
% Source, size, preprocessing, splits

\subsection{Statistical Analysis}
% Tests used, corrections, significance thresholds, effect sizes

\subsection{Implementation}
% Software, hardware, parameters

\section{Results}
% Present findings objectively, no interpretation yet.
% Lead with the main finding, then supporting results.
% Every claim needs a number (test statistic, p-value, effect size, CI).

\begin{table}[H]
\centering
\caption{Main results comparison.}
\label{tab:results}
\begin{tabular}{lSSS}
\toprule
{Method} & {Metric 1} & {Metric 2} & {Metric 3} \\
\midrule
Baseline    & 0.82 & 0.75 & 0.80 \\
Proposed    & 0.95 & 0.91 & 0.93 \\
\bottomrule
\end{tabular}
\end{table}

\section{Discussion}
% Interpret results in context of literature.
% What do the results mean? Why do they matter?
% Limitations and alternative explanations.
% Future directions.

\section*{Acknowledgments}
% Funding, collaborators, computational resources

\bibliographystyle{plainnat}
\bibliography{references}

\end{document}
```

## BibTeX Citation Management

```bibtex
% references.bib

@article{author2024,
  author  = {Author, First and Author, Second},
  title   = {Paper Title},
  journal = {Journal Name},
  year    = {2024},
  volume  = {10},
  number  = {3},
  pages   = {123--145},
  doi     = {10.xxxx/xxxxx}
}

@inproceedings{conf2024,
  author    = {Author, First},
  title     = {Conference Paper Title},
  booktitle = {Proceedings of Conference},
  year      = {2024},
  pages     = {100--110}
}

@misc{arxiv2024,
  author       = {Author, First},
  title        = {Preprint Title},
  year         = {2024},
  eprint       = {2401.12345},
  archivePrefix = {arXiv},
  primaryClass = {cs.AI}
}
```

## Markdown Report Template

```markdown
# Title

## Abstract
[150-300 words: background, objective, methods, results, conclusion]

## 1. Introduction
[Context → Gap → Contribution]

## 2. Methods
### 2.1 Data
### 2.2 Analysis Pipeline
### 2.3 Statistical Plan

## 3. Results
### 3.1 Main Finding
[Table 1: Main results]
[Figure 1: Key visualization]

### 3.2 Supporting Results
[Table 2: Detailed comparison]

## 4. Discussion
- Interpretation of findings
- Comparison with literature
- Limitations
- Future directions

## 5. Conclusion
[2-3 sentences: what you found and why it matters]

## References
1. Author et al. (2024). Title. *Journal*, 10(3), 123-145.
```

## Writing Principles

### Structure
- **IMRaD**: Introduction → Methods → Results → Discussion
- **Introduction**: funnel shape (broad → specific → your work)
- **Results**: lead with the main finding, then supporting evidence
- **Discussion**: interpret, contextualize, acknowledge limitations

### Language
- Active voice preferred: "We analyzed..." not "The data was analyzed..."
- Past tense for methods and results: "We found..."
- Present tense for established knowledge: "DNA is..."
- Concise: remove unnecessary words
- Precise: use exact numbers, not "significant" or "substantial"
- Define abbreviations on first use

### Numbers and Statistics
- Report effect sizes alongside p-values
- Use confidence intervals to communicate uncertainty
- Round appropriately: p-values to 3 decimals, means to sensible precision
- Never report p = 0.000; use p < 0.001
- One-tailed tests require justification

### Figures and Tables
- Figures: self-contained captions that explain what the reader should see
- Tables: clear headers with units, professional formatting (booktabs)
- Reference all figures/tables in the text
- Number consecutively

### Citations
- Cite the original source, not reviews
- Cite methods papers for non-standard analyses
- Include DOIs when available
- Use consistent citation style throughout

## Common Pitfalls

1. **HARKing** (Hypothesizing After Results are Known): Don't present exploratory findings as confirmatory
2. **p-hacking**: Report all planned analyses, not just significant ones
3. **Circular reasoning**: Don't use the same data for model selection and evaluation
4. **Overclaiming**: Use hedging language for uncertain findings ("suggests", "is consistent with")
5. **Missing limitations**: Every study has them; acknowledge honestly
6. **Poor reproducibility**: Include enough detail for someone to replicate your work
