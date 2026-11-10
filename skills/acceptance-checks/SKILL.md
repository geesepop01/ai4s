---
name: acceptance-checks
description: Turn acceptance criteria into executable checks and run them on finished outputs before delivering. Use whenever a task states criteria, a score, a tolerance, or a spec to satisfy.
category: core
tags: [verification, acceptance, quality, grader, testing]
disable-model-invocation: true
---

# Acceptance Checks

Acceptance criteria a task states are not a description of the goal. They are the
contract the output is judged against. This skill turns that contract into
executable checks and runs them on the finished files before delivery.

## Why this is a separate step

A correct-looking analysis can still fail its acceptance criteria: a column named
differently, a rounding convention that does not match, a subset that the spec
excludes, a metric reported on the wrong split. Each of these is invisible in a
review of the code and obvious in a run of the check.

## The acceptance record

Before computing, write `acceptance.md` capturing every criterion verbatim:

```markdown
# Acceptance Record

## Stated criteria (verbatim)
1. "MAE on the held-out test split < 3.5"
2. "Output file `results/predictions.csv` with columns `id, y_true, y_pred`"
3. "No train/test overlap in subject IDs"

## Convert to executable checks
- [ ] Check A: load `results/predictions.csv`, assert columns exactly `id,y_true,y_pred`
- [ ] Check B: compute MAE from the file's own `y_true`/`y_pred`; assert < 3.5
- [ ] Check C: load split file; assert intersection(subject_train, subject_test) is empty

## Hidden-condition rehearsal
If the grader holds out additional subjects, my checks only cover the subjects I can
see. I will name what I cannot check and what I did to bound it.
```

## Converting criteria to checks

1. **Numbers become measurements.** "Accuracy > 0.9" becomes: load the final
   output, compute accuracy the way the spec defines it, assert. Do not paste a
   number from a log.
2. **Files become structure assertions.** Path exists, encoding, columns in the
   stated order, dtypes, row count, no unexpected extra columns.
3. **Constraints become negative checks.** "No leakage" becomes an explicit
   set-intersection assertion on the split you actually used.
4. **Naming becomes equality, not substring.** "Column `subject_id`" is checked
   with an exact set match, not `any("subject" in c for c in cols)`.
5. **Exclusions become absence checks.** If the spec excludes a group, assert that
   group is absent from the output, not just that the analysis "mostly" excludes it.

## Running the checks

Run them **on the files as they are at the end**, in a fresh process, with the
same environment the reader will use. Save the check script and its output as
artifacts: `check_acceptance.py` and `acceptance_results.txt`.

- An edit after a check voids the check. Re-run after any change.
- A check adjusted until it passes is not a check. Fix the artifact, not the bar.
- Report each check as **PASS**, **FAIL**, or **NOT COVERED**, never as "looks fine."

## Rehearsing the hidden condition

When the grader will score inputs you cannot see, rehearse that condition on what
you can see: hold out part of your own data and run the full pipeline as if it
were unseen. Report how the number moved. If the pipeline depends on a property
of the visible data that the hidden data may not share, say so explicitly in the
deliverable's limitations section.

## Verdict

| Verdict | Meaning |
|---|---|
| **ACCEPTED** | Every stated criterion passes as an executable check |
| **ACCEPTED WITH GAPS** | Passes where checkable; gaps named with what they are |
| **REJECTED** | At least one criterion fails; fix and re-run |
| **UNDER-SPECIFIED** | The criteria are ambiguous; ask before computing rather than guessing |

The final report states the verdict, the check script path, and any
**NOT COVERED** items in plain language.
