#!/usr/bin/env python3
"""Query public scientific databases from the command line.

Standard library only (certifi is used when importable). Works on Python 3.8+.

Usage:
    python query_db.py uniprot TP53
    python query_db.py pubmed "CRISPR off-target" --limit 5
    python query_db.py pdb 1TUP --json
    python query_db.py --list

Every endpoint here was verified reachable. Endpoints that commonly fail
(KEGG, ClinicalTrials.gov, Semantic Scholar) are listed in FAILING below and
the reference SKILL.md explains the fallback for each.
"""

import argparse
import json
import re
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

UA = "dsh-science-research/1.0 (research agent; contact: researcher@example.org)"
ARXIV_NS = {"a": "http://www.w3.org/2005/Atom"}

FAILING = {
    "kegg": "rest.kegg.jp was unreachable from the development network; try the "
            "KEGG web UI or a mirror, or use Reactome for pathway coverage.",
    "clinicaltrials": "clinicaltrials.gov returned HTTP 403 from the development "
                      "network (WAF/geo). Use the web_fetch tool on the study URL instead.",
    "semanticscholar": "api.semanticscholar.org returns HTTP 429 without an API key. "
                       "Request a key or fall back to OpenAlex / Crossref.",
}


def _ssl_contexts():
    """Return (preferred, fallback). Prefer certifi's CA bundle when present."""
    try:
        import certifi  # type: ignore
        return ssl.create_default_context(cafile=certifi.where()), None
    except Exception:
        return ssl.create_default_context(), ssl._create_unverified_context()


_PREFERRED, _FALLBACK = _ssl_contexts()


def http_get(url, timeout=60, retries=2):
    """GET a URL, retrying transient failures and falling back on CA errors."""
    last = None
    for attempt in range(retries + 1):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=timeout, context=_PREFERRED) as resp:
                return resp.read()
        except ssl.SSLCertVerificationError as exc:
            last = exc
            if _FALLBACK is None:
                raise
            sys.stderr.write(
                "warning: CA verification failed, retrying unverified "
                "(install/refresh certifi to avoid this)\n"
            )
            with urllib.request.urlopen(req, timeout=timeout, context=_FALLBACK) as resp:
                return resp.read()
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            last = exc
            if attempt < retries:
                time.sleep(1.5 * (attempt + 1))
                continue
            raise
    raise last


def get_json(url, timeout=60):
    return json.loads(http_get(url, timeout=timeout).decode("utf-8", "replace"))


def q(value):
    return urllib.parse.quote(str(value), safe="")


_TAG = re.compile(r"<[^>]+>")


def strip_tags(text):
    """Drop simple HTML markup, e.g. Reactome's highlighting <span> wrappers."""
    return " ".join(_TAG.sub(" ", str(text)).split())


# --------------------------------------------------------------------------
# Per-database query functions. Each returns (lines, raw) where `lines` is the
# human summary and `raw` is JSON-serializable (or None with --json omitted).
# --------------------------------------------------------------------------

def db_uniprot(term, limit):
    url = ("https://rest.uniprot.org/uniprotkb/search?query=" + q(term)
           + "&fields=accession,protein_name,gene_primary,organism_name,length"
           + "&format=json&size=" + str(limit))
    data = get_json(url)
    lines = []
    for entry in data.get("results", []):
        acc = entry.get("primaryAccession", "?")
        name = ""
        desc = entry.get("proteinDescription", {}) or {}
        rec = desc.get("recommendedName") or {}
        if rec.get("fullName"):
            name = rec["fullName"].get("value", "")
        genes = entry.get("genes") or [{}]
        gene = ((genes[0].get("geneName") or {}).get("value")) if genes else None
        org = (entry.get("organism") or {}).get("scientificName", "")
        lines.append("%s | %s | gene=%s | %s | len=%s"
                     % (acc, name, gene or "-", org, entry.get("sequence", {}).get("length", "-")))
    return lines, data


def db_pdb(entry_id, limit):
    url = "https://data.rcsb.org/rest/v1/core/entry/" + q(entry_id)
    data = get_json(url)
    info = data.get("struct", {}) or {}
    title = info.get("title", "")
    method = ((data.get("exptl") or [{}])[0]).get("method", "")
    resolution = ((data.get("rcsb_entry_info") or {}).get("resolution_combined") or ["-"])[0]
    lines = ["%s | %s | method=%s | resolution=%s A"
             % (data.get("rcsb_id", entry_id), title, method, resolution)]
    return lines, data


def db_ensembl(symbol, limit):
    url = ("https://rest.ensembl.org/lookup/symbol/homo_sapiens/" + q(symbol)
           + "?content-type=application/json")
    data = get_json(url)
    lines = ["%s | %s | %s:%s-%s (%s) | biotype=%s"
             % (data.get("display_name", symbol), data.get("id", "?"),
                data.get("seq_region_name", "?"), data.get("start", "?"),
                data.get("end", "?"), data.get("strand", "?"), data.get("biotype", "?"))]
    if data.get("description"):
        lines.append("description: " + data["description"])
    return lines, data


def _eutils(db, term, limit, retmode="json"):
    url = ("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=" + q(db)
           + "&term=" + q(term) + "&retmode=" + retmode + "&retmax=" + str(limit))
    return get_json(url)


def db_pubmed(term, limit):
    search = _eutils("pubmed", term, limit)
    ids = (search.get("esearchresult") or {}).get("idlist", [])
    total = (search.get("esearchresult") or {}).get("count", "0")
    lines = ["PubMed hits: %s (showing %d)" % (total, len(ids))]
    if ids:
        url = ("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id="
               + ",".join(ids) + "&retmode=json")
        summary = get_json(url)
        for pid, rec in (summary.get("result") or {}).items():
            if pid == "uids":
                continue
            lines.append("PMID %s | %s | %s | %s"
                         % (pid, rec.get("pubdate", "?"),
                            rec.get("source", "?"), rec.get("title", "")[:120]))
    return lines, {"search": search}


def db_geo(term, limit):
    search = _eutils("gds", term, limit)
    ids = (search.get("esearchresult") or {}).get("idlist", [])
    total = (search.get("esearchresult") or {}).get("count", "0")
    lines = ["GEO hits: %s (showing %d)" % (total, len(ids))]
    if ids:
        url = ("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gds&id="
               + ",".join(ids) + "&retmode=json")
        summary = get_json(url)
        for gid, rec in (summary.get("result") or {}).items():
            if gid == "uids":
                continue
            lines.append("%s | %s" % (rec.get("accession", gid),
                                      strip_tags(rec.get("title", ""))[:120]))
    return lines, {"search": search}


def db_arxiv(term, limit):
    url = ("https://export.arxiv.org/api/query?search_query=all:" + q(term)
           + "&max_results=" + str(limit))
    root = ET.fromstring(http_get(url, timeout=90))
    lines = []
    for entry in root.findall("a:entry", ARXIV_NS):
        title = " ".join((entry.findtext("a:title", "", ARXIV_NS) or "").split())
        published = (entry.findtext("a:published", "", ARXIV_NS) or "")[:10]
        link = entry.findtext("a:id", "", ARXIV_NS)
        lines.append("%s | %s | %s" % (published, title[:120], link))
    return lines, None


def db_openalex(term, limit):
    url = ("https://api.openalex.org/works?search=" + q(term)
           + "&per-page=" + str(limit))
    data = get_json(url)
    lines = []
    for work in data.get("results", []):
        lines.append("%s | %s | cites=%s | %s"
                     % (work.get("publication_year", "?"),
                        (work.get("title") or "")[:110],
                        work.get("cited_by_count", 0),
                        work.get("doi") or "-"))
    return lines, data


def db_crossref(term, limit):
    url = ("https://api.crossref.org/works?query.bibliographic=" + q(term)
           + "&rows=" + str(limit)
           + "&select=DOI,title,container-title,issued,author")
    data = get_json(url)
    lines = []
    for item in (data.get("message") or {}).get("items", []):
        title = (item.get("title") or [""])[0]
        venue = (item.get("container-title") or [""])[0]
        year = ((item.get("issued") or {}).get("date-parts") or [["?"]])[0][0]
        lines.append("%s | %s | %s | %s" % (year, title[:110], venue[:50], item.get("DOI", "-")))
    return lines, data


def db_chembl(term, limit):
    url = ("https://www.ebi.ac.uk/chembl/api/data/molecule/search?q=" + q(term)
           + "&format=json&limit=" + str(limit))
    data = get_json(url)
    lines = []
    for mol in data.get("molecules", []):
        props = mol.get("molecule_properties") or {}
        lines.append("%s | %s | formula=%s | MW=%s"
                     % (mol.get("molecule_chembl_id", "?"),
                        mol.get("pref_name") or "-",
                        props.get("full_molformula", "-"),
                        props.get("full_mwt", "-")))
    return lines, data


def db_pubchem(term, limit):
    url = ("https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/" + q(term)
           + "/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName/JSON")
    data = get_json(url)
    lines = []
    for prop in (data.get("PropertyTable") or {}).get("Properties", []):
        lines.append("CID %s | %s | MW=%s | %s"
                     % (prop.get("CID", "?"), prop.get("MolecularFormula", "?"),
                        prop.get("MolecularWeight", "?"),
                        prop.get("IUPACName", "")[:80]))
    return lines, data


def db_string(term, limit):
    ids = "%0d".join(part.strip() for part in str(term).split(",") if part.strip())
    url = ("https://string-db.org/api/json/network?identifiers=" + ids
           + "&species=9606&limit=" + str(limit))
    data = get_json(url)
    pairs = set()
    for edge in data if isinstance(data, list) else []:
        pairs.add("%s -- %s (%s)" % (edge.get("preferredName_A", "?"),
                                     edge.get("preferredName_B", "?"),
                                     edge.get("score", "?")))
    lines = ["STRING interactions: %d" % len(pairs)]
    lines.extend(sorted(pairs)[:limit])
    return lines, data


def db_reactome(term, limit):
    url = ("https://reactome.org/ContentService/search/query?query=" + q(term)
           + "&species=Homo%20sapiens")
    data = get_json(url)
    lines = []
    for group in data.get("results", []):
        for entry in group.get("entries", [])[:limit]:
            lines.append("%s | %s | %s"
                         % (entry.get("stId", "?"), strip_tags(entry.get("name", ""))[:90],
                            entry.get("exactType", "")))
    return lines[:limit], data


DATABASES = {
    "uniprot": db_uniprot,
    "pdb": db_pdb,
    "ensembl": db_ensembl,
    "pubmed": db_pubmed,
    "geo": db_geo,
    "arxiv": db_arxiv,
    "openalex": db_openalex,
    "crossref": db_crossref,
    "chembl": db_chembl,
    "pubchem": db_pubchem,
    "string": db_string,
    "reactome": db_reactome,
}


def main(argv=None):
    # Windows consoles default to a legacy code page; force UTF-8 so publisher
    # titles and non-ASCII author names survive instead of turning into mojibake.
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    parser = argparse.ArgumentParser(
        description="Query public scientific databases.",
        epilog="Unknown/failing endpoints: " + ", ".join(sorted(FAILING)))
    parser.add_argument("database", nargs="?", help="one of: " + ", ".join(sorted(DATABASES)))
    parser.add_argument("query", nargs="?", help="search term, identifier, or comma list")
    parser.add_argument("--limit", type=int, default=5, help="max results (default 5)")
    parser.add_argument("--json", action="store_true", help="print the raw JSON payload")
    parser.add_argument("--list", action="store_true", help="list databases and exit")
    args = parser.parse_args(argv)

    if args.list or not args.database:
        print("available databases:")
        for key in sorted(DATABASES):
            print("  " + key)
        if not args.database and not args.list:
            return 2
        return 0

    if args.database in FAILING:
        sys.stderr.write("note: %s is documented as unreliable here. %s\n"
                         % (args.database, FAILING[args.database]))
        return 3

    handler = DATABASES.get(args.database)
    if handler is None:
        sys.stderr.write("unknown database %r; run with --list\n" % args.database)
        return 2
    if not args.query:
        sys.stderr.write("a query term is required for %s\n" % args.database)
        return 2

    try:
        lines, raw = handler(args.query, args.limit)
    except urllib.error.HTTPError as exc:
        sys.stderr.write("HTTP %s from %s\n" % (exc.code, args.database))
        return 4
    except Exception as exc:  # network, parse, or timeout
        sys.stderr.write("%s: %s\n" % (type(exc).__name__, exc))
        return 5

    if args.json:
        print(json.dumps(raw if raw is not None else {"lines": lines}, indent=2)[:20000])
    else:
        for line in lines:
            print(line)
        if not lines:
            print("(no results)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
