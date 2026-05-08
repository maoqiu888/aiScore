import type { DimensionResult, EvidenceItem } from "../types.js";

export interface EcosystemInput {
  installedTools: string[];
  apiKeyNames: string[];
}

export function scanEcosystem(input: EcosystemInput): DimensionResult {
  const evidence: EvidenceItem[] = [];

  const toolScore = Math.min(12, input.installedTools.length * 3);
  evidence.push({
    label: "AI Tools",
    status: input.installedTools.length > 0 ? "found" : "missing",
    detail: input.installedTools.length > 0
      ? input.installedTools.join(", ")
      : "None detected",
  });

  const keyScore = Math.min(8, input.apiKeyNames.length * 2);
  evidence.push({
    label: "API Keys",
    status: input.apiKeyNames.length > 0 ? "found" : "missing",
    detail: input.apiKeyNames.length > 0
      ? `${input.apiKeyNames.length} keys: ${input.apiKeyNames.map((k) => k.replace(/_API_KEY$/, "")).join(", ")}`
      : "None detected",
  });

  const score = Math.min(20, toolScore + keyScore);
  return { name: "ecosystem", score, maxScore: 20, evidence };
}
