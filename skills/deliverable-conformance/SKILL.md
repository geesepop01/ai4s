---
name: deliverable-conformance
description: Check research outputs against their specification before reporting. Use when a task names paths, formats, columns, units, or scores to hit — to build the checklist, verify it mechanically on final files, and stop surrogate or self-built tests from masquerading as evidence.
category: research
tags: [verification, deliverables, quality, methodology, reproducibility]
disable-model-invocation: true
---

# Deliverable Conformance

A claim you cannot check against a spec is a claim you cannot defend. This skill
makes the check mechanical instead of impressionistic.

## The checklist comes first

Before any computation, write the exact deliverables as a checklist. For each
item pin down:

- **Path and format** — where it lands, what file type, what encoding.
- **Shape** — columns, keys, index, expected row count or range.
- **Units and rounding** — the unit of every reported quantity, the precision.
- **Naming and tie-breaks** — how ties, missing values, and duplicates are
  resolved so a re-run reproduces the same file.
- **Exclusions and method constraints** — what is deliberately left out, and
  which method the question requires rather than a convenient proxy.

Keep this checklist in the project (`deliverable-checklist.md`) so a reviewer can
audit it, and so a context compaction cannot lose it.

## Check under the conditions the result will be judged under

Name those conditions before choosing what to validate against: which inputs,
regimes, seasons, time ranges, or populations the check reaches. Then say plainly
where your own data do not cover them.

A split drawn from wherever labels happen to be dense scores the part of the
problem you were not asked about. It cannot tell you that you are wrong outside
its own range. A result reported as holding generally, when every check behind it
sits inside one corner of the graded domain, is an untested claim about the rest.

## Mechanical verification rules

1. Check each item on the files **as they are at the end**, not on an earlier
   snapshot. An edit after a check voids the check.
2. A check adjusted until it passes is not a check. Fix the artifact, not the bar.
3. A number reported for a file is the number measured on its **final** version.
   Re-measure after any change.
4. When the task sets a constraint and a score, keep the best artifact that
   satisfies every constraint as the check actually measures it. A later cleanup,
   simplification, or tidy-up that lowers the score is a rejected experiment, not
   a delivery.
5. Every reported number traces to a saved script run end to end, and the answer
   names the script beside the number. Interactive exploration is fine; its
   conclusions are not the result.

## Surrogates are not evidence

A surrogate you build — a simulator you calibrated, a teacher model, pseudo-labels
— is your own assumptions restated. Agreement with it is **not** an estimate of
error against reality.

- It may supply training signal where real labels are thin.
- What you ship is chosen on real data held out from the fitting, never on
  surrogate agreement.
- A candidate that already met the stated bar on real held-out data is not given
  up for one that only wins against the surrogate.
- When you revise a finished answer, judge the revision on the same evidence the
  original was judged by, and keep whichever wins there.

Where no real data cover the conditions you will be judged on, a good fit on the
covered ones says nothing about the uncovered ones. The disagreement between
plausible models in the uncovered conditions is your error estimate there:
compare it with the tolerance, not with zero, prefer an average across those
models to the one that won where labels existed, and spend the remaining budget
narrowing that spread.

## Self-built cases only prove the implementation

A case you construct yourself is only as hard as you made it. Passing it shows
the implementation is right; it does not show accuracy carries to the real
problem. A case built from the same representation the method uses cannot see
that representation's error at all.

Check against the real problem's own data wherever reachable — supplied
observations, an oracle or instrument you can query, a conservation law or
identity the true system must satisfy — by holding some of them back from the
fitting and testing on them. When a tolerance must be met on data you cannot
see, refine on the real problem until the answer stops moving well inside the
budget, rather than freezing a setting because your own cases passed.

When the grader's inputs exist only at grading time and reach your code through
an interface you cannot call now, passing your own suite is where the work
starts. The one check left to you is robustness: harder cases than you expect,
resolution pushed until the answer stops moving, every branch the interface can
take exercised.

## Single graded values get a colleague's scrutiny

A single label or number graded exactly gets the scrutiny a colleague would
demand before signing it: the alternatives the evidence allows and what excludes
each, a held-out or independently recomputed check, and a plausibility check
against the physics or the literature. The remaining budget is for that, not a
reason to stop early.

## Verdict vocabulary

Report conformance with one of these, never with a vague "looks fine":

- **CONFORMS** — every checklist item verified on final files under stated
  conditions.
- **CONFORMS WITH STATED GAPS** — verified where data cover it; gaps named.
- **PARTIAL** — some items unmet; name each and why.
- **BLOCKING** — an item that the spec requires is missing or wrong; fix and
  re-verify before delivery.

Never declare completion while deliverables are missing and budget remains.
Never declare a task impossible while most of the budget remains. Never write
synthetic or placeholder values: write the real partial result and name the gap.
