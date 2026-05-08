import { execSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { homedir, platform } from "node:os";
import type { InstructionFile, SettingsLevel } from "./tuning.js";
import type { BrainInput } from "./brain.js";
import type { PowerInput } from "./power.js";
import type { TuningInput } from "./tuning.js";
import type { EcosystemInput } from "./ecosystem.js";

export function parseOllamaList(output: string): string[] {
  const lines = output.trim().split("\n");
  if (lines.length <= 1) return [];
  return lines.slice(1).map((line) => line.trim().split(/\s+/)[0]).filter(Boolean);
}

export function extractMcpNames(config: unknown): string[] {
  if (!config || typeof config !== "object") return [];
  const obj = config as Record<string, unknown>;
  const servers = obj.mcpServers;
  if (!servers || typeof servers !== "object") return [];
  return Object.keys(servers as Record<string, unknown>);
}

export function extractSkillNames(dirs: string[]): string[] {
  return dirs.filter(Boolean);
}

function tryReadJson(filePath: string): unknown {
  try {
    if (!existsSync(filePath)) return null;
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function tryExec(cmd: string): string | null {
  try {
    return execSync(cmd, { timeout: 5000, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] });
  } catch {
    return null;
  }
}

function commandExists(name: string): boolean {
  const cmd = platform() === "win32" ? `where ${name} 2>nul` : `which ${name} 2>/dev/null`;
  return tryExec(cmd) !== null;
}

function detectClaudeModel(): string | null {
  const home = homedir();
  const settingsPath = join(home, ".claude", "settings.json");
  const settings = tryReadJson(settingsPath) as Record<string, unknown> | null;
  if (settings?.model && typeof settings.model === "string") return settings.model;

  const projectSettings = tryReadJson(".claude/settings.json") as Record<string, unknown> | null;
  if (projectSettings?.model && typeof projectSettings.model === "string") return projectSettings.model;

  return null;
}

function detectEnvKeys(): Record<string, boolean> {
  const keys = [
    "ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY",
    "GOOGLE_GENERATIVE_AI_API_KEY", "DEEPSEEK_API_KEY",
    "MISTRAL_API_KEY", "COHERE_API_KEY",
  ];
  const result: Record<string, boolean> = {};
  for (const key of keys) {
    if (process.env[key]) result[key] = true;
  }
  return result;
}

function detectOllamaModels(): string[] | null {
  if (!commandExists("ollama")) return null;
  const output = tryExec("ollama list");
  if (output === null) return [];
  return parseOllamaList(output);
}

function extractMcpFromSettings(settingsObj: unknown): string[] {
  if (!settingsObj || typeof settingsObj !== "object") return [];
  const s = settingsObj as Record<string, unknown>;
  if (s.mcpServers && typeof s.mcpServers === "object") {
    return Object.keys(s.mcpServers as Record<string, unknown>);
  }
  return [];
}

function detectMcpNames(): string[] {
  const all = new Set<string>();
  const home = homedir();

  // Project-level .mcp.json
  const projectMcp = tryReadJson(".mcp.json");
  for (const name of extractMcpNames(projectMcp)) all.add(name);

  // Project-level .claude/settings.json and settings.local.json
  for (const f of [".claude/settings.json", ".claude/settings.local.json"]) {
    for (const name of extractMcpFromSettings(tryReadJson(f))) all.add(name);
  }

  // Global ~/.claude/settings.json and settings.local.json
  for (const f of ["settings.json", "settings.local.json"]) {
    for (const name of extractMcpFromSettings(tryReadJson(join(home, ".claude", f)))) all.add(name);
  }

  // Claude Desktop config
  const desktopConfigPaths = platform() === "win32"
    ? [join(home, "AppData", "Roaming", "Claude", "claude_desktop_config.json")]
    : [join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json")];
  for (const p of desktopConfigPaths) {
    for (const name of extractMcpNames(tryReadJson(p))) all.add(name);
  }

  return [...all];
}

function detectSkillNames(): string[] {
  const home = homedir();
  const names = new Set<string>();

  // Primary source: enabledPlugins in settings.json (most reliable)
  const settings = tryReadJson(join(home, ".claude", "settings.json")) as Record<string, unknown> | null;
  if (settings?.enabledPlugins && typeof settings.enabledPlugins === "object") {
    for (const key of Object.keys(settings.enabledPlugins as Record<string, unknown>)) {
      // Format: "superpowers@claude-plugins-official" → extract "superpowers"
      const pluginName = key.split("@")[0];
      if (pluginName) names.add(pluginName);
    }
  }

  // Fallback: scan plugin cache directory structure (marketplace/plugin-name/hash/)
  const pluginCachePath = join(home, ".claude", "plugins", "cache");
  try {
    if (existsSync(pluginCachePath)) {
      const marketplaces = readdirSync(pluginCachePath);
      for (const marketplace of marketplaces) {
        const mpPath = join(pluginCachePath, marketplace);
        if (!statSync(mpPath).isDirectory()) continue;
        const plugins = readdirSync(mpPath);
        for (const plugin of plugins) {
          if (statSync(join(mpPath, plugin)).isDirectory()) {
            names.add(plugin);
          }
        }
      }
    }
  } catch {
    // ignore
  }

  return [...names];
}

function detectInstructionFiles(): InstructionFile[] {
  const files: InstructionFile[] = [];
  const candidates = [
    "CLAUDE.md",
    ".cursorrules",
    ".github/copilot-instructions.md",
    ".windsurfrules",
  ];
  const home = homedir();
  const globalClaude = join(home, ".claude", "CLAUDE.md");
  if (existsSync(globalClaude)) {
    const content = readFileSync(globalClaude, "utf-8");
    const lines = content.split("\n").length;
    const hasHeadings = /^#{1,3}\s/m.test(content);
    files.push({ name: "~/.claude/CLAUDE.md", lines, hasHeadings });
  }
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      const content = readFileSync(candidate, "utf-8");
      const lines = content.split("\n").length;
      const hasHeadings = /^#{1,3}\s/m.test(content);
      files.push({ name: candidate, lines, hasHeadings });
    }
  }
  return files;
}

function detectHooksAndSettings(): { hasHooks: boolean; settingsLevel: SettingsLevel } {
  const home = homedir();
  const settings = tryReadJson(join(home, ".claude", "settings.json")) as Record<string, unknown> | null;
  if (!settings) return { hasHooks: false, settingsLevel: "default" };
  const hasHooks = !!settings.hooks && typeof settings.hooks === "object" && Object.keys(settings.hooks as object).length > 0;
  const hasPermissions = !!settings.permissions;
  const hasEnv = !!settings.env;
  const hasModel = !!settings.model;
  let settingsLevel: SettingsLevel = "default";
  if (hasPermissions && (hasEnv || hasModel)) settingsLevel = "rich";
  else if (hasPermissions || hasEnv || hasModel) settingsLevel = "basic";
  return { hasHooks, settingsLevel };
}

function detectInstalledTools(): string[] {
  const tools: { name: string; commands: string[] }[] = [
    { name: "Claude Code", commands: ["claude"] },
    { name: "Cursor", commands: ["cursor"] },
    { name: "GitHub Copilot", commands: ["copilot"] },
    { name: "Windsurf", commands: ["windsurf"] },
    { name: "Cline", commands: ["cline"] },
    { name: "Aider", commands: ["aider"] },
    { name: "Continue", commands: ["continue"] },
  ];
  const found: string[] = [];
  for (const tool of tools) {
    if (tool.commands.some(commandExists)) found.push(tool.name);
  }
  return found;
}

function detectApiKeyNames(): string[] {
  const keys = [
    "ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY",
    "DEEPSEEK_API_KEY", "MISTRAL_API_KEY", "COHERE_API_KEY",
  ];
  return keys.filter((k) => !!process.env[k]);
}

export interface FullDetection {
  brain: BrainInput;
  power: PowerInput;
  tuning: TuningInput;
  ecosystem: EcosystemInput;
}

export function detectAll(): FullDetection {
  const { hasHooks, settingsLevel } = detectHooksAndSettings();
  return {
    brain: {
      claudeModel: detectClaudeModel(),
      envKeys: detectEnvKeys(),
      ollamaModels: detectOllamaModels(),
    },
    power: {
      mcpNames: detectMcpNames(),
      skillNames: detectSkillNames(),
    },
    tuning: {
      instructionFiles: detectInstructionFiles(),
      hasHooks,
      settingsLevel,
    },
    ecosystem: {
      installedTools: detectInstalledTools(),
      apiKeyNames: detectApiKeyNames(),
    },
  };
}
