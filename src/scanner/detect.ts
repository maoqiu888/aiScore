import { execSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { homedir, platform } from "node:os";
import type { BrainInput } from "./brain.js";
import type { PowerInput } from "./power.js";
import type { InstructionFile, ToolConfig, ConfigInput } from "./config.js";

export function parseOllamaList(output: string): string[] {
  const lines = output.trim().split("\n");
  if (lines.length <= 1) return [];
  return lines.slice(1).map((line) => line.trim().split(/\s+/)[0]).filter(Boolean);
}

export function extractMcpNames(config: unknown): string[] {
  if (!config || typeof config !== "object") return [];
  const obj = config as Record<string, unknown>;

  // Format 1: { "mcpServers": { "name": { ... } } } — project/global config
  const servers = obj.mcpServers;
  if (servers && typeof servers === "object") {
    return Object.keys(servers as Record<string, unknown>);
  }

  // Format 2: { "name": { "command": ... } } — plugin-level .mcp.json
  // Keys are MCP names directly, values are objects with command/type
  const names: string[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === "object" && ("command" in val || "type" in val || "url" in val)) {
      names.push(key);
    }
  }
  return names;
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


function scanDirForMcpJson(dir: string, results: Set<string>): void {
  try {
    if (!existsSync(dir)) return;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDirForMcpJson(full, results);
      } else if (entry.name === ".mcp.json" || entry.name === "mcp.json") {
        const cfg = tryReadJson(full);
        for (const name of extractMcpNames(cfg)) results.add(name);
      }
    }
  } catch {
    // skip unreadable directories
  }
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

  // Claude plugins — each plugin can have its own .mcp.json
  const pluginsDir = join(home, ".claude", "plugins");
  scanDirForMcpJson(pluginsDir, all);

  // Codex plugins
  const codexDir = join(home, ".codex", ".tmp", "plugins", "plugins");
  scanDirForMcpJson(codexDir, all);

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
  const home = homedir();

  // Global instruction files
  const globalPaths: { name: string; path: string }[] = [
    { name: "~/.claude/CLAUDE.md", path: join(home, ".claude", "CLAUDE.md") },
  ];

  // Project-level instruction files
  const projectPaths: { name: string; path: string }[] = [
    { name: "CLAUDE.md", path: "CLAUDE.md" },
    { name: ".cursorrules", path: ".cursorrules" },
    { name: ".github/copilot-instructions.md", path: ".github/copilot-instructions.md" },
    { name: ".windsurfrules", path: ".windsurfrules" },
    { name: ".clinerules", path: ".clinerules" },
    { name: "AGENTS.md", path: "AGENTS.md" },
    { name: "GEMINI.md", path: "GEMINI.md" },
    { name: "CODEX.md", path: "CODEX.md" },
    { name: ".aide/rules", path: ".aide/rules" },
  ];

  for (const entry of [...globalPaths, ...projectPaths]) {
    try {
      if (existsSync(entry.path)) {
        const content = readFileSync(entry.path, "utf-8");
        const lines = content.split("\n").length;
        const hasHeadings = /^#{1,3}\s/m.test(content);
        files.push({ name: entry.name, lines, hasHeadings });
      }
    } catch {
      // skip unreadable files
    }
  }
  return files;
}

function detectHooksAndSettings(): { hasHooks: boolean; settingsCustomized: boolean } {
  const home = homedir();
  const settings = tryReadJson(join(home, ".claude", "settings.json")) as Record<string, unknown> | null;
  if (!settings) return { hasHooks: false, settingsCustomized: false };
  const hasHooks = !!settings.hooks && typeof settings.hooks === "object" && Object.keys(settings.hooks as object).length > 0;
  const hasPermissions = !!settings.permissions;
  const hasEnv = !!settings.env;
  const hasModel = !!settings.model;
  const hasPlugins = !!settings.enabledPlugins;
  const settingsCustomized = hasPermissions || hasEnv || hasModel || hasPlugins;
  return { hasHooks, settingsCustomized };
}

function detectInstalledTools(): string[] {
  const home = homedir();
  const tools: { name: string; commands: string[]; configDirs: string[] }[] = [
    { name: "Claude Code", commands: ["claude"], configDirs: [join(home, ".claude")] },
    { name: "Cursor", commands: ["cursor"], configDirs: [join(home, ".cursor"), ".cursor"] },
    { name: "GitHub Copilot", commands: ["copilot"], configDirs: [".github"] },
    { name: "Windsurf", commands: ["windsurf"], configDirs: [join(home, ".windsurf"), ".windsurf"] },
    { name: "Cline", commands: ["cline"], configDirs: [join(home, ".cline"), ".cline"] },
    { name: "Aider", commands: ["aider"], configDirs: [join(home, ".aider")] },
    { name: "Continue", commands: ["continue"], configDirs: [join(home, ".continue"), ".continue"] },
  ];
  const found: string[] = [];
  for (const tool of tools) {
    const cmdFound = tool.commands.some(commandExists);
    const dirFound = tool.configDirs.some((d) => existsSync(d));
    if (cmdFound || dirFound) found.push(tool.name);
  }
  return found;
}

function detectToolConfigs(): ToolConfig[] {
  const home = homedir();
  const configs: { tool: string; paths: string[] }[] = [
    { tool: "Claude Code", paths: [join(home, ".claude", "settings.json"), ".claude/settings.json", "CLAUDE.md"] },
    { tool: "Cursor", paths: [".cursorrules", ".cursor/rules"] },
    { tool: "GitHub Copilot", paths: [".github/copilot-instructions.md"] },
    { tool: "Windsurf", paths: [".windsurfrules"] },
    { tool: "Cline", paths: [".clinerules"] },
    { tool: "Aider", paths: [".aider.conf.yml", join(home, ".aider.conf.yml")] },
    { tool: "Continue", paths: [".continue/config.json", join(home, ".continue", "config.json")] },
  ];
  return configs.map((c) => ({
    tool: c.tool,
    hasConfig: c.paths.some((p) => existsSync(p)),
  }));
}

export interface FullDetection {
  brain: BrainInput;
  power: PowerInput;
  config: ConfigInput;
}

export function detectAll(): FullDetection {
  const { hasHooks, settingsCustomized } = detectHooksAndSettings();
  return {
    brain: {
      claudeModel: detectClaudeModel(),
    },
    power: {
      mcpNames: detectMcpNames(),
      skillNames: detectSkillNames(),
    },
    config: {
      instructionFiles: detectInstructionFiles(),
      hasHooks,
      settingsCustomized,
      toolConfigs: detectToolConfigs(),
    },
  };
}
