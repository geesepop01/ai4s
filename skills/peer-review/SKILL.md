---
name: peer-review
description: Conduct and respond to peer review of a manuscript or analysis. Use when reviewing someone's work, writing a review report, or responding to reviewers' comments.
category: writing
tags: [peer-review, referee, critique, revision, response-letter]
---

# Peer Review

A good review is a service to the reader: it identifies what would have to be
true for the conclusion to hold, and checks whether the paper establishes it.
This skill covers both writing a review and responding to one.

## Writing a review

### Structure

```markdown
# Review of <title>

## Summary (2–4 sentences)
What the paper claims and how it supports the claim. Written so the authors can
see whether you understood the argument.

## Major concerns
Numbered, each one:
- The specific issue
- Where it appears (section/figure/line)
- Why it affects the conclusion
- What would resolve it

## Minor concerns
Numbered, fixable issues: clarity, figures, citations, statistics reporting.

## Recommendation
Accept / Minor revision / Major revision / Reject, with the one-sentence reason.
```

### What makes a concern *major*

A concern is major if it changes the conclusion. Everything else is minor. Do
not inflate minor issues to make the review look thorough; authors can tell and
it wastes everyone's time.

### What to check first

1. **Does the evidence support the claim?** The gap between what is shown and
   what is claimed is the first major concern, always.
2. **Is the analysis right?** Wrong test, uncorrected multiplicity, leakage,
   unacknowledged confounders.
3. **Is the method reproducible?** Parameters, data splits, seeds, versions.
4. **Are the limitations honest?** Scope claims that outrun the data.
5. **Are the citations correct?** Wrong attribution, missing competing work,
   uncited claims about prior work.

### Tone

Write to the authors, not about them. Specific and actionable. "The authors
should have used a mixed model" is weaker than "the repeated measures on
subjects violate independence; a mixed model with subject as a random effect
would address this."

## Responding to reviews

### The response letter

```markdown
# Response to Reviewers

We thank the reviewers for their comments. Changes are marked in the revised
manuscript; line numbers refer to the marked-up version.

## Reviewer 1
### Comment 1.1 (quoted verbatim)
**Response:** <agree / partially agree / respectfully disagree, with evidence>
**Change made:** <section/line, what changed>
```

### Rules

1. **Quote the comment verbatim.** Reviewers and editors check that you answered
   what was asked.
2. **Answer every comment**, including the ones you disagree with. Silence is
   read as evasion.
3. **Disagree with evidence, not with tone.** A disagreement carries a citation,
   a number, or an analysis. "We disagree" alone is not a response.
4. **Point to the exact change** — section and line numbers in the marked-up
   manuscript. "See revised Section 3.2" is checkable; "we have clarified" is not.
5. **New analyses are labelled.** If a reviewer's suggestion prompted a new
   analysis, say so and say whether it was pre-specified or post-hoc.
6. **Do not silently change the claim.** If the response requires softening the
   claim, state the softened claim in the letter so the editor sees it.

## As a third-party reviewer of an analysis

When asked to review an analysis artifact (not a manuscript):

- Check the deliverable against its stated spec (`acceptance-checks`).
- Check that every number traces to an artifact (`deliverable-conformance`).
- Check that the analysis matches the design (`statistical-conventions`).
- Report findings with the file and location, not vague opinions.
- Use the verdict vocabulary: **PASS / MINOR_FIXES / BLOCKING / INSUFFICIENT**.
