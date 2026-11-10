# OpenScience 科研插件 `dsh-openscience` 设计

- 日期：2026-11-10（Asia/Shanghai）
- 状态：待批准（方案 3 已由用户选定）
- 上游：GitHub `synthetic-sciences/OpenScience`，本机快照 `D:\GitHub\openscience`，commit `6de022d`（tag v1.3.4），Apache-2.0
- 目标产物：npm 包 `dsh-openscience`，可被 dshmarket / awesome-dsh-plugin 收录

## 1. 意图与背景

本机已有一个「科研模式」**预设**（`~/.dsh/bundles/science-research-preset`，371 个技能）。预设的问题：只有用户在新建会话时主动选中该模式才有科研能力，默认 4 个模式的会话完全用不到。用户要的是**插件**：装一次，任何会话都生效，并且能发布给社区。

所以本设计把「科研能力」从 agent-plane 搬到 host-plane：技能目录、常驻提示、原生工具、Web UI 全部由插件在宿主层注册，与预设无关、与模型无关。

## 2. 实测事实与约束（决定设计的硬边界）

| 事实 | 影响 |
|---|---|
| `ctx.skills.registerProvider` / `ctx.systemPrompt.section` / `ctx.tools.register` 都在 host 层 | 插件可让任意会话获得技能、提示与工具，不需要预设 |
| `dsh-skill-superpowers` 是纯插件（无预设）已在本机生效 | 该模式已被实证，可照其结构 |
| 本机 **shell 无外网**：`curl` 打 Crossref/OpenAlex/PubMed/arXiv/doi.org 全部 `000` | 工具不得 spawn curl；必须走宿主 `ctx.web.fetch` |
| 宿主 web 服务有外网：OpenAlex、PubMed 实测 200；Crossref 返回 400（可达，参数问题） | 原生工具走 `ctx.web.fetch` 可行 |
| `npm` 从 shell 不可达 registry（`npm view` 无输出） | 发布需用户在能联网的终端执行，或配镜像 |
| 技能：离线快照 371 个 SKILL.md / 18MB；上游 main 已重组，`/skills/<name>/SKILL.md` 全 404，官网首页也写 "371 skills" | v1.0 用离线 371（完整含 references/scripts），不做不可靠的补齐 |
| 371 个技能的 name+description 目录 ≈ 3 万 token/请求 | 必须分层，否则装了就烧钱 |
| 上游 Apache-2.0 + NOTICE | 必须随包 LICENSE、NOTICE、来源与 commit |
| 本机同 profile 已装同名技能的预设 | 宿主按"最近层覆盖"处理，预期可共存；仍列入构建期实测（V3b） |
| **`skill` 工具对 `disable-model-invocation` 的技能直接抛错**（`dsh-tool-skill/lib/index.js:147,150`） | 隐藏技能不能靠"教模型按名调用 `skill`"加载，必须自带加载工具 |
| **`ctx.web.fetch` 只接受 `{url}`**，无 header/method/body，返回 `{statusCode, body:{kind,content}, truncated}` | 不能自定义 User-Agent，不能 POST；礼貌调用只能靠 URL 上的 `mailto`/`email` 参数 |
| `knowledge/skills` 服务读取时"最近层整条覆盖同名" | 与预设共存不会翻倍，但预设会话里我们的同名副本被遮蔽 |
| Client 侧有 `layout.openRightbar`、`slots`、`locale`、`theme`、`sessions` 服务 | 浮层与设置页可自绘；原生右栏页签的创建 API 不可见 |
| 宿主运行时 `@deepseek-ai/dsh-* 0.2.2-rc.1`；市场要求 `engines.dsh` 或同线 peer | 声明 `engines.dsh`，内部包懒加载 + 降级 |

## 3. 目标 / 非目标 / 反目标

**目标**

- G1 一次安装，**任意会话模式**（含自带 4 个）都能用上科研能力，不需要选预设。
- G2 全功能：文献检索与核验、DOI/元数据解析、开放获取定位、引用导出、研究工作台状态、统计与写作技能。
- G3 可发现性：模型在默认模式下也会在合适的时机调用技能与工具（靠常驻路由段 + 精选目录 + 明确描述）。
- G4 可上架：npm 包结构、双语 README、图标、截图、`engines`、awesome-dsh-plugin 条目。
- G5 可控：不写用户配置，不静默消耗 token，网络失败可读降级，卸载无残留。

**非目标**

- 不复制 OpenScience CLI 的命令（checkpoint/compact/handoff 等是上游 CLI 的，不是技能）。
- 不做上游托管工具的账号体系（不接 OpenScience 云端 API）。
- 不做仪器/湿实验设备控制。
- 不内置 PDF 解析器（v1.0），不内置 LLM 调用。

**反目标（技术上成立但算失败）**

- 装上后每次请求多 3 万 token。
- 与预设同装时出现重复技能条目、或让原有技能失效。
- 没有 API key 就完全不可用（PubMed key、mailto 匀为可选，缺省可用）。
- 工具失败时抛异常打断 agent 回合。

## 4. 方案取舍（已选 3）

| | 方案 1 纯技能包 | 方案 2 技能 + 工具 | **方案 3 再加 Web UI** |
|---|---|---|---|
| 内容 | 技能 provider + 引导段 | +5 个科研工具 | +侧栏工作台 + 设置页 |
| 工期 | 1–2 天 | 3–4 天 | 6–8 天 |
| 风险 | 低 | 中（网络/外部 API） | 中高（Client 半、插槽） |
| 是否"全功能" | 否 | 接近 | 是 |

用户选 3，并要求**等 UI 完成一次发完整版**。内部仍按 M1（host 半可自测）→ M2（Client 半）推进，但只在两段都完成、V1–V8 全绿时发布 `v1.0.0`。

## 5. 详细设计

### 5.1 包结构

```
dsh-openscience/
├── package.json          # name/version/dsh.bundle/files/keywords/engines
├── cordis.patch.yml      # 插入 host 行 + client 行
├── index.js              # Host 半（ESM，无构建步骤）
├── client.js             # Client 半（ESM，dsh.client 声明）
├── icon.svg
├── locale/{en.json,zh-CN.json}
├── skills/               # 371 个 vendored 技能（原样目录树）
├── upstream/PIN.json     # 仓库、commit、tag、抓取时间、许可、curate 名单
├── NOTICE, LICENSE
├── README.md, README.zh-CN.md, CHANGELOG.md
├── docs/screenshots/
├── scripts/{sync-skills.mjs,verify.mjs,token-report.mjs}
└── tests/{host.test.mjs,skills.test.mjs,manifest.test.mjs}
```

`package.json` 关键字段：

```json
{
  "name": "dsh-openscience",
  "type": "module",
  "keywords": ["dsh", "dsh-plugin", "deepseek-harness", "openscience", "research", "skills"],
  "engines": { "dsh": ">=0.2.0-0" },
  "dsh": { "bundle": { "patch": "./cordis.patch.yml" } },
  "files": ["index.js", "client.js", "cordis.patch.yml", "skills", "locale", "icon.svg", "upstream", "NOTICE", "LICENSE"]
}
```

### 5.2 Host 半（`index.js`）

一个 Cordis 插件 `apply(ctx, config)`，`inject: ['skills', 'systemPrompt', 'tools', 'web']`（按需注入，缺 web 时工具注册为"不可用"并给出说明）。

**(a) 技能 provider**

- 懒 import `@deepseek-ai/dsh-skill-filesystem`，以**私有实例**指向 `<package>/skills`，`providerName: "openscience"`，rank 600。
- 解析失败时 `ctx.logger.warn` 并降级：技能缺席，工具照常工作。
- 目录分层（**已按 Q1 结论修正**）：`upstream/PIN.json` 里的 `curated` 名单（约 60 个核心技能）保持完整描述、模型可直接用原生 `skill` 工具加载；其余技能在 vendored `SKILL.md` frontmatter 加 `disable-model-invocation: true`（只改我们 vendored 的副本，`sync-skills.mjs` 可重建并在 PIN 里记录改动）。
- 因为 `skill` 工具对不可模型调用的技能会**抛错**（已读源码确认），隐藏技能由插件自带的第 6 个工具 `science_skill` 加载：读包内 `skills/<name>/SKILL.md`（含扁平 `.md`），返回正文 + `resourceBase`，行为与 `skill` 工具一致、不经过宿主策略。
- 附一个自有技能 `openscience-catalog`（curated 内、模型可见）：列出全部技能的「名称 + 一句话」，并教模型"目录里没有的名字用 `science_skill` 加载"。这是「371 个技能不烧目录 token 但仍可发现」的机制。

**(b) 常驻提示段**

`ctx.systemPrompt.section({ name: 'openscience:bootstrap', order: 121, ... })`，约 350–450 token：

1. 研究循环 8 阶段（scope → literature → reason → methodology → compute → analyze → synthesize → write），每阶段产出一个文件；
2. 任务 → 技能路由表（约 40 条，如「文献综述 → literature-review / systematic-review」「单细胞 → scanpy」）；
3. 引用纪律：只报取回并核验过的来源，DOI 必须来自工具返回；
4. 工具用法：`science_search` 先检索、`science_paper` 核验、`science_cite` 导出、`science_state` 记录；
5. 「本插件不依赖预设，正常对话即可」。

可用 `config.bootstrap: false` 关闭（给嫌 token 的人）。

**(c) 原生工具（5 个）**

全部走 `ctx.web.fetch`（**只接受 `{url}`，无 header/method/body**；不 spawn 进程、不直连 `fetch()`），12s 超时、1 次重试，失败返回**可读文本**而非抛错。礼貌参数只能放在 URL 上（`mailto=` / `email=`），User-Agent 由宿主 provider 决定（arXiv 只建议、不强制描述性 UA）。

| 工具 | 入参 | 行为 |
|---|---|---|
| `science_search` | `query`, `sources?`(openalex/pubmed/arxiv/crossref), `limit?`(≤25), `year_from?`, `year_to?` | 并发查多源，归一化成条目 `{title, authors, year, venue, doi, pmid, arxivId, url, abstract?}`，去重（按 DOI/标题相似），按相关度排序 |
| `science_paper` | `id`（DOI / PMID / arXiv ID / OpenAlex ID） | 取全量元数据 + 摘要 + 开放获取 PDF 链接（Unpaywall，需 `mailto`；无 mailto 时跳过并不报错） |
| `science_cite` | `ids[]`, `format?`(bibtex/ris/csljson), `out?` | 从元数据生成引用，写入工作区文件（默认 `.openscience/citations/refs.bib`），返回路径与条数 |
| `science_related` | `id`, `limit?` | OpenAlex `related_works` / 引用与参考文献，用于追溯 |
| `science_state` | `action`(read/write/patch), `payload?`, `expectedRevision?` | 读写 `.openscience/state.json`（问题、假设、阶段、文献、数据、图、待办）；带 revision 的乐观并发，UI 面板与 agent 共用同一份 |
| `science_skill` | `name`, `topic?` | 读包内 vendored `SKILL.md` 正文并返回（`skill` 工具拒绝非模型可调用技能的替代通道），支持按关键字列候选 |

命名与描述遵循 agent-experience：名字动词化、描述写清「何时用/何时不用」、参数最少、错误可恢复。

**(d) 配置**

```yaml
mailto: ""            # 非密钥，进 Config；也可用 env OPENSCIENCE_MAILTO
pubmedApiKey: ""      # 密钥，只进 ctx.credentials（key: openscience.pubmed），不进 Config
sources: [openalex, pubmed, arxiv, crossref]
catalogMode: curated  # curated | all
bootstrap: true
stateDir: .openscience
```

- `mailto`、来源开关、目录模式属于**非密钥配置**，由设置页经宿主 config 写入（用户点了保存才写）。
- `pubmedApiKey` 走 `ctx.credentials`（宿主自带打码与记录库），设置页调用 `credentialsController.set`，日志与错误信息永不含明文。
- 二者都缺省可用：无 mailto → 跳过 Unpaywall 并降级 Crossref 礼貌池；无 key → 3 req/s 限速。
- G5 的"不写用户配置"修正为：**不静默写**；一切写入由用户在设置页触发，且走宿主自己的配置/凭据服务。

**(e) 限速与礼貌（按 url-only 现实）**

- 只发 GET；`mailto`/`email` 追加到 Crossref、OpenAlex、Unpaywall 的 URL；
- PubMed 无 key 时串行 ≥340ms/请求（≤3 req/s），有 key 100ms；arXiv ≥3s/请求；OpenAlex/Crossref ≥1s/请求；
- 单次工具调用最多 4 个并发请求；provider 返回 `truncated` 时在结果里明说「已截断」；
- 非 2xx 是结果不是异常：按 `statusCode` 给出"限速/未找到/上游故障"的可读结论。

### 5.3 Client 半（`client.js`）

- `sidebar.panellist` 注册「科研工作台」图标；点击打开自绘浮层。
- 浮层用 `shell.overlay` 承载（root 级、独立于会话列，`replaceRisk: none`），三视图：
  1. **研究状态**：读当前范围 `.openscience/state.json`（阶段进度、假设、待办、最近活动）；
  2. **文献库**：引用列表，DOI 可点击跳转，支持按年/来源筛选；
  3. **技能目录**：371 个技能搜索，显示分区与一句话描述，点开看 `SKILL.md` 前 40 行（用 `science_skill` 的同一份内容，只读）。
- **状态的范围（Q3 的默认答案，见 §7 待确认）**：state 属于**工作区**，路径 `<session.cwd>/.openscience/state.json`；浮层默认跟随**当前活动会话**的 cwd，多于一个工作区时给下拉切换。多会话并发写用 `revision` 乐观锁（工具与 UI 都带 `expectedRevision`，冲突时返回"请先重读"而不是覆盖）。
- Host 半额外导出一个 `openscienceState` 服务（`@Remote`：list/read/write/watch，按 workspace 路径寻址），浮层通过它取数，不直接读盘——这样 Client 半不需要文件权限，也不受沙箱差异影响。
- `settings.section` 一页：mailto、PubMed key（写凭据）、来源开关、catalogMode、bootstrap 开关、状态目录；非密钥字段从 Config schema 自动生成表单，密钥单独一个带打码的输入。若浮层/设置页在 0.2.2-rc.1 上不可用，降级为只读状态徽标 + 命令 `/openscience`。
- 所有文案进 `locale/{en,zh-CN}.json`，跟随宿主语言（`ctx.locale`）。
- 用 `ctx.theme` token 取色，不写死深浅色。
- **模型面文案（Q7）**：bootstrap、40 条路由表、6 个工具描述一律**英文**（省 token、命中英文技能描述），另加一行中文触发词（如「文献综述/假设/实验设计/统计/画图/写论文」）保证中文请求也能路由。

**为什么不用原生右栏页签**：`sidebar.right.pane.tab` 是 keyed 插槽但页签创建由宿主私有 controller 管（`dsh-better-sidebar` 用的是它自己的 service）。v1.0 用 `shell.overlay` 自绘，行为确定；若构建期确认原生页签有公开创建 API，v1.1 再切换。

### 5.4 技能库与同名冲突（最高风险项）

- v1.0 vendored **v1.3.4 快照 371 个**，`PIN.json` 记录 commit/tag/许可/每技能是否被改过 frontmatter。
- **同名冲突的宿主契约（已从 `skills` 服务契约确认，风险因此大幅下降）**：读取时"全局层 + 查看作用域的层链"合并，**最近的层整条覆盖同名条目**；只有在同一层内才用 rank 决定重复项。因此：
  - 默认模式的会话（无预设层）→ 用插件的技能；
  - 选了「科研模式」的会话（预设层更近）→ 用预设的技能，插件同名项被遮蔽，**不会重复出现在目录里**；
  - 两种情况都不额外消耗 token，也不会互相破坏。
- 仍需构建期实测（V3/V3b）：默认会话目录里 371 个技能各出现一次、无重复项；预设会话里目录大小不翻倍。
- 文档口径：插件与预设可以共存；**不推荐也不强制**卸载预设，README 只说明"预设会话优先用预设的技能副本"。

### 5.5 发布与上架（一次发完整版，Q6 结论：等 UI）

用户选择**一次发完整版**：host 半与 Client 半都完成后发 `v1.0.0`，不先发半成品。内部仍按 M1（host 半可自测）/ M2（UI）两段推进，但只在 M2 结束时发布。

1. `npm publish` 包名 `@geesepop01/ai4s`（GitHub 仓库 `geesepop01/ai4s`；若 npm 上 `ai4s` 命名冲突，退回 `@geesepop01/dsh-openscience`），需用户在能联网的终端执行或配置镜像。
2. GitHub 仓库打 Tag + Release 附 `.tgz`，作为免构建安装源。
3. 双语 README：一句话定位、安装三条路径（npm / Release tgz / 本机 link）、能力清单、截图、配置说明、与预设的区别、许可与上游致谢。
4. 向 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 提一条 PR（`category: tools`），市场与 dshmarket.com、目录站会自动收录。
5. 包体积目标 < 25MB（技能 18MB + 代码），`files` 白名单排除 docs/tests。

### 5.6 验证（发布前必须全绿）

| # | 验证 | 判据 |
|---|---|---|
| V1 | 本机 link 安装到 desktop profile | `application: applied`，无 warnings |
| V2 | 行状态 | `cordis_inspect_query` 或 `list_plugins` 末页确认 new rows `fiberPhase=active` |
| V3 | 技能注册 | 默认会话技能数 = 371，且每个名字只出现一次；`openscience-catalog` 可加载 |
| V3b | 与预设共存 | 预设在装状态下，预设会话目录不翻倍（同名被预设层覆盖） |
| V4 | 工具可用 | `Tool.listTools` 里出现 6 个工具；`science_search` 实测返回真实条目；`science_skill` 能取回隐藏技能正文 |
| V5 | 默认模式可用 | 新建**不带预设**的会话，问「帮我查 2013 年纳米温度计的文献」，模型调用 `science_search` 并核验 DOI |
| V6 | UI | 浮层三视图与设置页截图，深浅主题各一张 |
| V7 | token | `token-report.mjs` 输出目录 token 数，curated 模式 < 8k |
| V8 | 卸载 | 移除 bundle 后无残留行、无残留技能目录 |

## 6. 风险与缓解

| 风险 | 缓解 |
|---|---|
| 同名技能（§5.4） | 宿主契约是"最近层覆盖"，实测确认目录不翻倍即可 |
| 目录 token 成本 | curated 60 + 隐藏其余 + catalog 技能 |
| 外部 API 限速/封禁 | 礼貌池、限速、超时重试、可读失败 |
| 宿主 API 变动 | 懒 import + 降级 + `engines.dsh` |
| 无网络环境 | 技能照常、工具报可读错误，引导用离线技能手册 |
| 许可合规 | LICENSE + NOTICE + PIN 记录来源 commit |

## 7. 决定结果（用户已答复）

1. **状态归属**：跟随**当前活动会话的工作区**（state 在会话 cwd 的 `.openscience/`），多工作区给下拉切换。
2. **发布节奏**：等 UI 完成，一次发完整版 `v1.0.0`。
3. **包名与仓库**：npm `@geesepop01/ai4s`，GitHub `geesepop01/ai4s`。
4. **技能数量**：用户原选"补齐到 372"，但实测发现**上游已经重组仓库**——`main` 上 `/skills/<name>/SKILL.md` 全部 404（连 astropy 这种老技能也 404），GitHub API、github.com 网页、jsdelivr 整包（>50MB）从本机都不可达，只有 raw 已知路径可取。上游官网首页当前写的是 **"371 skills"**，与我们的离线快照一致。因此 **v1.0 用离线 371 个完整技能**（含 references/scripts，链接不断），"补齐"改为"等上游给出可取的目录结构或用户提供 main 的克隆后再对齐"。这是我在证据基础上的改动，若坚持要逐个人工猜路径补齐，可以另开任务。
5. **与预设共存**：保留预设，不卸载；README 说明预设会话会用预设副本。

## 8. 明确留给构建者

- 具体文件切分、函数命名、locale key 命名；
- `shell.overlay` 浮层的布局细节与视觉（可用 frontend-design 技能）；
- `tool.call.toolview` 是否需要为 5 个工具定制渲染卡（v1.0 不做，默认卡片即可）；
- 测试框架（建议 node:test，零依赖）。
