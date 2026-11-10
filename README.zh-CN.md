# OpenScience 科研插件（`@geesepop01/ai4s`）

[English](./README.md) | 中文

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 用的科研插件。装一次，**所有会话**——包括从不选择预设的自带模式——都能拿到 370 个科研技能、一条常驻研究循环、6 个文献工具和一个科研工作台面板。

技能库来自 [synthetic-sciences/OpenScience](https://github.com/synthetic-sciences/OpenScience)（tag `v1.3.4`，commit `6de022d`，Apache-2.0），来源记录见 [NOTICE](./NOTICE) 与 [`upstream/PIN.json`](./upstream/PIN.json)。

## 安装

```sh
# npm
dsh plugin --profile <profile> add @geesepop01/ai4s

# 或从本机目录装
plugin_manager install_bundle target "D:/路径/ai4s"
```

DSH Desktop：**设置 → 插件 → 安装**，搜 `ai4s`，装完按提示重启或等热重载。

配置在插件行上（`mailto`、`catalogMode`、`bootstrap`、`sources`、`stateDir`）；NCBI Key 存宿主凭据库 `openscience.pubmed`。界面里的 **OpenScience** 设置页只展示当前生效值——修改请去 **插件 → ai4s**。

## 你会得到

| | |
|---|---|
| **370 个技能** | 覆盖生物、化学、物理、机器学习、计算与写作。约 60 个在模型目录里带完整描述，其余通过 `science_skill` 按名加载，每次请求的目录约 3.6k token 而不是 3 万。 |
| **常驻研究循环** | 约 2.5KB 的系统提示段：八阶段流程（SCOPE → LITERATURE → REASON → METHODOLOGY → COMPUTE → ANALYZE → SYNTHESIZE → WRITE）、任务到技能的路由表、引用纪律。任何模式都在，不依赖预设。 |
| **`science_search`** | 一次查询 OpenAlex、PubMed、arXiv、Crossref，返回带 DOI/PMID/arXiv 标识的归一化条目，支持年份过滤与逐源说明。 |
| **`science_paper`** | DOI / PMID / arXiv id / OpenAlex id → 核验过的元数据 + 开放获取结论与 PDF 链接（配了邮箱才查 Unpaywall）。 |
| **`science_related`** | 从一篇论文向外走：参考文献、被引文献、相关文献。 |
| **`science_cite`** | 导出 BibTeX / RIS / CSL-JSON 到工作目录，路径限制在会话目录内。 |
| **`science_state`** | 带 revision 的研究状态（`<会话工作区>/.openscience/state.json`），和面板共用同一份。 |
| **`science_skill`** | 按名字或主题加载 370 个技能里的任意一个，包括目录隐藏的 300 多个。 |
| **工作台面板** | 侧栏一个图标，打开主面板：研究状态、文献列表、可搜索的技能目录（宿主侧 60 秒缓存）。 |

## 与「科研模式」预设的区别

预设是 agent-plane 组合：只有选了它的会话才有那套工具和技能。本插件注册在宿主层（`ctx.skills`、`ctx.systemPrompt`、`ctx.tools`、`ctx.webServer`），所以能力不绑定模式。

两者可以共存：技能注册表分层合并，同名条目由最近的层整条覆盖——预设会话用预设的副本，普通会话用插件的，目录里不会重复。

## 配置

| 键 | 默认 | 含义 |
|---|---|---|
| `mailto` | `""` | 联系邮箱，用于 Crossref/OpenAlex 礼貌池与 Unpaywall；留空则跳过开放获取查询并明说。 |
| `pubmedApiKey` | — | 存进宿主凭据库（`openscience.pubmed`），不落 config、不进日志；提高 PubMed 速率上限。 |
| `sources` | 全部四个 | `science_search` 默认查询哪些来源。 |
| `catalogMode` | `curated` | `curated` = 约 60 个可见描述；`all` = 全部技能可被模型调用（每次请求约 3 万 token）。 |
| `bootstrap` | `true` | 是否注入常驻研究循环段。 |
| `stateDir` | `.openscience` | 研究状态目录，相对每个会话的工作目录。 |

## 行为说明

- 出网走宿主的 web provider，它只接受 URL（没有 header、没有 POST）。所以礼貌参数放在 query 上；provider 缺失或被限速时给一句可读的说明，不会崩。
- 工具在上游失败时从不抛错：模型会拿到「限速 / 未找到 / 上游故障 / 未配置」，自己决定下一步。
- 面板显示**最近一次有研究动作的工作目录**；按会话选择待做。
- 面板的两个路由不经过宿主的 `/api` 鉴权，因此自带防护：只接受已注册工作区内的绝对路径、请求体上限 1MB、跨站（`Sec-Fetch-Site` 或 `Origin` 不匹配）请求直接拒绝。

## 开发

```sh
node --test-isolation=none --test tests/*.test.mjs   # 71 个测试
node scripts/verify.mjs                              # 发布前检查
node scripts/sync-skills.mjs --source <openscience>/skills   # 重新 vendor
```

无构建步骤、无运行时依赖；`@deepseek-ai/dsh-tools` 与 `@deepseek-ai/dsh-skill-filesystem` 是可选 peer，懒加载。

## 许可

插件代码 Apache-2.0；内置技能 Apache-2.0，© Synthetic Sciences，见 [NOTICE](./NOTICE)。
