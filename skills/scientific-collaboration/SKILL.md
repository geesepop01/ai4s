---
name: scientific-collaboration
description: Work effectively in scientific collaborations — handoffs, shared artifacts, credit, and version control. Use when research work spans people, time, or machines.
category: core
tags: [collaboration, handoff, git, credit, versioning]
disable-model-invocation: true
---

# Scientific Collaboration

Collaboration fails at the boundaries: the handoff, the shared artifact, and
the record of who did what. This skill covers making those boundaries clean.

## Version control as the record

- **Git is the source of truth** for code, configs, and analysis scripts.
- **Commit messages state the scientific intent**, not just the change:
  "add subject-level aggregation before the t-test" beats "fix stats."
- **Data is not committed** (usually); it is versioned separately (DVC, data
  registry) and referenced by checksum.
- **The paper's numbers cite the commit** that produced them.

## Handoffs

A handoff is a self-contained package:

```
handoff/
  README.md         # what this is, how to run it, what it produces
  code/             # or the repo + commit SHA
  config.yaml       # exact parameters
  environment.txt   # frozen deps
  data_manifest.json# inputs + checksums
  results/          # what was produced
  known_issues.md   # what is unfinished or uncertain
```

**The reader cannot see your context.** The README states the goal, the method,
the result, and the caveats. `known_issues.md` is what a good collaborator
writes and a bad one hides.

## Shared artifacts

- **One owner per artifact** to avoid divergent edits.
- **The data schema is a contract.** Document columns, types, units, and the
  unit of analysis.
- **Derived vs raw** clearly separated; raw is immutable.

## Credit and authorship

- **Contribution records** (CRediT taxonomy) kept during the project, not at
  the end.
- **Authorship discussed early** and revisited as contributions change.
- **Acknowledge** data sources, funding, and infrastructure.
- **Software and datasets are cited works.** Cite them.

## Reproducibility across people

- **The environment is shared** (container, lockfile), so two people get the
  same result.
- **The pipeline runs from a clean checkout** by anyone; if only the original
  author can run it, it is not done.
- **The result survives the person.** A project whose analysis lives in one
  person's notebook is fragile.

## Reporting

State: the code repository and its commit, the environment definition, the data
version, the contributor roles, the handoff artifacts, and the reproduction
instructions that a newcomer could follow.

## Anti-patterns

- Analysis that only one person can run.
- Divergent copies of the same artifact.
- Authorship and credit settled at submission time.
- Results not traceable to a code version.
