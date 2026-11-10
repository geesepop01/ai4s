---
name: biopython
description: BioPython toolkit for biological computation. Use for sequence analysis, FASTA/GenBank parsing, BLAST searches, phylogenetics, structural biology, and database access (NCBI, PDB, UniProt).
category: biology
tags: [biology, bioinformatics, sequences, phylogenetics, genomics]
---

# BioPython

## Overview

BioPython is the standard Python library for biological computation. Use it for
sequence manipulation, file format parsing, database access, phylogenetics, and
structural biology.

## Installation

```bash
pip install biopython
```

## Quick Reference

### Sequence Analysis

```python
from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction, molecular_weight
from Bio.SeqUtils.ProtParam import ProteinAnalysis

# DNA sequence analysis
dna = Seq("ATGCGATCGATCGATCG")
print(f"GC content: {gc_fraction(dna):.2%}")
print(f"Reverse complement: {dna.reverse_complement()}")
print(f"Translation: {dna.translate()}")

# Protein analysis
protein = ProteinAnalysis("MAIVMGRWKGAR")
print(f"Molecular weight: {protein.molecular_weight():.1f} Da")
print(f"Isoelectric point: {protein.isoelectric_point():.2f}")
print(f"Amino acid percent: {protein.get_amino_acids_percent()}")
```

### File Format Parsing

```python
from Bio import SeqIO

# Parse FASTA
for record in SeqIO.parse("sequences.fasta", "fasta"):
    print(f"{record.id}: {len(record.seq)} bp")

# Parse GenBank
for record in SeqIO.parse("sequences.gb", "genbank"):
    print(f"{record.id}: {len(record.features)} features")

# Write FASTA
SeqIO.write(records, "output.fasta", "fasta")
```

### BLAST Search

```python
from Bio.Blast import NCBIWWW, NCBIXML

# Online BLAST
result = NCBIWWW.qblast("blastn", "nt", "ATGCGATCGATCGATCG")
blast_records = NCBIXML.parse(result)
for blast_record in blast_records:
    for alignment in blast_record.alignments:
        for hsp in alignment.hsps:
            print(f"Score: {hsp.score}, E-value: {hsp.expect}")
            print(f"Query: {hsp.query[:50]}...")
```

### Phylogenetics

```python
from Bio import Phylo
from Bio.Align.Applications import MafftCommandline
from Bio import AlignIO

# Multiple sequence alignment with MAFFT
mafft = MafftCommandline(input="sequences.fasta")
stdout, stderr = mafft()
with open("aligned.fasta", "w") as f:
    f.write(stdout)

# Read and manipulate trees
tree = Phylo.read("tree.nwk", "newick")
Phylo.draw_ascii(tree)
print(f"Tree has {tree.count_terminals()} terminal nodes")
```

### Database Access (Entrez)

```python
from Bio import Entrez

Entrez.email = "your@email.com"

# Search PubMed
handle = Entrez.esearch(db="pubmed", term="CRISPR gene editing", retmax=10)
record = Entrez.read(handle)
print(f"Found {record['Count']} results")
for id in record["IdList"]:
    fetch = Entrez.efetch(db="pubmed", id=id, rettype="abstract")
    print(fetch.read()[:200])

# Fetch sequences from NCBI
handle = Entrez.efetch(db="nucleotide", id="NM_001301717", rettype="fasta")
print(handle.read())
```

### Common Patterns

```python
# Find ORFs in a DNA sequence
def find_orfs(seq, min_length=300):
    orfs = []
    for frame in range(3):
        for i in range(frame, len(seq) - 2, 3):
            codon = seq[i:i+3]
            if codon == Seq("ATG"):
                for j in range(i+3, len(seq) - 2, 3):
                    stop = seq[j:j+3]
                    if stop in (Seq("TAA"), Seq("TAG"), Seq("TGA")):
                        orf = seq[i:j+3]
                        if len(orf) >= min_length:
                            orfs.append(orf)
                        break
    return orfs

# Codon usage analysis
from Bio import CodonUsage
from CodonUsage.CodonAdaptationIndex import CodonAdaptationIndex
```

## Best Practices

1. Always set `Entrez.email` before using NCBI services
2. Use `SeqIO.index()` for large files (lazy loading)
3. Handle ambiguous bases with `Bio.Data.IUPACData`
4. For large-scale BLAST, use local BLAST+ with `subprocess`
5. Validate input sequences before analysis (check for non-standard characters)
