[English](./README.en.md) | **中文**

# ai-score

**给你的 AI 工具链跑个分。** 一行命令，扫描你的整个 AI 装备，满分 100。

就像鲁大师给硬件跑分一样 —— 但这次跑的是你的 AI。

```bash
npx ai-score
```

```
╔═══════════════════════════╗
║                           ║
║   ⚡ AI SCORE: 76 / 100   ║
║    等级: A — 御灵尊者     ║
║                           ║
╚═══════════════════════════╝

  🧠 Brain        ████████████████░░  27/30
  ⚡ Power        █████████████████░  37/40
  🎯 Config       ███████░░░░░░░░░░░  12/30
```

## 它评什么

ai-score 扫描你的本地环境，从三个维度给你的 AI 打分：

### 🧠 Brain（30 分）— 你的模型有多强？

基于 [LMSYS Chatbot Arena](https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard) ELO 排名打分 —— 最权威的社区盲测排行榜。

| 模型 | ELO | 得分 |
|------|-----|------|
| Claude Opus 4.7 | ~1410 | 30/30 |
| Claude Opus 4.6 | ~1390 | 27/30 |
| GPT-4o | ~1370 | 24/30 |
| Claude Sonnet 4.6 | ~1365 | 24/30 |
| DeepSeek V3 | ~1350 | 22/30 |
| Claude Haiku 4.5 | ~1280 | 14/30 |

### ⚡ Power（40 分）— 你的 AI 能做多少事？

扫描你的 **MCP 服务器** 和 **Skills 插件**，评估 15 个能力域的覆盖情况：

**MCP 能力域（9 个）：**
数据库、浏览器、监控运维、搜索联网、代码仓库、文件系统、通讯协作、自动化、专业领域

**Skills 能力域（6 个）：**
编码规范、工程流程、API/集成、前端设计、文档输出、创意生成

不看数量看覆盖面 —— 装 5 个数据库 MCP 和装 1 个得分一样。**广度才是王道。**

### 🎯 Config（30 分）— 你把 AI 用到极限了吗？

检测你对 AI 工具的调教程度：

- **指令文件** — CLAUDE.md、.cursorrules、AGENTS.md、GEMINI.md 等
- **Hooks** — 自动化工作流
- **Settings** — 自定义权限、环境变量、模型选择
- **工具配置** — 你的 AI 工具有多少配了专属规则文件

## 等级系统

| 分数 | 等级 | 称号 | 寓意 |
|------|------|------|------|
| 90-100 | SSS | 天道演算使 | 堪破世间万物运行规律，一念成阵 |
| 80-89 | S | 万法归一 | 熟稔各种工具集与 Agent，融会贯通 |
| 70-79 | A | 御灵尊者 | 能自如驾驭各类大模型为你所用 |
| 60-69 | B | 阵法小成 | 掌握了基本的提示词工程和工作流 |
| 40-59 | C | 初窥门径 | 刚开始接触 AI，处于引气入体的阶段 |
| 0-39 | D | 凡骨未褪 | 纯肉身体力劳动者 |

## 检测范围

ai-score 自动扫描：

- `~/.claude/` — Claude Code 设置、插件、Skills、MCP 配置
- `~/.cursor/` — Cursor 配置
- `.mcp.json` — 项目级和插件级 MCP 服务器
- `CLAUDE.md` / `.cursorrules` / `AGENTS.md` — 指令文件
- `~/.claude/plugins/` — 所有已安装插件的 MCP
- 已安装的 AI 工具（Claude Code、Cursor、Copilot、Windsurf、Cline、Aider、Continue）
- 当前使用的 AI 模型

## 隐私

- **不读取、不传输任何 API Key。** 没有例外。
- 配置文件仅在本地分析结构（行数、标题），不上传内容
- `--offline` 完全离线运行
- `--json` 输出机器可读格式

## 可分享的评分卡片

ai-score 自动生成一张 PNG 图片，方便你发到社交媒体：

```bash
npx ai-score
# => 📸 ai-score-card.png 已保存
```

## 命令行参数

```bash
npx ai-score              # 完整跑分
npx ai-score --json       # JSON 输出
npx ai-score --no-card    # 不生成 PNG 卡片
npx ai-score --offline    # 完全离线模式
```

## 怎么提分

ai-score 会告诉你该做什么：

```
💡 提升建议:
   1. +5 分 → 安装数据库 MCP（mysql、postgres、sqlite）
   2. +5 分 → 安装监控 MCP（sentry、datadog）
   3. +3 分 → 安装文件系统 MCP（filesystem、google-drive）
```

**快速提分攻略：**
- 安装 [superpowers](https://github.com/anthropics/claude-code-plugins) 插件 → 一键覆盖 6/6 Skills 能力域
- 写一个 `CLAUDE.md` 项目规范 → Config +2~6 分
- 配置 hooks 自动化 → Config +5 分
- 给常用服务装 MCP → Power 每个 +3~5 分

## 贡献

MCP 和 Skills 注册表内置在项目中。添加新条目：

1. Fork 本仓库
2. 在 `src/registry/mcp-registry.ts` 或 `src/registry/skills-registry.ts` 中添加 patterns
3. 提交 PR

## 社区

欢迎到 [linux.do](https://linux.do) 讨论你的跑分结果、分享提分攻略、或者提交 Bug 反馈。晒出你的分数，看看谁才是真正的 AI 军神！

## License

MIT
