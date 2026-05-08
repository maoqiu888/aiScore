# ai-score — AI 工具链跑分器

## 概述

一行命令扫描你的整个 AI 装备，给出评分、等级和可分享的成绩单。  
类似鲁大师给硬件跑分，但面向 AI 工具链。

```
npx ai-score
```

开源 CLI 工具，发布到 npm，GitHub 开源。

---

## 产品定位

- **目标用户**：使用 AI 编程工具（Claude Code、Cursor、Copilot 等）的开发者
- **核心价值**：量化你的 AI 装备水平，发现能力短板，社交分享
- **传播机制**：跑分截图 + "打败了 XX% 的 AI 用户" → Twitter/微信/即刻传播
- **项目名称**：`ai-score`（npm 包名待确认可用性）

---

## 评分体系（满分 100 分）

### 四大维度

| 维度 | 类比鲁大师 | 满分 | 说明 |
|------|-----------|------|------|
| Brain 大脑 | CPU | 25 | 你用的模型有多强 |
| Power 能力 | GPU | 30 | 你的 AI 能做多少事（MCP + Skills） |
| Tuning 调教 | 内存 | 25 | 你有多懂你的 AI（配置质量） |
| Ecosystem 生态 | 硬盘 | 20 | 你的 AI 军火库有多丰富 |

### 1. Brain 大脑（25 分）

| 检测项 | 检测方式 | 分值 |
|--------|---------|------|
| 最强模型等级 | 检测配置文件中的 model 设置和 API Key 对应的服务商 | Opus=10, Sonnet/GPT-4o=7, Haiku/Mini=4, 仅免费=1 |
| 多模型覆盖 | 检测环境变量 ANTHROPIC_API_KEY、OPENAI_API_KEY、GOOGLE_API_KEY 等（仅检测存在性） | 3家=8, 2家=5, 1家=2 |
| 本地模型 | 检测 ollama/lmstudio 是否安装，`ollama list` 模型数量 | 有模型=7, 仅安装=3, 无=0 |

### 2. Power 能力（30 分）

**核心逻辑**：不是简单数数量，而是按**能力域覆盖**和**项目权重**打分。

#### MCP 能力域（满分 18 分）

| 能力域 | 代表 MCP | 域权重 |
|--------|---------|--------|
| 数据库 | mysql, postgres, sqlite, supabase | 5 |
| 浏览器 | puppeteer, playwright, browserbase | 5 |
| 搜索联网 | brave-search, tavily, exa | 4 |
| 代码仓库 | github, gitlab | 4 |
| 文件系统 | filesystem, google-drive | 3 |
| 通讯协作 | slack, linear, notion | 3 |
| 监控运维 | sentry, datadog, grafana | 5 |
| 自动化 | n8n, zapier | 3 |
| 专业领域 | figma, stripe, aws | 2 |

打分公式：`min(18, sum(已覆盖域的域权重))`  
同一个域内装多个 MCP 不重复计分，鼓励广度覆盖。

#### Skills 能力域（满分 12 分）

| 能力域 | 代表 Skills | 域权重 |
|--------|------------|--------|
| 编码规范 | TDD, code-review, debugging, systematic-debugging | 6 |
| 工程流程 | brainstorming, writing-plans, executing-plans, git-worktrees | 5 |
| 前端设计 | frontend-design, UI/UX, webapp-testing | 4 |
| 文档输出 | docx, pdf, pptx, xlsx | 3 |
| 创意生成 | algorithmic-art, canvas-design, slack-gif | 3 |
| API/集成 | claude-api, mcp-builder | 5 |

打分公式：`min(12, sum(已覆盖域的域权重) * 12 / 总域权重)`

**Skill 套件整体计分**：superpowers 这种套件包含多个能力域（TDD + debugging + brainstorming + planning...），自动展开计入多个域的覆盖。

### 3. Tuning 调教（25 分）

| 检测项 | 检测方式 | 分值 |
|--------|---------|------|
| 系统指令文件 | 检测 CLAUDE.md / .cursorrules / .github/copilot-instructions.md | 有多个=8, 有一个=5, 无=0 |
| 指令文件质量 | 行数 + 是否有结构化标题（## / ### ） | >50行且结构化=7, >20行=4, <10行=2 |
| Hooks 配置 | 检测 ~/.claude/settings.json 中的 hooks | 有自定义=5, 无=0 |
| 自定义 Settings | 检测 permissions、env、model 等非默认配置 | 丰富配置=5, 基础配置=2, 默认=0 |

### 4. Ecosystem 生态（20 分）

| 检测项 | 检测方式 | 分值 |
|--------|---------|------|
| AI 工具安装量 | 检测 claude/cursor/copilot/windsurf/cline/aider/continue 等 | 每个+3, 最高 12 |
| API Key 覆盖 | 检测 ANTHROPIC_API_KEY / OPENAI_API_KEY / GOOGLE_API_KEY / DEEPSEEK_API_KEY 等 | 每个+2, 最高 8 |

---

## 等级系统

| 总分 | 等级 | 称号 |
|------|------|------|
| 90-100 | SSS | AI 军神 |
| 80-89 | S | AI 武装到牙齿 |
| 70-79 | A | AI 高玩 |
| 60-69 | B | AI 熟练工 |
| 40-59 | C | AI 入门选手 |
| 0-39 | D | AI 裸奔中 |

---

## 排名系统："打败了 XX% 的用户"

### 方案：匿名分数上报

- 用户运行 `npx ai-score` 后，**仅上报总分和四维分数**（不上报任何配置细节）
- 后端维护一个分数分布直方图
- 返回百分位排名："你击败了 73% 的用户！"
- 后端极简：一个 Cloudflare Worker + KV 存储即可

### 隐私保护

- 默认上报（仅数字分数），用户可 `--offline` 禁用
- 永远不上报：API Key 内容、文件内容、用户名、机器信息
- 首次运行时明确提示用户

---

## 凭据展示

跑分完成后展示检测到的具体证据，让分数有说服力：

```
  ── 凭据 Evidence ───────────────────────

  🧠 Brain
     Claude Opus 4.6          ← model detected
     OpenAI API Key           ✓ exists
     Anthropic API Key        ✓ exists
     Ollama (3 models)        ✓ llama3, codellama, mistral

  ⚡ Power
     MCP: mysql-dev, playwright, brave-search, github, n8n
     Skills: superpowers (12 skills), document-skills (15 skills)
     能力域覆盖: 7/9

  🎯 Tuning
     CLAUDE.md                ✓ 128 lines, well-structured
     .cursorrules             ✓ 45 lines
     Hooks                    ✓ 3 custom hooks
     Settings                 ✓ custom permissions + env

  🌐 Ecosystem
     Tools: Claude Code, Cursor, GitHub Copilot
     API Keys: Anthropic, OpenAI, Google, DeepSeek (4/4)
```

---

## 终端输出设计

完整输出分三段：**总分 → 维度详情 → 凭据 → 建议**

```
  ╔═══════════════════════════════════════════╗
  ║           ⚡ AI SCORE: 87 / 100           ║
  ║         等级: S — AI 武装到牙齿            ║
  ║           🏆 击败了 78% 的用户             ║
  ╚═══════════════════════════════════════════╝

  🧠 Brain        ██████████████░░░░  22/25
  ⚡ Power        █████████████░░░░░  26/30
  🎯 Tuning       ████████████░░░░░░  21/25
  🌐 Ecosystem    ██████████████████  18/20

  ── 凭据 Evidence ───────────────────────
  （如上所示的详细检测结果）

  ── 能力域覆盖 ──────────────────────────
  编码规范  ████████████████  强
  工程流程  ████████████░░░░  良
  数据访问  ██████████████░░  强
  浏览器    ████████████████  强
  搜索联网  ████████░░░░░░░░  中
  监控运维  ░░░░░░░░░░░░░░░░  缺失
  文档输出  ██████████░░░░░░  良
  创意设计  ████░░░░░░░░░░░░  弱

  💡 提升建议:
     1. +5 分 → 安装 Sentry MCP（监控运维能力）
     2. +3 分 → 配置 brave-search MCP（搜索联网）
     3. +2 分 → 安装 Ollama 并拉取模型（本地模型）

  📸 评分卡片已保存: ./ai-score-card.png
```

---

## 评分卡片图片生成

生成一张可分享的 PNG 图片，用于社交媒体传播。

### 技术方案

使用 Node.js Canvas 库（`@napi-rs/canvas` 或 `canvas`）在 CLI 端直接生成 PNG：
- 不依赖浏览器或 Puppeteer
- 纯 Node.js 绘制，速度快
- 输出到当前目录 `./ai-score-card.png`

### 卡片内容

- 总分 + 等级 + 称号
- 四维分数条形图
- "击败了 XX% 的用户"
- 能力域覆盖雷达图
- 项目 GitHub 地址 / 二维码

---

## 数据引擎：Skills & MCP 全网注册表

### 自动爬取采集

| 数据源 | 采集方式 | 覆盖范围 |
|--------|---------|---------|
| npm registry | 搜索 `mcp-server-*`、`claude-skill`、`@anthropic` 等关键词 | npm 发布的 MCP/Skills |
| GitHub Topics | 爬取 `mcp-server`、`claude-code-skill`、`claude-code` topic | 开源未发 npm 的项目 |
| GitHub Search | 搜索 `filename:skills.json`、`"mcpServers"` | 非标准命名项目 |
| awesome-mcp-servers | 解析 README 中的列表 | 社区认可的优质项目 |
| PyPI | 搜索 `mcp-server`、`fastmcp` | Python 生态 MCP |

### 自动分类 & 权重计算

```
tier_score = log2(stars + 1) * 2 + log2(weekly_downloads + 1) * 3
capability_score = 覆盖能力域数 × 平均域权重
freshness_score = last_update < 30d ? 10 : max(0, 10 - (days_since_update - 30) / 30)

weight = normalize(tier_score + capability_score + freshness_score, max=6)
```

### 数据结构

```jsonc
{
  "name": "superpowers",
  "source": "github:anthropics/claude-code-plugins",
  "type": "skill-suite",
  "category": "engineering-workflow",
  "capabilities": ["tdd", "debugging", "code-review", "brainstorming", "planning", "git-worktrees"],
  "stars": 2800,
  "weeklyDownloads": 15000,
  "tier": "S",
  "weight": 6,
  "lastUpdated": "2026-05-06"
}
```

### 更新机制

- GitHub Actions 每日定时运行爬取脚本
- 自动分类 + 计算权重 → 生成 `registry.json`
- 发布到 GitHub Release（作为 asset）
- CLI 运行时拉取最新 registry（24h 本地缓存）

---

## 技术架构

```
ai-score/
├── src/
│   ├── cli.ts              # CLI 入口，参数解析
│   ├── scanner/
│   │   ├── brain.ts        # 模型检测
│   │   ├── power.ts        # MCP + Skills 检测
│   │   ├── tuning.ts       # 配置质量检测
│   │   └── ecosystem.ts    # 工具生态检测
│   ├── scorer/
│   │   ├── engine.ts       # 评分引擎，加权计算
│   │   └── registry.ts     # 注册表加载 & 匹配
│   ├── render/
│   │   ├── terminal.ts     # 终端美化输出
│   │   └── card.ts         # PNG 卡片生成
│   └── rank/
│       └── client.ts       # 匿名分数上报 & 排名查询
├── registry/
│   ├── crawler/            # 爬虫脚本（GitHub Actions 运行）
│   │   ├── npm.ts
│   │   ├── github.ts
│   │   └── pypi.ts
│   ├── classifier.ts       # 自动分类 & 权重计算
│   └── registry.json       # 生成的注册表
├── api/                    # Cloudflare Worker（排名服务）
│   └── worker.ts
├── package.json
└── README.md
```

### 技术选型

| 组件 | 选型 | 理由 |
|------|------|------|
| 语言 | TypeScript | npm 生态亲和，类型安全 |
| CLI 框架 | commander + chalk + ora | 轻量成熟 |
| 终端美化 | chalk + boxen + cli-table3 | 彩色输出 + 表格 + 边框 |
| 图片生成 | @napi-rs/canvas | 纯 Node 无依赖，跨平台 |
| 排名后端 | Cloudflare Worker + KV | 免费额度足够，全球 CDN |
| 爬虫 | GitHub Actions + octokit + npm-registry-fetch | 定时运行，免费 |

### CLI 参数

| 命令 | 功能 |
|------|------|
| `npx ai-score` | 完整跑分（默认） |
| `npx ai-score --offline` | 离线模式，不上报分数 |
| `npx ai-score --json` | JSON 格式输出 |
| `npx ai-score --no-card` | 不生成 PNG 卡片 |
| `npx ai-score --fix` | 显示一键安装建议的详细命令 |

---

## 隐私 & 安全

- API Key 仅检测环境变量**是否存在**（`!!process.env.ANTHROPIC_API_KEY`），不读取内容
- 配置文件仅读取结构信息（行数、标题数），不上传内容
- 分数上报仅包含：总分、四维分数、OS 类型（用于统计）
- 无用户标识，无 IP 记录，无指纹
- `--offline` 完全本地运行

---

## MVP 范围（一周内）

### 第一周必须完成

- [ ] 四维扫描引擎（Brain/Power/Tuning/Ecosystem）
- [ ] 评分计算 + 等级判定
- [ ] 终端美化输出（进度条 + 颜色 + 边框）
- [ ] 凭据详情展示
- [ ] PNG 评分卡片生成
- [ ] 内置基础 registry（覆盖主流 50+ MCP 和 30+ Skills）
- [ ] npm 发布，`npx ai-score` 可用

### 第二周迭代

- [ ] 排名系统后端（Cloudflare Worker）
- [ ] "击败了 XX% 的用户" 功能
- [ ] 自动爬取 + registry 每日更新
- [ ] `--fix` 一键安装建议
- [ ] 能力域雷达图

### 未来

- [ ] 社区贡献 registry PR 流程
- [ ] Web 版排行榜
- [ ] 团队对比模式
