# Changelog

## 1.0.0 — 2026-11-10

First release: OpenScience as a DeepSeek Harness plugin rather than an agent preset.

- 370 OpenScience skills vendored from upstream `v1.3.4` (`6de022d`, Apache-2.0), served through dsh's own `skill-filesystem` provider at the host layer, so every session mode gets them.
- Two-tier catalog: 59 curated skills stay model-visible (~3.6k tokens); the rest are `disable-model-invocation` and load through `science_skill`.
- Always-on research-loop prompt section (~2.5KB): eight stages, 30-entry task→skill routing table, citation discipline, Chinese trigger words.
- Tools: `science_search` (OpenAlex / PubMed / arXiv / Crossref), `science_paper` (+ Unpaywall when an email is set), `science_related`, `science_cite` (BibTeX / RIS / CSL-JSON), `science_state` (revision-guarded), `science_skill`.
- Research workbench: sidebar entry + floating panel with state, literature and catalog views; settings section for email, NCBI key and catalog mode.
- Host HTTP routes `/ai4s/state` and `/ai4s/catalog` back the panel; both are read/write-guarded and never require client filesystem access.
- Every upstream failure is a readable result, not a thrown error: rate-limited, not-found, upstream-error, not-configured.
- 64 tests, zero runtime dependencies, no build step.

Known limits:
- The arXiv adapter can hit the host provider's truncation on large Atom responses; the tool reports it as `truncated` rather than pretending the result is complete.
- The panel follows the last research workspace the agent touched; a per-session picker is planned.
- PDF full-text extraction is not bundled; `science_paper` returns the open-access link and the host's file readers take it from there.
