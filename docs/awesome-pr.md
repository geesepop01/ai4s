# awesome-dsh-plugin PR 正文

标题：`Add @geesepop01/ai4s`

## 条目（加在 `Tools & Capabilities` 分区）

```markdown
- [@geesepop01/ai4s](https://github.com/geesepop01/ai4s) — OpenScience 科研插件：370 个科研技能（生物/化学/物理/机器学习/写作）+ 常驻研究循环 + 6 个文献工具（OpenAlex/PubMed/arXiv/Crossref 检索、DOI 与开放获取解析、BibTeX/RIS/CSL-JSON 导出、revision 保护的研究状态）。注册在宿主层，所有会话模式都能用，不需要选预设；技能目录只常驻约 60 个，其余按需加载，每轮约多 3.6k token。`dsh plugin --profile web add @geesepop01/ai4s`
```

英文版（如果列表要求英文，用这条）：

```markdown
- [@geesepop01/ai4s](https://github.com/geesepop01/ai4s) — OpenScience as a DeepSeek Harness plugin: 370 research skills (biology, chemistry, physics, ML, writing), an always-on research loop, and six literature tools (OpenAlex/PubMed/arXiv/Crossref search, DOI + open-access lookup, BibTeX/RIS/CSL-JSON export, revision-guarded research state). Registered at the host layer, so every session mode gets it — no preset needed. About 60 skills stay model-visible and the rest load on demand for roughly 3.6k extra tokens per request. `dsh plugin --profile web add @geesepop01/ai4s`
```

## PR 描述模板

```markdown
## What it is

A research plugin for DSH that packages the OpenScience skill library as a host-layer plugin, so every session mode (including the four built-in ones that never select a preset) gets 370 research skills, a research-loop prompt section, six literature tools, and a workbench panel.

## Install

    dsh plugin --profile <profile> add @geesepop01/ai4s

npm: https://www.npmjs.com/package/@geesepop01/ai4s
Release tarball: https://github.com/geesepop01/ai4s/releases/download/v1.0.0/geesepop01-ai4s-1.0.0.tgz

## What it touches

- Registers one skill provider (`ctx.skills`), one prompt section (`ctx.systemPrompt`, ~2.5 KB), six tools (`ctx.tools`) and three host routes (`/ai4s/state|catalog|config`).
- Network: only the six tools' declared scholarly APIs (OpenAlex, PubMed E-utilities, arXiv, Crossref, Unpaywall), through the host's own web provider. No credentials are read except an optional NCBI key the user sets.
- Filesystem: writes research state under `<session workspace>/.openscience/` and bibliography files inside the session working directory.
- Routes are confined to registered workspaces, capped at 1 MB bodies, and refuse cross-site callers.

## Verification

- 71 unit tests (`npm test`), release checks (`node scripts/verify.mjs`) 5/5.
- Live: plugin row active in a desktop profile; `science_search` returned the real 2013 Nature record `doi:10.1038/nature12373`; `science_skill` loaded a hidden skill; state landed in the session workspace.
- Requires `dsh >= 0.2.0` (`engines.dsh`).

## Licence

Apache-2.0; vendored OpenScience skills are Apache-2.0 © Synthetic Sciences, with LICENSE + NOTICE + `upstream/PIN.json` provenance.
```
