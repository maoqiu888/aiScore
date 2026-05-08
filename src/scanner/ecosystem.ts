import type { DimensionResult, EvidenceItem } from "../types.js";

export interface ToolConfig {
  tool: string;
  hasConfig: boolean;
}

export interface EcosystemInput {
  installedTools: string[];
  toolConfigs: ToolConfig[];
}

export function scanEcosystem(input: EcosystemInput): DimensionResult {
  const evidence: EvidenceItem[] = [];

  // Tool installation: 3 per tool, max 12
  const toolScore = Math.min(12, input.installedTools.length * 3);
  evidence.push({
    label: "AI Tools",
    status: input.installedTools.length > 0 ? "found" : "missing",
    detail: input.installedTools.length > 0
      ? input.installedTools.join(", ")
      : "None detected",
  });

  // Tool config depth: 2 per configured tool, max 8
  const configuredCount = input.toolConfigs.filter((t) => t.hasConfig).length;
  const configScore = Math.min(8, configuredCount * 2);
  const configuredNames = input.toolConfigs.filter((t) => t.hasConfig).map((t) => t.tool);
  evidence.push({
    label: "Tool Configs",
    status: configuredCount > 0 ? "found" : "missing",
    detail: configuredCount > 0
      ? `${configuredNames.join(", ")} configured`
      : "No tool-specific configs found",
  });

  const score = Math.min(20, toolScore + configScore);
  return { name: "ecosystem", score, maxScore: 20, evidence };
}
