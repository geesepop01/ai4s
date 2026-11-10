#!/usr/bin/env python3
"""Query foreign (non-Chinese) scientific databases over their public REST APIs.

Stdlib only. Every subcommand prints machine-readable JSON (or a compact table)
plus the retrieval time, so a result can be traced back to a real call.

Usage
  python dbquery.py check
  python dbquery.py pubmed   "CRISPR base editing" --retmax 5
  python dbquery.py uniprot  "gene:TP53 AND organism_id:9606" --size 3
  python dbquery.py uniprot  P04637
  python dbquery.py crossref "single cell RNA-seq" --rows 3
  python dbquery.py openalex "graph neural network" --per-page 3
  python dbquery.py pubchem  aspirin
  python dbquery.py ensembl  TP53
  python dbquery.py clinvar  BRCA1 --retmax 3
  python dbquery.py trials   "alzheimer" --page-size 3
  python dbquery.py chembl   aspirin
  python dbquery.py pdb      4HHB
  python dbquery.py alphafold P04637
  python dbquery.py geo      "EEG AND epilepsy" --retmax 3
  python dbquery.py reactome TP53
  python dbquery.py string   TP53
  python dbquery.py ena      "study_title=\"epilepsy\""

Options
  --save DIR   write the raw JSON response to DIR/<db>-<slug>.json
  --timeout N  per-request timeout in seconds (default 30)
  --email ADDR contact address sent to NCBI (default: env NCBI_EMAIL)
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

USER_AGENT = "dsh-sciencebuddy/1.1 (+database-api-access skill)"
NCBI_TOOL = "dsh-sciencebuddy"
TIMEOUT = 30.0
RETRIES = 2

# NCBI E-utilities allow 3 requests/second without a key and 10/second with one.
# Pace every NCBI call; a 429 is retried once, never in a loop.
_NCBI_HOST = "ncbi.nlm.nih.gov"
_ncbi_last_call = 0.0


def _ncbi_interval() -> float:
    return 0.105 if os.environ.get("NCBI_API_KEY") else 0.34


def _ncbi_pace(url: str) -> None:
    global _ncbi_last_call
    if _NCBI_HOST not in url:
        return
    wait = _ncbi_last_call + _ncbi_interval() - time.monotonic()
    if wait > 0:
        time.sleep(wait)
    _ncbi_last_call = time.monotonic()


def _now() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


def _request(url: str, params: dict | None = None, timeout: float = TIMEOUT,
             retries: int = RETRIES) -> bytes:
    """GET url with exponential-backoff retries; raise RuntimeError with a callable message."""
    if params:
        url = url + ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    ncbi = _NCBI_HOST in url
    last = None
    for attempt in range(retries + 1):
        _ncbi_pace(url)
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except urllib.error.HTTPError as exc:  # 4xx/5xx: retry only 5xx and 429
            body = exc.read()[:300].decode("utf-8", "replace")
            last = f"HTTP {exc.code} for {url} :: {body.strip()}"
            if exc.code == 429 and ncbi and attempt >= 1:
                raise RuntimeError(last) from exc  # one retry only for NCBI rate limits
            if exc.code < 500 and exc.code != 429:
                raise RuntimeError(last) from exc
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            last = f"network error for {url} :: {exc}"
        time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(last or f"request failed: {url}")


def get_json(url: str, params: dict | None = None, timeout: float = TIMEOUT) -> dict:
    return json.loads(_request(url, params, timeout).decode("utf-8", "replace"))


def get_text(url: str, params: dict | None = None, timeout: float = TIMEOUT) -> str:
    return _request(url, params, timeout).decode("utf-8", "replace")


def ncbi_params(**extra) -> dict:
    email = os.environ.get("NCBI_EMAIL", "")
    api_key = os.environ.get("NCBI_API_KEY", "")
    params = {"tool": NCBI_TOOL, "retmode": "json"}
    if email:
        params["email"] = email
    if api_key:
        params["api_key"] = api_key
    params.update(extra)
    return params


def emit(db: str, payload: dict, args) -> None:
    if getattr(args, "save", None):
        os.makedirs(args.save, exist_ok=True)
        slug = re.sub(r"[^A-Za-z0-9._-]+", "_", str(getattr(args, "query", "result")))[:40]
        path = os.path.join(args.save, f"{db}-{slug}.json")
        with open(path, "w", encoding="utf-8") as fh:
            json.dump({"db": db, "query": getattr(args, "query", None), "retrieved_at": _now(),
                       "response": payload}, fh, ensure_ascii=False, indent=2)
        payload = dict(payload, _saved_to=os.path.abspath(path))
    print(json.dumps({"db": db, "retrieved_at": _now(), "result": payload},
                     ensure_ascii=False, indent=2))


# ── per-database queries ────────────────────────────────────────────────────

def q_pubmed(args) -> tuple[str, dict]:
    ids = get_json("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
                   ncbi_params(db="pubmed", term=args.query, retmax=args.retmax, sort="relevance"))
    idlist = ids.get("esearchresult", {}).get("idlist", [])
    records = []
    if idlist:
        summary = get_json("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi",
                           ncbi_params(db="pubmed", id=",".join(idlist)))
        for pmid in idlist:
            item = summary.get("result", {}).get(pmid, {})
            doi = next((a.get("value") for a in item.get("articleids", [])
                        if a.get("idtype") == "doi"), None)
            records.append({
                "pmid": pmid,
                "title": item.get("title"),
                "journal": item.get("fulljournalname") or item.get("source"),
                "pubdate": item.get("pubdate"),
                "doi": doi,
                "pubtype": item.get("pubtype"),
                "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
            })
    return "pubmed", {"total_hits": ids.get("esearchresult", {}).get("count"), "records": records}


def q_uniprot(args) -> tuple[str, dict]:
    if re.fullmatch(r"[A-Z0-9]{6,10}(-\d+)?", args.query.strip(), re.I) and " " not in args.query:
        data = get_json(f"https://rest.uniprot.org/uniprotkb/{args.query.strip()}.json")
        entries = [data]
    else:
        data = get_json("https://rest.uniprot.org/uniprotkb/search",
                        {"query": args.query, "format": "json", "size": args.size})
        entries = data.get("results", [])
    records = []
    for e in entries:
        entry_type = (e.get("entryType") or "").lower()
        records.append({
            "accession": e.get("primaryAccession"),
            "entry_name": e.get("uniProtkbId"),
            "reviewed": "reviewed" in entry_type and "unreviewed" not in entry_type,
            "entry_type": e.get("entryType"),
            "protein": (e.get("proteinDescription", {}).get("recommendedName", {})
                        .get("fullName", {}).get("value")),
            "genes": [g.get("geneName", {}).get("value") for g in e.get("genes", [])],
            "organism": e.get("organism", {}).get("scientificName"),
            "length": e.get("sequence", {}).get("length"),
            "sequence_version": e.get("entryAudit", {}).get("sequenceVersion"),
            "function": next((c.get("texts", [{}])[0].get("value")
                              for c in e.get("comments", [])
                              if c.get("commentType") == "FUNCTION"), None),
        })
    return "uniprot", {"records": records}


def q_crossref(args) -> tuple[str, dict]:
    data = get_json("https://api.crossref.org/works",
                    {"query": args.query, "rows": args.rows})
    items = data.get("message", {}).get("items", [])
    records = [{
        "doi": it.get("DOI"),
        "title": (it.get("title") or [None])[0],
        "container": (it.get("container-title") or [None])[0],
        "year": (it.get("issued", {}).get("date-parts") or [[None]])[0][0],
        "type": it.get("type"),
        "url": it.get("URL"),
    } for it in items]
    return "crossref", {"total_hits": data.get("message", {}).get("total-results"), "records": records}


def q_openalex(args) -> tuple[str, dict]:
    data = get_json("https://api.openalex.org/works",
                    {"search": args.query, "per-page": args.per_page,
                     "mailto": os.environ.get("OPENALEX_MAILTO", "dsh-sciencebuddy@example.org")})
    records = [{
        "id": it.get("id"),
        "doi": it.get("doi"),
        "title": it.get("display_name"),
        "year": it.get("publication_year"),
        "cited_by": it.get("cited_by_count"),
        "type": it.get("type"),
    } for it in data.get("results", [])]
    return "openalex", {"total_hits": data.get("meta", {}).get("count"), "records": records}


def q_pubchem(args) -> tuple[str, dict]:
    name = urllib.parse.quote(args.query.strip(), safe="")
    data = get_json(f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{name}"
                    "/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName,InChIKey/JSON")
    props = data.get("PropertyTable", {}).get("Properties", [])
    records = [{
        "cid": p.get("CID"),
        "formula": p.get("MolecularFormula"),
        "mw": p.get("MolecularWeight"),
        "smiles": p.get("CanonicalSMILES"),
        "iupac": p.get("IUPACName"),
        "inchikey": p.get("InChIKey"),
        "url": f"https://pubchem.ncbi.nlm.nih.gov/compound/{p.get('CID')}",
    } for p in props]
    return "pubchem", {"records": records}


def q_ensembl(args) -> tuple[str, dict]:
    data = get_json(f"https://rest.ensembl.org/lookup/symbol/homo_sapiens/{urllib.parse.quote(args.query.strip())}",
                    {"content-type": "application/json", "expand": 1})
    return "ensembl", {
        "id": data.get("id"), "display_name": data.get("display_name"),
        "biotype": data.get("biotype"), "assembly": data.get("assembly_name"),
        "chromosome": data.get("seq_region_name"), "start": data.get("start"),
        "end": data.get("end"), "strand": data.get("strand"),
        "description": data.get("description"),
        "transcripts": len(data.get("Transcript", []) or []),
    }


def q_clinvar(args) -> tuple[str, dict]:
    search = get_json("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
                      ncbi_params(db="clinvar", term=f"{args.query}[gene]", retmax=args.retmax))
    idlist = search.get("esearchresult", {}).get("idlist", [])
    records = []
    if idlist:
        summary = get_json("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi",
                           ncbi_params(db="clinvar", id=",".join(idlist)))
        for vid in idlist:
            item = summary.get("result", {}).get(vid, {})
            records.append({
                "variation_id": vid,
                "title": item.get("title"),
                "clinical_significance": item.get("germline_classification", {}).get("description"),
                "review_status": item.get("germline_classification", {}).get("review_status"),
                "url": f"https://www.ncbi.nlm.nih.gov/clinvar/variation/{vid}/",
            })
    return "clinvar", {"total_hits": search.get("esearchresult", {}).get("count"), "records": records}


def q_trials(args) -> tuple[str, dict]:
    data = get_json("https://clinicaltrials.gov/api/v2/studies",
                    {"query.term": args.query, "pageSize": args.page_size, "format": "json"})
    records = []
    for st in data.get("studies", []):
        section = st.get("protocolSection", {})
        ident = section.get("identificationModule", {})
        status = section.get("statusModule", {})
        records.append({
            "nct_id": ident.get("nctId"),
            "title": ident.get("briefTitle"),
            "status": status.get("overallStatus"),
            "start": status.get("startDateStruct", {}).get("date"),
            "url": f"https://clinicaltrials.gov/study/{ident.get('nctId')}",
        })
    return "clinicaltrials", {"records": records}


def q_chembl(args) -> tuple[str, dict]:
    data = get_json("https://www.ebi.ac.uk/chembl/api/data/molecule/search.json",
                    {"q": args.query, "limit": 5})
    records = [{
        "chembl_id": m.get("molecule_chembl_id"),
        "pref_name": m.get("pref_name"),
        "max_phase": m.get("max_phase"),
        "molecule_type": m.get("molecule_type"),
        "first_approval": m.get("first_approval"),
        "url": f"https://www.ebi.ac.uk/chembl/explore/compound/{m.get('molecule_chembl_id')}",
    } for m in data.get("molecules", [])]
    return "chembl", {"records": records}


def q_pdb(args) -> tuple[str, dict]:
    pid = args.query.strip().upper()
    data = get_json(f"https://data.rcsb.org/rest/v1/core/entry/{pid}")
    info = data.get("struct", {})
    return "pdb", {
        "pdb_id": info.get("title") and pid,
        "title": info.get("title"),
        "method": (data.get("exptl") or [{}])[0].get("method"),
        "resolution": (data.get("rcsb_entry_info", {}) or {}).get("resolution_combined"),
        "deposited": (data.get("rcsb_accession_info", {}) or {}).get("deposit_date"),
        "url": f"https://www.rcsb.org/structure/{pid}",
    }


def q_alphafold(args) -> tuple[str, dict]:
    data = get_json(f"https://alphafold.ebi.ac.uk/api/prediction/{args.query.strip()}")
    records = [{
        "uniprot_accession": p.get("uniprotAccession"),
        "entry_id": p.get("entryId"),
        "organism": p.get("organismScientificName"),
        "latest_version": p.get("latestVersion"),
        "pdb_url": p.get("pdbUrl"),
        "cif_url": p.get("cifUrl"),
    } for p in (data if isinstance(data, list) else [data])]
    return "alphafold", {"records": records}


def q_geo(args) -> tuple[str, dict]:
    search = get_json("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
                      ncbi_params(db="gds", term=args.query, retmax=args.retmax))
    idlist = search.get("esearchresult", {}).get("idlist", [])
    records = []
    if idlist:
        summary = get_json("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi",
                           ncbi_params(db="gds", id=",".join(idlist)))
        for uid in idlist:
            item = summary.get("result", {}).get(uid, {})
            acc = item.get("accession")
            records.append({
                "uid": uid, "accession": acc, "title": item.get("title"),
                "taxon": item.get("taxon"), "n_samples": item.get("n_samples"),
                "gdstype": item.get("gdstype"),
                "url": f"https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc={acc}" if acc else None,
            })
    return "geo", {"total_hits": search.get("esearchresult", {}).get("count"), "records": records}


def q_reactome(args) -> tuple[str, dict]:
    data = get_json("https://reactome.org/ContentService/search/query",
                    {"query": args.query, "cluster": "true"})
    entries = []
    for group in data.get("results", []):
        for e in group.get("entries", [])[:5]:
            entries.append({"id": e.get("stId"), "name": e.get("name"),
                            "schema": e.get("schemaClass"), "species": e.get("species")})
    return "reactome", {"records": entries[:10]}


def q_string(args) -> tuple[str, dict]:
    data = get_json("https://string-db.org/api/json/network",
                    {"identifiers": args.query, "species": 9606, "limit": 5})
    records = [{
        "preferredName_A": r.get("preferredName_A"), "preferredName_B": r.get("preferredName_B"),
        "score": r.get("score"), "experimental": r.get("escore"), "database": r.get("dscore"),
    } for r in (data if isinstance(data, list) else [])]
    return "string", {"records": records}


def q_ena(args) -> tuple[str, dict]:
    text = get_text("https://www.ebi.ac.uk/ena/portal/api/search",
                    {"result": "study", "query": args.query, "format": "json", "limit": 5})
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        data = {"raw": text[:400]}
    return "ena", {"records": data if isinstance(data, list) else [data]}


def q_kegg(args) -> tuple[str, dict]:
    text = get_text(f"https://rest.kegg.jp/find/genes/{urllib.parse.quote(args.query.strip())}")
    rows = [line.split("\t") for line in text.strip().splitlines() if line.strip()]
    return "kegg", {"records": [{"kegg_id": r[0], "description": r[1]} for r in rows[:20]]}


# Endpoints verified reachable from the default install. `kegg` is optional: on
# some networks rest.kegg.jp is blackholed (connection timeout on 80 and 443) and
# the check must not fail because of it — the skill documents the fallback.
OPTIONAL_PROBES = {"kegg"}
BLOCKED_FALLBACKS = {
    "kegg": "rest.kegg.jp times out on this network. Use UniProt/Reactome cross-references "
            "(dbquery.py uniprot ... , dbquery.py reactome ...) and say the KEGG record is "
            "unavailable rather than substituting a guess.",
}

PROBES = [
    ("pubmed", "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=cancer&retmode=json&retmax=1"),
    ("uniprot", "https://rest.uniprot.org/uniprotkb/P04637.json"),
    ("crossref", "https://api.crossref.org/works?query=cancer&rows=1"),
    ("openalex", "https://api.openalex.org/works?search=cancer&per_page=1"),
    ("pubchem", "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/aspirin/JSON"),
    ("ensembl", "https://rest.ensembl.org/lookup/symbol/homo_sapiens/TP53?content-type=application/json"),
    ("clinvar", "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=clinvar&term=BRCA1&retmode=json&retmax=1"),
    ("clinicaltrials", "https://clinicaltrials.gov/api/v2/studies?query.term=aspirin&pageSize=1&format=json"),
    ("chembl", "https://www.ebi.ac.uk/chembl/api/data/molecule/search.json?q=aspirin&limit=1"),
    ("pdb", "https://data.rcsb.org/rest/v1/core/entry/4HHB"),
    ("alphafold", "https://alphafold.ebi.ac.uk/api/prediction/P04637"),
    ("geo", "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gds&term=epilepsy&retmode=json&retmax=1"),
    # Light endpoint: the search endpoint returns a few hundred KB and times out
    # on slow links, which would make a healthy Reactome look broken.
    ("reactome", "https://reactome.org/ContentService/data/database/version"),
    ("string", "https://string-db.org/api/json/network?identifiers=TP53&species=9606&limit=1"),
    ("ena", "https://www.ebi.ac.uk/ena/portal/api/search?result=study&query=study_title%3D%22epilepsy%22&format=json&limit=1"),
    ("kegg", "https://rest.kegg.jp/find/genes/TP53"),
]


def do_check(args) -> int:
    rows = []
    for name, url in PROBES:
        started = time.monotonic()
        limit = min(args.timeout, 20) if name not in OPTIONAL_PROBES else min(args.timeout, 8)
        tries = RETRIES if name not in OPTIONAL_PROBES else 0
        try:
            body = _request(url, None, limit, tries)
            rows.append({"db": name, "ok": True, "bytes": len(body),
                         "ms": int((time.monotonic() - started) * 1000)})
        except RuntimeError as exc:
            row = {"db": name, "ok": False, "optional": name in OPTIONAL_PROBES,
                   "error": str(exc)[:200], "ms": int((time.monotonic() - started) * 1000)}
            if name in BLOCKED_FALLBACKS:
                row["fallback"] = BLOCKED_FALLBACKS[name]
            rows.append(row)
    failed = [r["db"] for r in rows if not r["ok"] and not r.get("optional")]
    blocked_optional = [r["db"] for r in rows if not r["ok"] and r.get("optional")]
    print(json.dumps({"checked_at": _now(), "ok": not failed,
                      "reachable": [r["db"] for r in rows if r["ok"]],
                      "unreachable": failed,
                      "unreachable_optional": blocked_optional,
                      "detail": rows},
                     ensure_ascii=False, indent=2))
    return 0 if not failed else 1


HANDLERS = {
    "pubmed": q_pubmed, "uniprot": q_uniprot, "crossref": q_crossref,
    "openalex": q_openalex, "pubchem": q_pubchem, "ensembl": q_ensembl,
    "clinvar": q_clinvar, "trials": q_trials, "chembl": q_chembl,
    "pdb": q_pdb, "alphafold": q_alphafold, "geo": q_geo,
    "reactome": q_reactome, "string": q_string, "ena": q_ena, "kegg": q_kegg,
}


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("db", choices=["check"] + sorted(HANDLERS))
    parser.add_argument("query", nargs="?", help="search term, accession, gene symbol or id")
    parser.add_argument("--retmax", type=int, default=5)
    parser.add_argument("--size", type=int, default=5)
    parser.add_argument("--rows", type=int, default=5)
    parser.add_argument("--per-page", dest="per_page", type=int, default=5)
    parser.add_argument("--page-size", dest="page_size", type=int, default=5)
    parser.add_argument("--save", default=None, help="directory for the raw JSON response")
    parser.add_argument("--timeout", type=float, default=TIMEOUT)
    args = parser.parse_args(argv)

    if args.db == "check":
        return do_check(args)
    if not args.query:
        parser.error(f"{args.db} needs a query")
    try:
        name, payload = HANDLERS[args.db](args)
    except RuntimeError as exc:
        print(json.dumps({"db": args.db, "failed_at": _now(), "error": str(exc)},
                         ensure_ascii=False, indent=2), file=sys.stderr)
        return 2
    emit(name, payload, args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
