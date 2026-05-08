import type { DimensionResult, EvidenceItem } from "../types.js";

export interface BrainInput {
  claudeModel: string | null;
}

// Based on LMSYS Chatbot Arena ELO rankings (2026-05)
// Source: https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard
const MODEL_ELO: { pattern: string; elo: number; name: string }[] = [
  { pattern: "opus-4-7", elo: 1410, name: "Claude Opus 4.7" },
  { pattern: "gpt-4.5", elo: 1396, name: "GPT-4.5" },
  { pattern: "opus-4-6", elo: 1390, name: "Claude Opus 4.6" },
  { pattern: "gemini-2.5-pro", elo: 1385, name: "Gemini 2.5 Pro" },
  { pattern: "gpt-4o", elo: 1370, name: "GPT-4o" },
  { pattern: "sonnet-4-6", elo: 1365, name: "Claude Sonnet 4.6" },
  { pattern: "sonnet-4-5", elo: 1356, name: "Claude Sonnet 4.5" },
  { pattern: "deepseek-v3", elo: 1350, name: "DeepSeek V3" },
  { pattern: "gemini-2.0-flash", elo: 1345, name: "Gemini 2.0 Flash" },
  { pattern: "gpt-4-turbo", elo: 1310, name: "GPT-4 Turbo" },
  { pattern: "sonnet-3.5", elo: 1300, name: "Claude Sonnet 3.5" },
  { pattern: "llama-3.1-405b", elo: 1290, name: "Llama 3.1 405B" },
  { pattern: "haiku-4.5", elo: 1280, name: "Claude Haiku 4.5" },
  { pattern: "gpt-4-mini", elo: 1270, name: "GPT-4 Mini" },
  { pattern: "gemini-1.5-flash", elo: 1260, name: "Gemini 1.5 Flash" },
  { pattern: "haiku-3.5", elo: 1230, name: "Claude Haiku 3.5" },
  { pattern: "gpt-3.5", elo: 1200, name: "GPT-3.5" },
  { pattern: "llama-3.1-8b", elo: 1170, name: "Llama 3.1 8B" },
];

const ELO_MAX = 1420;
const ELO_MIN = 1150;

function eloToScore(elo: number): number {
  const clamped = Math.max(ELO_MIN, Math.min(ELO_MAX, elo));
  return Math.round(((clamped - ELO_MIN) / (ELO_MAX - ELO_MIN)) * 25);
}

function matchModel(modelStr: string): { elo: number; name: string } | null {
  const lower = modelStr.toLowerCase();
  for (const entry of MODEL_ELO) {
    if (lower.includes(entry.pattern)) {
      return { elo: entry.elo, name: entry.name };
    }
  }
  return null;
}

export function scanBrain(input: BrainInput): DimensionResult {
  const evidence: EvidenceItem[] = [];

  if (!input.claudeModel) {
    evidence.push({ label: "Model", status: "missing", detail: "No model detected" });
    return { name: "brain", score: 0, maxScore: 25, evidence };
  }

  const matched = matchModel(input.claudeModel);
  if (matched) {
    const score = eloToScore(matched.elo);
    evidence.push({
      label: "Model",
      status: "found",
      detail: `${matched.name} (ELO ${matched.elo}) — ${score}/25`,
    });
    return { name: "brain", score, maxScore: 25, evidence };
  }

  // Unknown model — give baseline score
  evidence.push({
    label: "Model",
    status: "found",
    detail: `${input.claudeModel} (unranked)`,
  });
  return { name: "brain", score: 10, maxScore: 25, evidence };
}
