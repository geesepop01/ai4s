# 发布清单（PowerShell，逐段复制执行）

本机 DSH shell **没有外网**（`curl`/`npm view` 都取不到），所以这四步要在你自己的终端里跑。
仓库已就绪：`D:\Programs\DSH Desktop\dsh-openscience`，git 身份已是 `geesepop01` + noreply 邮箱，暂无 remote。

---

## 0. 先确认三件事

```powershell
gh --version; gh auth status          # 没装就 winget install GitHub.cli，然后 gh auth login
npm whoami                             # 没登录就 npm login
npm view @geesepop/ai4s version      # 报 404 = 名字可用；已存在就得换名（见第 3 步兜底）
```

`npm whoami` 必须回 `geesepop`——包名是 `@geesepop/ai4s`，scope 必须是你的 npm 账号或组织。

---

## 1. 建仓库并推送（公开发布，路径会写进市场条目）

```powershell
cd "D:\Programs\DSH Desktop\dsh-openscience"

# 推送前扫一遍密钥（应该只有 .gitignore 命中）
git status --short
git grep -nIE "api[_-]?key|secret|password|BEGIN .*PRIVATE KEY" -- . ':!skills' | Select-Object -First 20

gh repo create geesepop01/ai4s --public --source=. --remote=origin --push --description "OpenScience 科研插件 for DeepSeek Harness：370 技能 + 6 个文献工具 + 研究工作台"
```

公开前确认：仓库里只有代码与 vendored 技能，没有 `.openscience/`、没有 key（`.gitignore` 已覆盖）。

## 2. 发 npm（市场的一键安装与升级都靠它）

```powershell
cd "D:\Programs\DSH Desktop\dsh-openscience"
node scripts/verify.mjs          # 必须 5/5 PASS
npm pack --dry-run               # 必须 5.0 MB 左右，含 index.js / client.js / lib / skills
npm publish --access public
npm view @geesepop/ai4s version
```

装一遍验证（这一步等价于用户装）：

```powershell
dsh plugin --profile desktop add @geesepop/ai4s
# 打开 DSH，侧栏应出现 AI4S 图标；设置 → 插件里应有 OpenScience 页
```

## 3. 名字被占时的兜底

`npm view` 不是 404 说明 `@geesepop/ai4s` 已被占用（或是你自己的旧包）。改一处即可：

```powershell
# package.json 的 name 改成 @geesepop/dsh-openscience，然后
git commit -am "chore: rename package to @geesepop/dsh-openscience"
npm publish --access public
```

同时把 `docs/market-entry.md` 里的包名、README 安装命令一起换掉。

## 4. GitHub Release（给不想走 npm 的人一个免构建 tgz）

```powershell
cd "D:\Programs\DSH Desktop\dsh-openscience"
npm pack                          # 生成 geesepop-ai4s-1.0.0.tgz
git tag -a v1.0.0 -m "v1.0.0" && git push --tags
gh release create v1.0.0 geesepop-ai4s-1.0.0.tgz --title "v1.0.0" --generate-notes
```

## 5. 上架 awesome-dsh-plugin（市场只认这个列表）

两条路任选：

**A. 网页提 PR（最省事）**
1. 打开 <https://github.com/awesome-dsh-plugin/awesome-dsh-plugin>
2. 找 `tools`（Tools & Capabilities）分区，点铅笔编辑
3. 加一行（正文见 `docs/awesome-pr.md`）
4. Propose changes → 写标题 `Add @geesepop/ai4s` → Create pull request

**B. gh CLI**

```powershell
gh repo fork awesome-dsh-plugin/awesome-dsh-plugin --clone
cd awesome-dsh-plugin
# 编辑 README，在 tools 分区加那一行
git checkout -b add-ai4s
git commit -am "Add @geesepop/ai4s"
git push -u origin add-ai4s
gh pr create --title "Add @geesepop/ai4s" --body-file "D:\Programs\DSH Desktop\dsh-openscience\docs\awesome-pr.md"
```

CI 每天刷新 `plugins.json`，市场与 dshmarket.com、dshmarket 应用通常一天内出现。

## 6. 截图（提 PR 前做，市场里显著影响点击率）

1. 打开 DSH → 侧栏点 **AI4S** → 主面板：状态页 / 文献页 / 技能页各截一张
2. 设置 → 插件 → **OpenScience** 截一张（现在只读，展示生效值）
3. 存到 `docs/screenshots/panel-state.png`、`panel-catalog.png`、`settings.png`
4. 在 README 的「What you get」表后加：

```markdown
![Research workbench](docs/screenshots/panel-state.png)
```

5. `git add docs/screenshots && git commit -m "docs: workbench screenshots" && git push`

## 完成后应该能验证到

- [ ] `git ls-remote origin` 有 `v1.0.0` 与 `main`
- [ ] `npm view @geesepop/ai4s version` 返回 1.0.0
- [ ] `dsh plugin --profile desktop add @geesepop/ai4s` 能装、能卸
- [ ] awesome-dsh-plugin 的 PR 有编号；一天后 `https://awesome-dsh-plugin.com/plugins.json` 里能搜到 `ai4s`
- [ ] 全新会话（不选任何预设）问一句「查 2013 年纳米温度计的文献」，模型会调 `science_search`
