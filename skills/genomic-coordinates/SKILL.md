---
name: genomic-coordinates
description: Handle genomic coordinates correctly — conversions, assembly liftover, variant normalization, and contig naming. Use whenever coordinates cross a format, tool, or assembly boundary.
category: biology
tags: [coordinates, liftover, variants, assemblies, bed-files]
disable-model-invocation: true
---

# Genomic Coordinates

Coordinate errors are silent and catastrophic. Every downstream result inherits
them. This skill is the discipline for moving coordinates across boundaries.

## Coordinate systems

| System | Basis | Range |
|---|---|---|
| Ensembl / VCF | 1-based, inclusive | [start, end] |
| BED / BAM / bigWig | 0-based, half-open | [start, end) |
| GFF/GTF | 1-based, inclusive | [start, end] |
| Python slicing | 0-based, half-open | [start, end) |

**Conversion:** `bed_start = gff_start - 1`, `bed_end = gff_end`. The most
common bug in genomics is forgetting this.

## Assembly identity

**Always record the assembly:** GRCh38/hg38, GRCh37/hg19, T2T-CHM13, mm39.
Coordinates from different assemblies are not comparable without liftover.

```bash
# Liftover
liftOver input.bed hg19ToHg38.over.chain.gz output.bed unmapped.bed
```

```python
# pyliftover
from pyliftover import LiftOver
lo = LiftOver("hg19ToHg38.over.chain.gz")
lo.convert_coordinate("chr1", 1000000, "+")
```

- **Report the number unmapped.** Unmapped regions are gaps/structural
  differences; silently dropping them changes the analysis.
- **Multi-mapping regions** map to several locations; record all mappings.

## Variant normalization

The same variant can be represented differently:

```
Reference:  ...A T C G...      Position 100
Variant 1:  ATCG → ATTG  (substitution at 103)
Variant 2:  TCG → TTG   (same variant, left-aligned differently)
```

**Normalization (left-alignment and parsimony):**

```bash
bcftools norm -f reference.fa -m -any input.vcf > normalized.vcf
```

- **Left-align** indels against the reference.
- **Trim** redundant bases.
- **Split multiallelics** (`-m -any`) for per-variant analysis.
- **Match on the normalized representation**, never on the raw string.

## Contig naming

`chr1` vs `1` vs `NC_000001.11` — the same chromosome, three conventions.
Tools fail silently on mismatch.

```python
# Harmonize explicitly
if not df["chrom"].str.startswith("chr").any():
    df["chrom"] = "chr" + df["chrom"]
```

**Record the convention and normalize before every merge.**

## Interval operations

- **`bedtools` operations** require the same coordinate system and the same
  assembly.
- **`bedtools intersect -s`** for strand-specific; `-f`/`-r` for reciprocal
  overlap.
- **Check the result count** after every interval operation.

## Verification

Before trusting a coordinate-based result:

- [ ] Assembly recorded and consistent across inputs.
- [ ] Coordinate conversion tested on a known position.
- [ ] Contig naming harmonized.
- [ ] Variants normalized and left-aligned.
- [ ] Liftover unmapped regions reported.
- [ ] A known feature lands where it should (sanity check).

## Common errors

- Off-by-one from mixing 1-based and 0-based.
- Coordinates compared across assemblies.
- `chr1` vs `1` mismatches causing empty results.
- Unnormalized variants failing to merge.
- Liftover silently dropping regions.
