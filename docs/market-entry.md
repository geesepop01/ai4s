# dshmarket / awesome-dsh-plugin entry

Submit one entry to [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
under the `tools` category. The market app, dshmarket.com and the catalog site
all read that list.

## Chinese

```markdown
- [@geesepop/ai4s](https://github.com/geesepop01/ai4s) — OpenScience 科研插件：370 个科研技能（生物/化学/物理/机器学习/写作）+ 常驻研究循环 + 6 个文献工具（OpenAlex/PubMed/arXiv/Crossref 检索、DOI 解析与开放获取、引用导出、研究状态）。装在宿主层，所有会话模式都能用，不需要选预设；技能目录只放约 60 个，其余按需加载，每轮多约 3.6k token。`dsh plugin --profile web add @geesepop/ai4s`
```

## English

```markdown
- [@geesepop/ai4s](https://github.com/geesepop01/ai4s) — OpenScience as a DeepSeek Harness plugin: 370 research skills (biology, chemistry, physics, ML, writing), an always-on research loop, and six literature tools (OpenAlex/PubMed/arXiv/Crossref search, DOI + open-access lookup, BibTeX/RIS/CSL-JSON export, revision-guarded research state). Registered at the host layer, so every session mode gets it — no preset needed. About 60 skills stay model-visible and the rest load on demand for roughly 3.6k extra tokens per request. `dsh plugin --profile web add @geesepop/ai4s`
```

## Checklist before opening the PR

- [ ] `npm publish` succeeded and `npm view @geesepop/ai4s version` reports the tag.
- [ ] GitHub release `v1.0.0` has the `.tgz` asset from `npm pack`.
- [ ] Repository `geesepop01/ai4s` is public, README renders, LICENSE and NOTICE are present.
- [ ] Two screenshots in `docs/screenshots/` (workbench panel, skill catalog) linked from the README.
- [ ] Entry keeps the awesomeness-list format: one line, package name, link, description, install command.
