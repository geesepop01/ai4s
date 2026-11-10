# OpenScience 科研插件 `@geesepop01/ai4s` 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把「科研模式」预设升级为可分发的 DSH 插件：装一次，任何会话模式都有 371 个科研技能、常驻引导段、6 个科研工具和一个研究工作台面板。

**Architecture:** 纯 ESM、零构建、零运行时依赖的 Cordis bundle。Host 半（`index.js` + `lib/`）在宿主层注册技能 provider、系统提示段、6 个工具、状态 HTTP 路由；Client 半（`client.js`）用 `window.__ModuleLoader__` 注册 `sidebar.panellist` 图标与 `shell.overlay` 浮层工作台。技能库是上游 v1.3.4 的原样 vendored 副本。

**Tech Stack:** Node 24+ ESM、`node:test`、Cordis 插件（`ctx.skills` / `ctx.systemPrompt` / `ctx.tools` / `ctx.web` / `ctx.webServer` / `ctx.credentials`）、React（由宿主注入，不自带构建）。

**Spec:** `docs/superpowers/specs/2026-11-10-openscience-plugin-design.md`

## Global Constraints

- 目标宿主：`@deepseek-ai/dsh-*` ≥ 0.2.0；`package.json` 声明 `"engines": { "dsh": ">=0.2.0-0" }`。
- 零运行时依赖；`@deepseek-ai/dsh-tools`、`@deepseek-ai/dsh-skill-filesystem`、Client 侧 `@deepseek-ai/dsh-client-ui-*` 只作为 **peerDependencies**（skill-filesystem 标 `optional: true`），并且 **懒 import**，缺包时降级不崩。
- 包名 `@geesepop01/ai4s`；插件行 id `openscience`；技能 provider 名 `openscience`；prompt section 名 `openscience:bootstrap`，order `121`。
- 技能数 371；`curated` 名单（模型可见）≤ 60；其余 frontmatter 加 `disable-model-invocation: true`。
- 工具名固定 6 个：`science_search`、`science_paper`、`science_related`、`science_cite`、`science_state`、`science_skill`。
- 出网只走 `ctx.web.fetch({url})`（只接受 url，无 header/method）；非 2xx 是结果不是异常；工具失败返回可读文本，**绝不抛错打断回合**。
- 模型面文案（bootstrap、工具 description）用**英文**，bootstrap 末尾附一行中文触发词。
- UI 文案只进 `locale/en.json`、`locale/zh-CN.json`；颜色只用 `ctx.theme` token。
- 状态文件：`<session.cwd>/.openscience/state.json`，`schemaVersion: 1`，写入用 `revision` 乐观锁 + 原子 rename。
- 上游许可 Apache-2.0：随包 `LICENSE`、`NOTICE`、`upstream/PIN.json`（仓库、commit、tag、许可、curated 名单、被改过的 frontmatter 清单）。
- 提交信息用 `feat:` / `test:` / `docs:` / `chore:` 前缀；每个任务一次提交。

## Review Focus

用这份清单在实现时挡住"规格没说、但用户一定会踩"的输入；每条都在指定任务的测试里钉住。

1. **没有 web provider / 选择失败**（`WEB_PROVIDER_UNAVAILABLE`、`WEB_PROVIDER_AMBIGUOUS`）：用户没配搜索源时，6 个工具里 5 个应该给"未配置联网取数，怎么配"的可读结论，`science_skill`/`science_state` 照常可用 → Task 13。
2. **非 2xx 与限速**（429/503/404）：应返回"限速/未找到/上游故障"的文字，不抛错、不空转重试 → Task 5。
3. **状态文件被外部改坏或并发写**：JSON 损坏要能回到空状态并备份坏文件；`expectedRevision` 不匹配要返回冲突提示而不是覆盖 → Task 10。
4. **SKILL.md frontmatter 损坏或名字非法**：一个坏技能不能让 371 个全部消失，provider 要跳过并 warn → Task 3。
5. **大结果/超长摘要/`truncated`**：单条摘要 ≤ 600 字符、单次最多 25 条、结果超限要明说"已截断" → Task 6。

---

### Task 1: 包骨架、manifest 与授权文件

**Files:**
- Create: `package.json`, `cordis.patch.yml`, `LICENSE`, `NOTICE`, `icon.svg`, `locale/en.json`, `locale/zh-CN.json`, `.gitignore`
- Test: `tests/manifest.test.mjs`

**Interfaces:**
- Produces: 一个可被 `plugin_manager install_bundle` 识别的包：`dsh.bundle.patch`、`exports["."]`、`exports["./client"]`、`dsh.client`。

- [ ] **Step 1: 写失败测试** `tests/manifest.test.mjs`

```js
test('manifest declares bundle, client and engine floor', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(pkg.name, '@geesepop01/ai4s')
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(pkg.dsh.client.platform, 'web')
  assert.match(pkg.engines.dsh, />=0\.2\.0/)
  for (const f of ['index.js', 'client.js', 'cordis.patch.yml', 'LICENSE', 'NOTICE', 'icon.svg']) {
    assert.ok(existsSync(new URL(`../${f}`, import.meta.url)), `${f} missing`)
  }
})
test('patch inserts the openscience row and mounts index.js', async () => {
  const yaml = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
  assert.match(yaml, /id: openscience/)
  assert.match(yaml, /name: '\.\/index\.js'/)
})
```

- [ ] **Step 2: 运行确认失败** — `node --test tests/manifest.test.mjs` → FAIL（package.json 不存在）

- [ ] **Step 3: 写 `package.json`**

```json
{
  "name": "@geesepop01/ai4s",
  "version": "1.0.0",
  "type": "module",
  "description": "OpenScience for DeepSeek Harness: 371 research skills, literature tools and a research workbench for any session.",
  "exports": { ".": "./index.js", "./client": "./client.js", "./package.json": "./package.json" },
  "files": ["index.js", "client.js", "lib", "skills", "locale", "upstream", "icon.svg", "cordis.patch.yml", "README.md", "README.zh-CN.md", "CHANGELOG.md", "LICENSE", "NOTICE"],
  "keywords": ["dsh", "dsh-plugin", "deepseek-harness", "openscience", "research", "skills", "literature"],
  "license": "Apache-2.0",
  "engines": { "node": ">=24", "dsh": ">=0.2.0-0" },
  "dsh": { "bundle": { "patch": "./cordis.patch.yml" }, "client": { "platform": "web", "immediately": true } },
  "peerDependencies": {
    "@deepseek-ai/dsh-tools": "^0.2.0-0",
    "@deepseek-ai/dsh-skill-filesystem": "^0.2.0-0"
  },
  "peerDependenciesMeta": { "@deepseek-ai/dsh-skill-filesystem": { "optional": true } },
  "scripts": { "test": "node --test tests/", "verify": "node scripts/verify.mjs" }
}
```

- [ ] **Step 4: 写 `cordis.patch.yml`**

```yaml
- insert:
    - id: openscience
      name: './index.js'
      config:
        mailto: ''
        catalogMode: curated
        bootstrap: true
        stateDir: .openscience
```

- [ ] **Step 5: 写 LICENSE（Apache-2.0 全文）、NOTICE、icon.svg、locale 空骨架**

`NOTICE` 首行固定为：

```
This product includes software developed by Synthetic Sciences, Inc.
(OpenScience, https://github.com/synthetic-sciences/OpenScience, Apache-2.0).
```

`icon.svg`：64×64 圆角方块 + 分子/烧瓶线条图形，主色 `#2f6f4e`（深绿），不描他人商标。

- [ ] **Step 6: 运行测试** — `node --test tests/manifest.test.mjs` → PASS

- [ ] **Step 7: 提交** — `git init && git add -A && git commit -m "chore: scaffold ai4s plugin package"`

---

### Task 2: 技能库 vendoring、PIN 与 curated 名单

**Files:**
- Create: `scripts/sync-skills.mjs`, `upstream/PIN.json`, `skills/**`（371 个目录）
- Test: `tests/skills-tree.test.mjs`

**Interfaces:**
- Produces: `upstream/PIN.json` 形如 `{repository, commit, tag, license, syncedAt, curated: string[], hidden: string[], patchedFrontmatter: string[]}`；`skills/<dir>/SKILL.md` 371 个。

- [ ] **Step 1: 写失败测试** — 断言：`skills/` 下 `SKILL.md` 数量 = 371；每个 frontmatter 的 `name` 匹配 `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` 且非空 `description`；`PIN.curated.length <= 60` 且 ⊆ 全部名字；`hidden.length + curated.length >= 371`；无重名。

- [ ] **Step 2: 运行确认失败** — `node --test tests/skills-tree.test.mjs` → FAIL

- [ ] **Step 3: 写 `scripts/sync-skills.mjs`**

职责：从 `SOURCE_DIR`（默认 `C:/Users/hangj/.dsh/bundles/science-research-preset/skills`，可用 `--source` 覆盖）递归复制到 `./skills`；对每个 `SKILL.md` 解析 frontmatter；按 `CURATED` 常量名单（写在脚本里，≤60 个，覆盖 biology/chem/physics/data/writing/compute 六个分区各 8–10 个核心技能）把非 curated 技能的 frontmatter 追加 `disable-model-invocation: true`（已存在则跳过）；写 `upstream/PIN.json`，`patchedFrontmatter` 记录被改过的技能名；幂等（重复运行不叠加）。

- [ ] **Step 4: 运行同步脚本** — `node scripts/sync-skills.mjs` → 输出 `copied=371 curated=NN hidden=MM`

- [ ] **Step 5: 运行测试** — `node --test tests/skills-tree.test.mjs` → PASS

- [ ] **Step 6: 提交** — `git add skills upstream scripts tests && git commit -m "feat: vendor 371 OpenScience skills with curated visibility tiers"`

> 注意：`skills/` 有 18MB，`.gitignore` 不要排除它（发布物需要）；提交一次即可，后续同步用脚本。

---

### Task 3: 技能 provider 与降级

**Files:**
- Create: `lib/paths.js`, `lib/skills.js`
- Test: `tests/skills-provider.test.mjs`

**Interfaces:**
- Produces:
  - `packageRoot(): string`、`skillsRoot(): string`（`lib/paths.js`）
  - `registerSkills(ctx, { dir, mode, logger }): () => void`（`lib/skills.js`）
  - `skillCatalog(dir): Promise<Array<{ name, description, category }>>`
  - `readSkill(dir, name): Promise<{ name, description, content, baseDir } | undefined>`
  - `isValidSkillName(name): boolean`

- [ ] **Step 1: 写失败测试** — fake ctx `{ skills: { registerProvider(fn) { captured = fn({ signal, invalidate(){} }); return () => {} } } }`：
  1. `registerSkills` 调用一次 `registerProvider`，provider `name === 'openscience'`；
  2. `await provider.list({})` 返回 371 条候选，`mode: 'curated'` 时 `candidates.filter(c => c.invocation.modelInvocable).length <= 60`；
  3. 在一个临时目录放入一个 frontmatter 损坏的 `SKILL.md` 时，`skillCatalog` 跳过它并 warn，其余正常返回（Review Focus 4）。

- [ ] **Step 2: 运行确认失败**

- [ ] **Step 3: 实现**

`registerSkills` 懒 import `@deepseek-ai/dsh-skill-filesystem`：

```js
const mod = await import('@deepseek-ai/dsh-skill-filesystem')   // 失败 → logger.warn 并 return no-op
```

mount 一个私有实例，`rank: 600`、`name: 'openscience'`、目录指向 `dir`；`mode === 'curated'` 时在 `list()` 结果上把 `hidden` 集合的候选 `invocation.modelInvocable = false`（保留 `userInvocable: true`），`mode === 'all'` 时全部可见。`skillCatalog`/`readSkill` 自己解析 `SKILL.md`（frontmatter 用极简解析：首个 `---` 块内的 `key: value` 行，不引入 YAML 依赖），名字非法或解析失败的条目跳过并 `logger.warn('skip skill <path>: <reason>')`。

- [ ] **Step 4: 运行测试** → PASS

- [ ] **Step 5: 提交** — `git commit -m "feat: register vendored skills through dsh skill-filesystem"`

---

### Task 4: 常驻引导段

**Files:**
- Create: `lib/bootstrap.js`
- Modify: `index.js`（新建，注册 section）
- Test: `tests/bootstrap.test.mjs`

**Interfaces:**
- Produces: `bootstrapText({ catalogMode }): string`；`BOOTSTRAP_SECTION = 'openscience:bootstrap'`、`BOOTSTRAP_ORDER = 121`。

- [ ] **Step 1: 写失败测试** — 断言包含 8 个阶段名、至少 30 行 `任务 → 技能`、`science_search`/`science_skill` 的用法句、中文触发词行；`Buffer.byteLength(text) < 2000`（≈450 token）；`catalogMode: 'all'` 时不含"用 science_skill 加载目录外技能"那句。

- [ ] **Step 2: 运行确认失败**

- [ ] **Step 3: 实现** — 纯字符串模板，结构：`## Research loop`（8 阶段 + 每阶段产物）、`## Route`（40 行 `- literature review → skill: literature-review`）、`## Tools`、`## Rules`（引用纪律、别臆造 DOI、失败要说失败）、末行 `中文触发词：文献综述 / 假设 / 实验设计 / 统计分析 / 画图 / 写论文 / 复现`。

- [ ] **Step 4: 运行测试** → PASS

- [ ] **Step 5: 提交** — `git commit -m "feat: add always-on research bootstrap prompt section"`

---

### Task 5: 出网包装（限速、超时、错误映射）

**Files:**
- Create: `lib/http.js`, `lib/errors.js`
- Test: `tests/http.test.mjs`

**Interfaces:**
- Produces:
  - `createHttpClient({ web, sleep = defaultSleep, timeoutMs = 12000 }): { getJson(url): Promise<JsonResult> }`
  - `JsonResult = { ok: true, status, body } | { ok: false, status, reason }`，`reason ∈ 'rate-limited' | 'not-found' | 'upstream-error' | 'network' | 'truncated-parse'`
  - `class RateLimiter { constructor(minIntervalMs); run(fn) }`

- [ ] **Step 1: 写失败测试** — 用 fake `web.fetch` 覆盖：200 JSON；429；404；503；返回 `body.kind === 'html'` 的 HTML 错误页；`fetch` 抛 `Error('WEB_PROVIDER_UNAVAILABLE')`。断言 `ok/reason` 映射，且**任何情况都不抛**；`RateLimiter` 断言两次调用的 `sleep` 参数 ≥ `minIntervalMs`（Review Focus 2、1）。

- [ ] **Step 2: 运行确认失败**

- [ ] **Step 3: 实现** — `getJson` 用 `Promise.race` 实现超时；`truncated: true` 时仍尝试解析，解析失败 → `reason: 'truncated-parse'` 并在结果里带 `status`；`WEB_PROVIDER_*` 错误映射为 `reason: 'network'` 且 `message` 明确写"宿主未配置联网取数"。

- [ ] **Step 4: 运行测试** → PASS

- [ ] **Step 5: 提交** — `git commit -m "feat: add polite web fetch wrapper with error mapping"`

---

### Task 6: `science_search`

**Files:**
- Create: `lib/sources.js`, `lib/tools/search.js`, `tests/fixtures/*.json`
- Test: `tests/search.test.mjs`

**Interfaces:**
- Consumes: `createHttpClient`、`RateLimiter`
- Produces: `createSearchTool({ client, config, logger }): ToolDefinition`；`Entry = { title, authors: string[], year?: number, venue?, doi?, pmid?, arxivId?, url?, abstract? }`；`dedupe(entries): Entry[]`；`normalizeEntry(raw, source): Entry`

- [ ] **Step 1: 写失败测试** — 用 fixture（OpenAlex/PubMed/arXiv/Crossref 各一份，取自设计文档里实测过的 URL 结构）：断言归一化字段、按 DOI 去重、按年份过滤、`limit` 上限 25、摘要截断到 600 字符、多源部分失败时返回其余结果并在 `notes` 里说明（Review Focus 5）。

- [ ] **Step 2: 运行确认失败**

- [ ] **Step 3: 实现** — 四个 `search<Source>(client, { query, limit, yearFrom, yearTo, mailto })`，URL 全部带 `mailto`（Crossref/OpenAlex）或 `email`（Unpaywall 在 Task 8）；PubMed 用 `esearch` + `esummary`；arXiv 用 Atom 并做正则抽取；工具 `execute` 组装 `{ entries, notes, truncated }`，且把 `entries` 序列化成模型易读的紧凑文本。

- [ ] **Step 4: 运行测试** → PASS
- [ ] **Step 5: 提交** — `git commit -m "feat: add science_search across openalex/pubmed/arxiv/crossref"`

---

### Task 7: `science_related`

**Files:**
- Create: `lib/tools/related.js`
- Test: `tests/related.test.mjs`

**Interfaces:**
- Produces: `createRelatedTool({ client, config, logger }): ToolDefinition`；入参 `{ id, limit?, direction?: 'references' | 'citations' | 'related' }`。

- [ ] **Step 1: 写失败测试** — OpenAlex `related_works` / `referenced_works` / `cited_by` fixture；断言方向映射、空结果返回"未找到关联文献"文本而非抛错、未知 id 返回可读 404 结论。
- [ ] **Step 2: 运行确认失败**
- [ ] **Step 3: 实现** — 先 `science_paper` 解析 id → OpenAlex work id，再取关联集合并批量 hydrate 成 `Entry[]`（复用 Task 6 的 `normalizeEntry`）。
- [ ] **Step 4: 运行测试** → PASS
- [ ] **Step 5: 提交** — `git commit -m "feat: add science_related"`

---

### Task 8: `science_paper`（含 Unpaywall）

**Files:**
- Create: `lib/tools/paper.js`
- Test: `tests/paper.test.mjs`

**Interfaces:**
- Consumes: `normalizeEntry`、`createHttpClient`
- Produces: `createPaperTool({ client, config, logger }): ToolDefinition`；入参 `{ id, includePdf?: boolean }`；返回 `{ entry, pdfUrl?, oaStatus? }`。

- [ ] **Step 1: 写失败测试** — DOI → Crossref/OpenAlex fixture、PMID → PubMed fixture、arXiv id → Atom fixture；Unpaywall 200（有 OA）与 404（无 OA）两例，断言无 `mailto` 时**不请求** Unpaywall 且返回 `oaStatus: 'unknown'`。
- [ ] **Step 2: 运行确认失败**
- [ ] **Step 3: 实现** — id 类型判别（正则：`10.\d{4,9}/...`、`^\d{6,9}$`、`\d{4}\.\d{4,5}(v\d+)?`、`W\d+`）；`includePdf !== false` 且 `config.mailto` 非空时才查 Unpaywall。
- [ ] **Step 4: 运行测试** → PASS
- [ ] **Step 5: 提交** — `git commit -m "feat: add science_paper with open-access lookup"`

---

### Task 9: `science_cite`

**Files:**
- Create: `lib/cite.js`, `lib/tools/cite.js`
- Test: `tests/cite.test.mjs`

**Interfaces:**
- Produces: `toBibTeX(entry): string`、`toRIS(entry): string`、`toCslJson(entry): object`、`createCiteTool({ client, config, logger })`；入参 `{ ids: string[], format?: 'bibtex'|'ris'|'csljson', out?: string }`，默认落盘 `.openscience/citations/refs.bib`。

- [ ] **Step 1: 写失败测试** — 断言 BibTeX 含 `@article{doi-or-slug,`、`author` 用 `and` 连接、缺字段不产生 `undefined`；RIS 以 `TY  - JOUR` 开头 `ER  -` 结尾；CSL-JSON 有 `type/id/title/author/issued`；落盘路径来自入参或默认值，写入用原子 rename。
- [ ] **Step 2: 运行确认失败**
- [ ] **Step 3: 实现** — 每条先走 `science_paper` 的解析（复用函数，不重复实现），再格式化；`out` 允许相对路径，解析到 session cwd，禁止写到 cwd 之外（`resolve` 后 `startsWith(cwd)` 校验）。
- [ ] **Step 4: 运行测试** → PASS
- [ ] **Step 5: 提交** — `git commit -m "feat: add science_cite bibtex/ris/csl-json export"`

---

### Task 10: 状态存储（revision 乐观锁）

**Files:**
- Create: `lib/state.js`
- Test: `tests/state.test.mjs`

**Interfaces:**
- Produces: `emptyState(): State`、`readState(dir): Promise<{ revision: number, state: State }>`、`writeState(dir, state, expectedRevision: number | null): Promise<{ revision: number }>`；错误类型 `StateConflict`（带 `currentRevision`）；`State = { schemaVersion: 1, question?, hypothesis?, stage, entries: Entry[], todos: Todo[], updatedAt }`。

- [ ] **Step 1: 写失败测试** — 首次写入 `expectedRevision: null` → revision 1；再写 `expectedRevision: 1` → 2；写 `expectedRevision: 1` 第二次 → 抛 `StateConflict` 且文件未变；手工写入坏 JSON → `readState` 返回空状态并把坏文件备份为 `state.corrupt-<ts>.json`；并发两次写只有一次成功（Review Focus 3）。
- [ ] **Step 2: 运行确认失败**
- [ ] **Step 3: 实现** — `readState` 读 `state.json`，缺失返回 `{ revision: 0, state: emptyState() }`；`writeState` 先 `readState` 比对 revision，再用 `state.json.tmp` + `rename` 原子替换；目录不存在时 `mkdir -p`。
- [ ] **Step 4: 运行测试** → PASS
- [ ] **Step 5: 提交** — `git commit -m "feat: add revision-guarded research state store"`

---

### Task 11: `science_state` 工具

**Files:**
- Create: `lib/tools/state.js`
- Test: `tests/state-tool.test.mjs`

**Interfaces:**
- Produces: `createStateTool({ config, logger }): ToolDefinition`；入参 `{ action: 'read'|'write'|'patch', payload?, expectedRevision? }`；返回紧凑文本 + 新 revision。

- [ ] **Step 1: 写失败测试** — `read` 空目录返回空状态与 `revision: 0`；`patch` 合并 `todos` 追加；`write` 无 `expectedRevision` 时默认 `null`（首写）；冲突时返回含 `conflict` 与 `currentRevision` 的可读文本（不抛）。
- [ ] **Step 2: 运行确认失败**
- [ ] **Step 3: 实现** — 用 `exec` 里的 session cwd（`ctx.workingDirectory.get(agent.session)`，取不到时回退 `process.cwd()`），路径 `<cwd>/<config.stateDir>/`。
- [ ] **Step 4: 运行测试** → PASS
- [ ] **Step 5: 提交** — `git commit -m "feat: add science_state tool"`

---

### Task 12: `science_skill` 工具

**Files:**
- Create: `lib/tools/skill.js`
- Test: `tests/skill-tool.test.mjs`

**Interfaces:**
- Consumes: `readSkill`、`skillCatalog`、`isValidSkillName`
- Produces: `createSkillTool({ dir, logger }): ToolDefinition`；入参 `{ name?, topic? }`；返回 `{ name, description, content }` 或候选列表。

- [ ] **Step 1: 写失败测试** — 已存在技能返回正文且以 `# ` 或 frontmatter 剥离后的首行开头；未知名字返回"未找到，可能的候选：…"（模糊匹配，≤10 条）；非法名字（`../etc`）被拒绝且不读盘（路径穿越防护）；`topic` 时按名字/描述过滤。
- [ ] **Step 2: 运行确认失败**
- [ ] **Step 3: 实现** — 名字先过 `isValidSkillName`，再用 `path.join(dir, name, 'SKILL.md')` 并校验 `resolve` 后仍在 `dir` 内。
- [ ] **Step 4: 运行测试** → PASS
- [ ] **Step 5: 提交** — `git commit -m "feat: add science_skill loader for hidden skills"`

---

### Task 13: 工具汇总注册、配置与凭据

**Files:**
- Create: `lib/config.js`, `index.js`（完成）
- Test: `tests/apply.test.mjs`

**Interfaces:**
- Produces: `normalizeConfig(raw): Config`（`{ mailto, sources, catalogMode, bootstrap, stateDir, requestTimeoutMs }`）；`readPubmedKey(ctx): Promise<string | undefined>`；`apply(ctx, config)` 注册 skills、section、6 个工具。

- [ ] **Step 1: 写失败测试** — fake ctx 断言：`tools.register` 恰好 6 次且名字集合正确；`systemPrompt.section` 调用时 `name === 'openscience:bootstrap'`、`order === 121`；`config.bootstrap === false` 时**不**注册 section；`ctx` 无 `web` 时 5 个联网工具仍注册但 `execute` 返回"宿主未配置联网取数"文本（Review Focus 1）；`mailto` 为空时搜索 URL 不含 `mailto=`。
- [ ] **Step 2: 运行确认失败**
- [ ] **Step 3: 实现** — `apply` 里全部 `ctx.effect`/disposer 归拢；`inject` 用可选形式（`ctx.get('web')`）以支持无 web 的部署；`readPubmedKey` 走 `ctx.credentials.resolve({ key: 'openscience.pubmed' })`，异常吞掉返回 `undefined`。
- [ ] **Step 4: 运行测试** → PASS
- [ ] **Step 5: 提交** — `git commit -m "feat: wire tools, config and credentials into the host plugin"`

---

### Task 14: 状态 HTTP 路由

**Files:**
- Create: `lib/routes.js`
- Modify: `index.js`
- Test: `tests/routes.test.mjs`

**Interfaces:**
- Produces: `registerStateRoutes({ webServer, logger }): () => void`，路径 `GET /dsh-openscience/state?path=<abs>`、`POST /dsh-openscience/state`（body `{ path, state, expectedRevision }`）。

- [ ] **Step 1: 写失败测试** — 直接调用 handler：GET 不存在 → `{ revision: 0, state: empty }`；POST 正常写入返回新 revision；POST 冲突返回 409；`path` 缺失或不是目录 → 400；非 GET/POST → 405。
- [ ] **Step 2: 运行确认失败**
- [ ] **Step 3: 实现** — `ctx.webServer.register({ method, path, handler })`；`path` 参数必须 `isAbsolute` 且 `statSync().isDirectory()`；响应 `content-type: application/json`。
- [ ] **Step 4: 运行测试** → PASS
- [ ] **Step 5: 提交** — `git commit -m "feat: expose research state over host http routes"`

---

### Task 15: Client 半骨架（图标 + 浮层壳 + locale）

**Files:**
- Create: `client.js`, `client/workbench.js`, `locale/en.json`, `locale/zh-CN.json`
- Test: `tests/client-shape.test.mjs`（纯文本/结构断言，无浏览器）

**Interfaces:**
- Produces: `client.js` 以 `window.__ModuleLoader__.load({ id: '@geesepop01/ai4s', factory() {...} })` 形式导出 `apply(ctx)`；注册 `sidebar.panellist`（id `openscience-workbench`）与 `shell.overlay`（id `openscience-overlay`）。

- [ ] **Step 1: 写失败测试** — 文件文本包含 `__ModuleLoader__.load`、`sidebar.panellist`、`shell.overlay`；`locale/*.json` 键集合相同（en/zh 对齐）；`package.json` 的 `dsh.client.immediately === true`。
- [ ] **Step 2: 运行确认失败**
- [ ] **Step 3: 实现** — 复制 `references/ui-plugin.md` 的注册方式：`ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name:'sidebar.panellist', id:'openscience-workbench', order: 40 }, WorkbenchButton))`；浮层用 `state.open` 控制，`position: fixed` + portal 到 `document.body`；点击图标 `ctx.layout.openRightbar` 不参与（自绘）。
- [ ] **Step 4: 运行测试** → PASS
- [ ] **Step 5: 提交** — `git commit -m "feat: add client panel entry and workbench shell"`

---

### Task 16: 研究状态视图

**Files:**
- Create: `client/workbench-state.js`
- Modify: `client/workbench.js`
- Test: `tests/client-state-view.test.mjs`

**Interfaces:**
- Consumes: `GET /dsh-openscience/state?path=`
- Produces: `StateView({ path, api })` 组件；`fetchState(path): Promise<{revision, state}>`。

- [ ] **Step 1: 写失败测试** — 组件源码包含三处状态分支（无会话 / 无状态 / 有状态）与阶段进度渲染；`fetchState` 对 500 与网络错误返回 `{ error: 'unavailable' }` 而不是抛。
- [ ] **Step 2: 运行确认失败**
- [ ] **Step 3: 实现** — 8 阶段清单渲染 `stage` 进度、假设与待办列表、`revision` 小字；每次打开与 30s 轮询刷新；轮询在浮层关闭时停止。
- [ ] **Step 4: 运行测试** → PASS
- [ ] **Step 5: 提交** — `git commit -m "feat: render research state view"`

---

### Task 17: 文献库视图

**Files:**
- Create: `client/workbench-literature.js`
- Test: `tests/client-literature.test.mjs`

**Interfaces:**
- Consumes: 状态里的 `entries`（或 `.openscience/citations/refs.bib` 摘要）
- Produces: `LiteratureView({ entries })`；`filterEntries(entries, { yearFrom, yearTo, source })`。

- [ ] **Step 1: 写失败测试** — `filterEntries` 的年份/来源过滤；空列表渲染"还没有文献"；每条的 DOI 渲染成 `https://doi.org/<doi>` 链接。
- [ ] **Step 2: 运行确认失败**
- [ ] **Step 3: 实现** — 搜索框按标题/作者模糊过滤；最多渲染 200 行，超出显示"还有 N 条"。
- [ ] **Step 4: 运行测试** → PASS
- [ ] **Step 5: 提交** — `git commit -m "feat: render literature view"`

---

### Task 18: 技能目录视图

**Files:**
- Create: `client/workbench-catalog.js`, `lib/catalog-route.js`
- Modify: `lib/routes.js`
- Test: `tests/catalog.test.mjs`

**Interfaces:**
- Produces: `GET /dsh-openscience/catalog`（返回 `[{name, description, category, visible}]`）；`CatalogView({ items })`；`searchCatalog(items, q)`。

- [ ] **Step 1: 写失败测试** — 路由返回 371 条且 `visible` 标记与 curated 一致；`searchCatalog('scanpy')` 命中；`searchCatalog('zzz')` 为空数组。
- [ ] **Step 2: 运行确认失败**
- [ ] **Step 3: 实现** — 路由在 host 侧调用 `skillCatalog(skillsRoot())` 并缓存 60s；视图按分区折叠、搜索框、显示 `visible ? 'catalog' : 'hidden'` 徽标。
- [ ] **Step 4: 运行测试** → PASS
- [ ] **Step 5: 提交** — `git commit -m "feat: expose and render the skill catalog"`

---

### Task 19: 设置页

**Files:**
- Create: `client/settings.js`
- Test: `tests/client-settings.test.mjs`

**Interfaces:**
- Consumes: `ctx.remote.credentials`（若可用）与宿主 settings API；降级为只读展示。
- Produces: `SettingsSection()` 注册到 `settings.section`（id `openscience`）。

- [ ] **Step 1: 写失败测试** — 源码包含 `settings.section` 注册、`mailto` 输入、`pubmed key` 输入（`type=password`）、`catalogMode` 选择、`bootstrap` 开关；不含明文日志语句；`locale` 里这些标签在 en/zh 都有。
- [ ] **Step 2: 运行确认失败**
- [ ] **Step 3: 实现** — 非密钥字段写回插件 Config；密钥走 `credentialsController.set('openscience.pubmed', value)`，UI 只显示"已设置/未设置"；保存后 toast。
- [ ] **Step 4: 运行测试** → PASS
- [ ] **Step 5: 提交** — `git commit -m "feat: add settings section"`

---

### Task 20: 安装、端到端验证与截图

**Files:**
- Create: `scripts/verify.mjs`, `docs/screenshots/*.png`
- Modify: `README.md`, `README.zh-CN.md`, `CHANGELOG.md`

**Interfaces:**
- Consumes: 全部前序任务
- Produces: `node scripts/verify.mjs` 一次性检查 V1–V8 的静态部分（manifest、技能树、locale 对齐、工具名、目录 token 估算）。

- [ ] **Step 1: 写 `scripts/verify.mjs`** — 打印每项 `PASS/FAIL` 与数字（技能数、curated 数、目录 token 估算、工具数），任一 FAIL 退出码 1。
- [ ] **Step 2: 本机 link 安装** — `plugin_manager action=install_bundle target="<abs path>"`，确认 `application: applied`，无 warnings（V1）。
- [ ] **Step 3: 行与技能校验** — `cordis_inspect_query`（`Tool.listTools` 出现 6 个工具；默认会话技能数 371、无重复）（V2/V3/V4）。
- [ ] **Step 4: 默认会话实测** — 新建不带预设的会话，问「帮我查 2013 年纳米温度计的文献」，确认模型调用 `science_search`、DOI 来自工具返回（V5）。
- [ ] **Step 5: UI 截图** — 浮层三视图 + 设置页，深浅主题各一张，存 `docs/screenshots/`（V6）。
- [ ] **Step 6: token 与卸载** — `node scripts/verify.mjs` 报告 curated 目录 < 8k token；卸载后 `list_plugins` 无残留行（V7/V8）。
- [ ] **Step 7: 提交** — `git add -A && git commit -m "docs: verify, screenshots and readmes"`

---

### Task 21: 发布物与上架材料

**Files:**
- Create: `docs/market-entry.md`
- Modify: `package.json`（version）、`CHANGELOG.md`

- [ ] **Step 1: `npm pack --dry-run`** — 断言包含 `index.js`、`client.js`、`lib/**`、`skills/**`、`locale/**`、`LICENSE`、`NOTICE`；总大小 < 25MB；不含 `tests/`、`docs/`、`scripts/`。
- [ ] **Step 2: 写 `docs/market-entry.md`** — 中文/英文一段式描述、安装命令、能力清单、截图链接、许可与上游致谢，格式对齐 awesome-dsh-plugin 的条目字段（name/owner/url/category/description/install）。
- [ ] **Step 3: 用户在联网终端执行** `npm login && npm publish --access public`（本机 shell 无 registry，需用户执行）。
- [ ] **Step 4: 提 PR** — 在 `awesome-dsh-plugin` 仓库 README 的 `tools` 分类追加条目，标题与描述取自 `market-entry.md`。
- [ ] **Step 5: 提交** — `git commit -m "docs: market entry draft"`

---

## Self-Review

**Spec coverage**：§5.1 包结构→Task 1/2；§5.2(a) 技能 provider→Task 3；§5.2(b) bootstrap→Task 4；§5.2(c) 6 工具→Task 6–13；§5.2(d) 配置/凭据→Task 13；§5.2(e) 限速→Task 5；§5.3 Client→Task 15–19；§5.4 冲突→Task 20 V3b；§5.5 发布→Task 21；§5.6 V1–V8→Task 20。

**Type consistency**：`Entry` 在 Task 6 定义，Task 7/8/9/10/17 复用；`skillCatalog` 在 Task 3 定义，Task 12/18 复用；`readPubmedKey` 只在 Task 13 使用。

**Review Focus 覆盖**：1→Task 13；2→Task 5；3→Task 10；4→Task 3；5→Task 6。
