---
name: sequence-alignment
description: Perform and evaluate sequence alignments — pairwise, multiple, and profile methods. Use for homology, conservation, and sequence comparison with correct scoring interpretation.
category: biology
tags: [alignment, blast, msa, homology, sequences]
disable-model-invocation: true
---

# Sequence Alignment

Alignment is the foundation of homology inference. The scoring scheme and the
algorithm determine what the alignment means.

## Pairwise alignment

| Algorithm | Optimal? | Use |
|---|---|---|
| Needleman–Wunsch | Global, optimal | Full-length comparison |
| Smith–Waterman | Local, optimal | Domain/segment match |
| BLAST | Heuristic, local | Database search |
| MMseqs2 | Heuristic | Fast large-scale search |
| FASTA | Heuristic, local | Sensitive search |

```python
from Bio import Align
aligner = Align.PairwiseAligner()
aligner.mode = "local"
aligner.match_score = 2
aligner.mismatch_score = -1
aligner.open_gap_score = -10
aligner.extend_gap_score = -0.5
alignments = aligner.align(seq1, seq2)
```

**The scoring scheme is the hypothesis.** State the substitution matrix
(BLOSUM62, PAM250) and the gap penalties.

## Homology inference

- **Sequence identity thresholds:** > 30% over a substantial length suggests
  homology; < 20% is twilight zone. Report identity, coverage, and E-value.
- **Reciprocal best hit** for orthology, or use an orthology database
  (Ensembl Compara, OrthoDB).
- **A significant BLAST hit is not proof of homology**; conserved domains can
  produce spurious hits.

## Multiple sequence alignment

```bash
mafft --auto sequences.fasta > aligned.fasta
clustalo -i sequences.fasta -o aligned.fasta --outfmt=fasta
```

| Tool | Speed | Accuracy | Large N |
|---|---|---|---|
| MAFFT | fast | high | yes |
| Clustal Omega | fast | good | yes |
| MUSCLE | medium | high | medium |
| PRANK | slow | indel-aware | small |
| T-Coffee | slow | consistency | small |

- **Alignment quality** (GUIDANCE, TCS, trimAl) — report how the alignment was
  filtered.
- **Trimming** removes poorly aligned columns; state the method and its
  threshold.

## Conservation analysis

- **Per-site conservation** (Shannon entropy, Jensen-Shannon divergence).
- **Structure-aware** conservation when a structure exists.
- **Phylogenetic correction:** conservation in related sequences inflates
  apparent conservation.

## Profile methods

- **HMMs** (HMMER) for family detection; the profile captures position-specific
  conservation.
- **HHblits/HHsearch** for remote homology.
- **Report the E-value and the coverage.**

## Reporting

State: the sequences and their identifiers/versions, the alignment algorithm and
its parameters, the substitution matrix and gap penalties, the alignment length
and identity/coverage, the trimming and quality filtering, the conservation
metric, and the homology inference's basis and its confidence.

## Common errors

- Homology claimed from a short local match.
- Multiple alignment without quality assessment.
- Using the wrong substitution matrix for the evolutionary distance.
- Ignoring gap placement in interpreting a domain boundary.
