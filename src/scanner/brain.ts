import type { DimensionResult, EvidenceItem } from "../types.js";

export interface BrainInput {
  modelId: string | null;
}

// Based on LMSYS Chatbot Arena ELO rankings (May 2026)
// Source: https://huggingface.co/spaces/lmarena-ai/arena-leaderboard
// Patterns are matched via includes() against the model ID string
const MODEL_ELO: { pattern: string; elo: number; name: string }[] = [
  // Anthropic Claude
  { pattern: "opus-4-7", elo: 1503, name: "Claude Opus 4.7" },
  { pattern: "opus-4-6", elo: 1500, name: "Claude Opus 4.6" },
  { pattern: "sonnet-4-6", elo: 1480, name: "Claude Sonnet 4.6" },
  { pattern: "opus-4-5", elo: 1465, name: "Claude Opus 4.5" },
  { pattern: "sonnet-4-5", elo: 1440, name: "Claude Sonnet 4.5" },
  { pattern: "sonnet-3.5", elo: 1380, name: "Claude Sonnet 3.5" },
  { pattern: "haiku-4.5", elo: 1340, name: "Claude Haiku 4.5" },
  { pattern: "haiku-3.5", elo: 1290, name: "Claude Haiku 3.5" },

  // OpenAI GPT
  { pattern: "gpt-5.5", elo: 1488, name: "GPT-5.5" },
  { pattern: "gpt-5.4", elo: 1484, name: "GPT-5.4" },
  { pattern: "gpt-5", elo: 1470, name: "GPT-5" },
  { pattern: "gpt-4.5", elo: 1430, name: "GPT-4.5" },
  { pattern: "gpt-4o", elo: 1400, name: "GPT-4o" },
  { pattern: "gpt-4-turbo", elo: 1370, name: "GPT-4 Turbo" },
  { pattern: "gpt-4-mini", elo: 1330, name: "GPT-4o Mini" },
  { pattern: "o4-mini", elo: 1460, name: "o4-mini" },
  { pattern: "o3", elo: 1470, name: "o3" },
  { pattern: "o1", elo: 1410, name: "o1" },
  { pattern: "gpt-3.5", elo: 1200, name: "GPT-3.5" },

  // Google Gemini
  { pattern: "gemini-3.1-pro", elo: 1493, name: "Gemini 3.1 Pro" },
  { pattern: "gemini-3-pro", elo: 1480, name: "Gemini 3 Pro" },
  { pattern: "gemini-2.5-pro", elo: 1450, name: "Gemini 2.5 Pro" },
  { pattern: "gemini-2.5-flash", elo: 1410, name: "Gemini 2.5 Flash" },
  { pattern: "gemini-2.0-flash", elo: 1390, name: "Gemini 2.0 Flash" },
  { pattern: "gemini-1.5-pro", elo: 1370, name: "Gemini 1.5 Pro" },
  { pattern: "gemini-1.5-flash", elo: 1320, name: "Gemini 1.5 Flash" },

  // xAI Grok
  { pattern: "grok-4", elo: 1491, name: "Grok 4" },
  { pattern: "grok-3", elo: 1440, name: "Grok 3" },
  { pattern: "grok-2", elo: 1380, name: "Grok 2" },

  // DeepSeek
  { pattern: "deepseek-r1", elo: 1450, name: "DeepSeek R1" },
  { pattern: "deepseek-v4", elo: 1440, name: "DeepSeek V4" },
  { pattern: "deepseek-v3", elo: 1410, name: "DeepSeek V3" },
  { pattern: "deepseek-v2.5", elo: 1350, name: "DeepSeek V2.5" },
  { pattern: "deepseek-coder", elo: 1320, name: "DeepSeek Coder" },

  // Meta Llama
  { pattern: "llama-4", elo: 1420, name: "Llama 4" },
  { pattern: "llama-3.3-70b", elo: 1380, name: "Llama 3.3 70B" },
  { pattern: "llama-3.1-405b", elo: 1360, name: "Llama 3.1 405B" },
  { pattern: "llama-3.1-70b", elo: 1330, name: "Llama 3.1 70B" },
  { pattern: "llama-3.1-8b", elo: 1230, name: "Llama 3.1 8B" },

  // Alibaba Qwen
  { pattern: "qwen-3", elo: 1430, name: "Qwen 3" },
  { pattern: "qwen-2.5-72b", elo: 1380, name: "Qwen 2.5 72B" },
  { pattern: "qwen-2.5-32b", elo: 1340, name: "Qwen 2.5 32B" },
  { pattern: "qwen-2.5-coder", elo: 1350, name: "Qwen 2.5 Coder" },
  { pattern: "qwen-2.5-7b", elo: 1260, name: "Qwen 2.5 7B" },

  // Mistral
  { pattern: "mistral-large", elo: 1380, name: "Mistral Large" },
  { pattern: "mistral-medium", elo: 1330, name: "Mistral Medium" },
  { pattern: "mistral-small", elo: 1290, name: "Mistral Small" },
  { pattern: "codestral", elo: 1350, name: "Codestral" },

  // Cohere
  { pattern: "command-r-plus", elo: 1320, name: "Command R+" },
  { pattern: "command-r", elo: 1280, name: "Command R" },

  // Others
  { pattern: "yi-lightning", elo: 1350, name: "Yi Lightning" },
  { pattern: "kimi", elo: 1400, name: "Kimi" },
];

const ELO_MAX = 1510;
const ELO_MIN = 1150;

function eloToScore(elo: number): number {
  const clamped = Math.max(ELO_MIN, Math.min(ELO_MAX, elo));
  return Math.round(((clamped - ELO_MIN) / (ELO_MAX - ELO_MIN)) * 30);
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

  if (!input.modelId) {
    evidence.push({ label: "Model", status: "missing", detail: "No model detected" });
    return { name: "brain", score: 0, maxScore: 30, evidence };
  }

  const matched = matchModel(input.modelId);
  if (matched) {
    const score = eloToScore(matched.elo);
    evidence.push({
      label: "Model",
      status: "found",
      detail: `${matched.name} (ELO ${matched.elo}) — ${score}/30`,
    });
    return { name: "brain", score, maxScore: 30, evidence };
  }

  evidence.push({
    label: "Model",
    status: "found",
    detail: `${input.modelId} (unranked)`,
  });
  return { name: "brain", score: 10, maxScore: 30, evidence };
}
