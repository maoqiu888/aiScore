**English** | [中文](./README.md)

# ai-score

**Your AI toolchain, benchmarked.** One command to scan your entire AI setup and get a score out of 100.

Like [PC benchmarks](https://en.wikipedia.org/wiki/Benchmark_(computing)) for your hardware — but for your AI coding tools.

```bash
npx ai-score
```

```
╔═══════════════════════════╗
║                           ║
║   ⚡ AI SCORE: 76 / 100   ║
║     Grade: A — AI Pro     ║
║                           ║
╚═══════════════════════════╝

  🧠 Brain        ████████████████░░  27/30
  ⚡ Power        █████████████████░  37/40
  🎯 Config       ███████░░░░░░░░░░░  12/30
```

## What it scores

ai-score scans your local environment and evaluates three dimensions:

### 🧠 Brain (30 pts) — How strong is your model?

Scores your AI model based on [LMSYS Chatbot Arena](https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard) ELO rankings — the most authoritative community-driven AI benchmark.

| Model | ELO | Score |
|-------|-----|-------|
| Claude Opus 4.7 | ~1410 | 30/30 |
| Claude Opus 4.6 | ~1390 | 27/30 |
| GPT-4o | ~1370 | 24/30 |
| Claude Sonnet 4.6 | ~1365 | 24/30 |
| DeepSeek V3 | ~1350 | 22/30 |
| Claude Haiku 4.5 | ~1280 | 14/30 |

### ⚡ Power (40 pts) — What can your AI actually do?

Scans your **MCP servers** and **Skills/Plugins** to measure capability coverage across 15 domains:

**MCP Domains (9):**
Database, Browser, Monitoring, Search, Code Repos, Filesystem, Collaboration, Automation, Specialized

**Skill Domains (6):**
Coding Standards, Engineering Workflow, API/Integration, Frontend Design, Documentation, Creative

It's not about quantity — installing 5 database MCPs scores the same as 1. **Breadth of coverage** is what matters.

### 🎯 Config (30 pts) — Have you maxed out your setup?

Detects how well you've configured your AI tools:

- **Instruction files** — CLAUDE.md, .cursorrules, AGENTS.md, GEMINI.md, etc.
- **Hooks** — Automated workflows that extend your AI
- **Settings** — Custom permissions, environment, model selection
- **Tool configs** — How many of your AI tools have dedicated config files

## Grade system

| Score | Grade | Title | Meaning |
|-------|-------|-------|---------|
| 90-100 | SSS | Dao Calculator | Perceives the laws governing all things, conjures formations with a thought |
| 80-89 | S | All Laws as One | Mastered every toolset and agent, unified in understanding |
| 70-79 | A | Spirit Commander | Freely wields all manner of LLMs to serve your will |
| 60-69 | B | Formation Adept | Grasped the basics of prompt engineering and workflows |
| 40-59 | C | Glimpsed the Path | Just starting with AI, channeling qi into the body |
| 0-39 | D | Mortal Bones | Pure physical labor, unaugmented by AI |

## What it detects

ai-score automatically scans:

- `~/.claude/` — Claude Code settings, plugins, skills, MCP configs
- `~/.cursor/` — Cursor configuration
- `.mcp.json` — Project and plugin-level MCP servers
- `CLAUDE.md` / `.cursorrules` / `AGENTS.md` — Instruction files
- `~/.claude/plugins/` — All installed plugin MCP servers
- Installed AI tools (Claude Code, Cursor, Copilot, Windsurf, Cline, Aider, Continue)
- AI model from your active configuration

## Privacy

- **No API keys are read or transmitted.** Period.
- Config files are analyzed locally for structure only (line counts, headings)
- No file contents are ever uploaded
- `--offline` flag for fully local execution
- `--json` for machine-readable output

## Shareable score card

ai-score generates a PNG image you can share on social media:

```bash
npx ai-score
# => 📸 ai-score-card.png saved
```

## CLI options

```bash
npx ai-score              # Full benchmark
npx ai-score --json       # JSON output
npx ai-score --no-card    # Skip PNG generation
npx ai-score --offline    # Fully offline mode
```

## How to improve your score

ai-score tells you exactly what to do:

```
💡 Suggestions:
   1. +5 pts → Add database MCP (mysql, postgres, sqlite)
   2. +5 pts → Add monitoring MCP (sentry, datadog)
   3. +3 pts → Add filesystem MCP (filesystem, google-drive)
```

**Quick wins:**
- Install [superpowers](https://github.com/anthropics/claude-code-plugins) skills — covers 6/6 skill domains instantly
- Add a `CLAUDE.md` with project rules — +2-6 config points
- Configure hooks in settings.json — +5 config points
- Add MCP servers for your most-used services — +3-5 power points each

## Contributing

The MCP and Skills registries are built-in. To add new entries:

1. Fork this repo
2. Add patterns to `src/registry/mcp-registry.ts` or `src/registry/skills-registry.ts`
3. Submit a PR

## Community

Share your score, discuss improvement tips, or report bugs on [linux.do](https://linux.do). Post your results and see who's the real AI God!

## License

MIT
