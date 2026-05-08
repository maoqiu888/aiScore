import type { DimensionResult, EvidenceItem } from "../types.js";

export interface InstructionFile {
  name: string;
  lines: number;
  hasHeadings: boolean;
}

export type SettingsLevel = "default" | "basic" | "rich";

export interface TuningInput {
  instructionFiles: InstructionFile[];
  hasHooks: boolean;
  settingsLevel: SettingsLevel;
}

function scoreInstructionFiles(files: InstructionFile[]): { fileScore: number; qualityScore: number; evidence: EvidenceItem[] } {
  const evidence: EvidenceItem[] = [];
  let fileScore: number;
  if (files.length >= 2) {
    fileScore = 8;
  } else if (files.length === 1) {
    fileScore = 5;
  } else {
    fileScore = 0;
  }

  const fileDetail = files.length > 0
    ? files.map((f) => f.name).join(", ")
    : "None found";
  evidence.push({
    label: "Instruction Files",
    status: files.length > 0 ? "found" : "missing",
    detail: fileDetail,
  });

  let qualityScore = 0;
  if (files.length > 0) {
    const best = files.reduce((a, b) => (a.lines > b.lines ? a : b));
    if (best.lines > 50 && best.hasHeadings) {
      qualityScore = 7;
    } else if (best.lines > 20) {
      qualityScore = 4;
    } else {
      qualityScore = 2;
    }
    evidence.push({
      label: "Config Quality",
      status: "found",
      detail: `Best: ${best.name} (${best.lines} lines${best.hasHeadings ? ", structured" : ""})`,
    });
  }

  return { fileScore, qualityScore, evidence };
}

export function scanTuning(input: TuningInput): DimensionResult {
  const { fileScore, qualityScore, evidence } = scoreInstructionFiles(input.instructionFiles);

  const hooksScore = input.hasHooks ? 5 : 0;
  evidence.push({
    label: "Hooks",
    status: input.hasHooks ? "found" : "missing",
    detail: input.hasHooks ? "Custom hooks configured" : "No hooks",
  });

  let settingsScore: number;
  if (input.settingsLevel === "rich") settingsScore = 5;
  else if (input.settingsLevel === "basic") settingsScore = 2;
  else settingsScore = 0;
  evidence.push({
    label: "Settings",
    status: input.settingsLevel !== "default" ? "found" : "missing",
    detail: `Level: ${input.settingsLevel}`,
  });

  const score = Math.min(25, fileScore + qualityScore + hooksScore + settingsScore);
  return { name: "tuning", score, maxScore: 25, evidence };
}
