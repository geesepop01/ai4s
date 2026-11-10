---
name: analysis-report
description: Write the trace and report for an analysis a reader will judge. Use when producing a report, results section, or analysis write-up that must be auditable.
category: core
tags: [reporting, provenance, trace, methods, results]
---

# Analysis Report

An analysis report is not a story about what you did. It is the artifact a
reader uses to check whether your conclusion holds. This skill gives it the
structure that makes that check possible.

## The report skeleton

```markdown
# <Question restated, with its binding clauses>

## Data provenance
- Source: <repository / file / database, with version and retrieval date>
- Inclusion and exclusion criteria applied, stated exactly
- Final N and its breakdown by the variables the analysis depends on

## Method
- Every parameter that changes the result: split, seed, model, hyperparameters,
  preprocessing, statistical test and its assumptions
- Software versions
- What was pre-specified vs decided after seeing the data

## Results
- Raw numbers first: the actual values the script produced
- Adjusted numbers (if any) labelled as such, with the adjustment named
- Uncertainty: CI, SD, or the specific measure, always with what it is over
- Every figure and table referenced by the text

## Interpretation
- What the evidence supports
- What it does not support
- Where it contradicts the hypothesis or prior work, said plainly with the numbers

## Limitations and gaps
- Coverage gaps: what population/regime/input the data do not cover
- Unverified items named explicitly

## Reproduction
- Script path and hash for every reported number
- Environment file
- Re-run command
```

## Rules that make the report auditable

1. **Raw before adjusted.** A raw value that disagrees with prior work is a
   finding. Do not smooth it away; report both and name the discrepancy.
2. **Numbers name their source.** Every number in the report is accompanied by
   the script path and output file it came from. No number is quoted from memory
   or from interpreter state.
3. **Methods carry their parameters.** A method named without its parameters is
   not reproducible. "Random forest" is not a method; "random forest, 500 trees,
   max_depth=12, seed=42, class_weight=balanced" is.
4. **Exclusions are stated, not silent.** If rows, subjects, or time ranges were
   dropped, state the criterion and the count dropped.
5. **Negative results stay in.** A run that failed, an assumption that did not
   hold, a subgroup that showed nothing — all belong in the report.
6. **Scope is honest.** If every check was run inside one corner of the domain,
   the conclusion is about that corner. State the boundary.

## Length scales to the request

- A **short result note** carries the question, the number, the uncertainty, and
  the script path.
- A **full analysis report** carries the skeleton above.
- A **methods section for a manuscript** is the Method and Reproduction blocks,
  formatted for the venue. Load `academic-writing` for venue formatting and
  `literature-search` for verified context.

## Before you call it done

- [ ] Every number traces to a saved script output
- [ ] Effect sizes and intervals accompany p-values
- [ ] Every claim in the text is either cited or shown to come from a result
- [ ] Limitations cover what the data do not reach
- [ ] A reader with only the project folder could re-run and get the same numbers
