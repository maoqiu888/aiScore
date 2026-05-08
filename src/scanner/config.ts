import type { DimensionResult, EvidenceItem } from "../types.js";

export interface InstructionFile {
  name: string;
  lines: number;
  hasHeadings: boolean;
}

export interface ToolConfig {
  tool: string;
  hasConfig: boolean;
}

export interface ConfigInput {
  instructionFiles: InstructionFile[];
  hasHooks: boolean;
  settingsCustomized: boolean;
  toolConfigs: ToolConfig[];
}

export function scanConfig(input: ConfigInput): DimensionResult {
  const evidence: EvidenceItem[] = [];
  let total = 0;

  // 1. Instruction files (max 10): do your AI tools know your rules?
  const fileCount = input.instructionFiles.length;
  let fileScore: number;
  if (fileCount >= 3) fileScore = 6;
  else if (fileCount >= 2) fileScore = 4;
  else if (fileCount === 1) fileScore = 2;
  else fileScore = 0;

  // Quality bonus: best file >50 lines with structure = +4, >20 lines = +2
  if (fileCount > 0) {
    const best = input.instructionFiles.reduce((a, b) => (a.lines > b.lines ? a : b));
    if (best.lines > 50 && best.hasHeadings) fileScore = Math.min(10, fileScore + 4);
    else if (best.lines > 20) fileScore = Math.min(10, fileScore + 2);
  }
  total += fileScore;

  const fileNames = input.instructionFiles.map((f) => f.name);
  evidence.push({
    label: "Instruction Files",
    status: fileCount > 0 ? "found" : "missing",
    detail: fileCount > 0
      ? `${fileNames.join(", ")} (${fileCount} files)`
      : "No CLAUDE.md / .cursorrules / AGENTS.md found",
  });

  // 2. Hooks (max 5): do you have automated workflows?
  const hooksScore = input.hasHooks ? 5 : 0;
  total += hooksScore;
  evidence.push({
    label: "Hooks",
    status: input.hasHooks ? "found" : "missing",
    detail: input.hasHooks ? "Custom hooks configured" : "No hooks — automate your workflow!",
  });

  // 3. Settings customized (max 5): have you gone beyond defaults?
  const settingsScore = input.settingsCustomized ? 5 : 0;
  total += settingsScore;
  evidence.push({
    label: "Settings",
    status: input.settingsCustomized ? "found" : "missing",
    detail: input.settingsCustomized ? "Custom settings active" : "Using defaults",
  });

  // 4. Tool configs (max 10): how many tools have you actually configured?
  const configuredTools = input.toolConfigs.filter((t) => t.hasConfig);
  let configScore: number;
  if (configuredTools.length >= 4) configScore = 10;
  else if (configuredTools.length >= 3) configScore = 8;
  else if (configuredTools.length >= 2) configScore = 5;
  else if (configuredTools.length === 1) configScore = 3;
  else configScore = 0;
  total += configScore;

  evidence.push({
    label: "Tool Configs",
    status: configuredTools.length > 0 ? "found" : "missing",
    detail: configuredTools.length > 0
      ? configuredTools.map((t) => t.tool).join(", ")
      : "No tool-specific configs found",
  });

  return { name: "config", score: Math.min(30, total), maxScore: 30, evidence };
}
