---
name: pocket-detection
description: Detect and characterize protein binding pockets — druggability, geometry, and site comparison. Use before docking or when evaluating a target's tractability.
category: chemistry
tags: [pocket, druggability, binding-site, fpocket, cryptic-sites]
disable-model-invocation: true
---

# Pocket Detection

A docking result is only as good as the pocket definition. Finding the right
pocket — and knowing whether it is druggable — comes first.

## Tools

| Tool | Approach | Output |
|---|---|---|
| fpocket | Voronoi/alpha spheres | Pocket ranking, druggability score |
| SiteMap (Schrödinger) | Grid-based | Site score, Dscore |
| DoGSiteScorer | Difference of Gaussians | Druggability, volume |
| CASTp | Geometric | Pocket volume, area |
| P2Rank | ML on geometric features | Ranked pockets |
| CryptoSite | Cryptic pockets | Transient pockets |

## Pocket properties

| Property | Why it matters |
|---|---|
| Volume and depth | Size match to ligand |
| Hydrophobicity | Hydrophobic contacts drive affinity |
| H-bond donors/acceptors | Specificity |
| Enclosure/shape | Buried sites bind tighter |
| Flexibility | Induced-fit pockets |
| Conservation | Functional sites are conserved |

**Druggability** (SiteMap Dscore > 1.0, fpocket druggability > 0.5) predicts
whether a small molecule can bind with high affinity. It is a prediction, not a
guarantee.

## Cryptic and allosteric sites

- **Cryptic pockets** open only upon binding; static analysis misses them.
  Ensemble docking or MD reveals them.
- **Allosteric sites** are often more specific and less conserved than the
  orthosteric site. Report the site's relationship to the known active site.
- **Conservation analysis** distinguishes functional sites from incidental
  clefts.

## Pocket characterization workflow

1. **Run multiple pocket finders**; agreement is stronger evidence.
2. **Compare to known sites** in homologs (PDB ligand positions).
3. **Characterize** chemistry (hydrophobicity, charge, H-bond pattern).
4. **Assess druggability** with the tool's score and the pocket's properties.
5. **Set the docking box** from the pocket, not from a guess.

## Validation

- **Does the pocket finder locate the known ligand's site?** Test on a
  holo structure.
- **Volume and shape** consistent with the intended ligand size.
- **Conservation** checked: a non-conserved pocket may not be functional.

## Reporting

State: the tool(s) and their versions, the pocket ranking and scores, the
pocket's geometry (volume, depth), the chemical character, the druggability
assessment and its basis, the comparison to known sites/homologs, the
flexibility/cryptic considerations, and the caveat that druggability prediction
is not a guarantee of a ligand.

## Anti-patterns

- Docking to a box set by guesswork rather than a detected pocket.
- Reporting a druggability score as a probability of success.
- Ignoring flexibility in a known induced-fit pocket.
- Claiming an allosteric site without distinguishing it from the orthosteric one.
