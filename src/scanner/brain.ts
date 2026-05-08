import type { DimensionResult, EvidenceItem } from "../types.js";

export interface BrainInput {
  claudeModel: string | null;
  envKeys: Record<string, boolean>;
  ollamaModels: string[] | null;
}

function scoreModelTier(model: string | null): { score: number; evidence: EvidenceItem } {
  if (!model) {
    return { score: 1, evidence: { label: "Model Tier", status: "missing", detail: "No model detected" } };
  }
  const lower = model.toLowerCase();
  if (lower.includes("opus")) {
    return { score: 10, evidence: { label: "Model Tier", status: "found", detail: `${model} (Opus)` } };
  }
  if (lower.includes("sonnet") || lower.includes("gpt-4o") || lower.includes("gpt-4-turbo")) {
    return { score: 7, evidence: { label: "Model Tier", status: "found", detail: `${model} (High)` } };
  }
  if (lower.includes("haiku") || lower.includes("gpt-4-mini") || lower.includes("gpt-3.5")) {
    return { score: 4, evidence: { label: "Model Tier", status: "found", detail: `${model} (Mid)` } };
  }
  return { score: 4, evidence: { label: "Model Tier", status: "found", detail: model } };
}

const PROVIDER_KEYS: Record<string, string> = {
  ANTHROPIC_API_KEY: "Anthropic",
  OPENAI_API_KEY: "OpenAI",
  GOOGLE_API_KEY: "Google",
  GOOGLE_GENERATIVE_AI_API_KEY: "Google",
  DEEPSEEK_API_KEY: "DeepSeek",
  MISTRAL_API_KEY: "Mistral",
  COHERE_API_KEY: "Cohere",
};

function scoreMultiProvider(envKeys: Record<string, boolean>): { score: number; evidence: EvidenceItem } {
  const providers = new Set<string>();
  for (const [key, name] of Object.entries(PROVIDER_KEYS)) {
    if (envKeys[key]) providers.add(name);
  }
  const count = providers.size;
  const detail = count > 0 ? [...providers].join(", ") : "None detected";
  const status = count > 0 ? "found" as const : "missing" as const;
  let score: number;
  if (count >= 3) score = 8;
  else if (count === 2) score = 5;
  else if (count === 1) score = 2;
  else score = 0;
  return { score, evidence: { label: "Multi-Provider", status, detail } };
}

function scoreLocalModels(ollamaModels: string[] | null): { score: number; evidence: EvidenceItem } {
  if (ollamaModels === null) {
    return { score: 0, evidence: { label: "Local Models", status: "missing", detail: "Ollama not installed" } };
  }
  if (ollamaModels.length === 0) {
    return { score: 3, evidence: { label: "Local Models", status: "found", detail: "Ollama installed, no models pulled" } };
  }
  return {
    score: 7,
    evidence: { label: "Local Models", status: "found", detail: `${ollamaModels.length} models: ${ollamaModels.slice(0, 5).join(", ")}` },
  };
}

export function scanBrain(input: BrainInput): DimensionResult {
  const model = scoreModelTier(input.claudeModel);
  const provider = scoreMultiProvider(input.envKeys);
  const local = scoreLocalModels(input.ollamaModels);
  const score = Math.min(25, model.score + provider.score + local.score);
  return {
    name: "brain",
    score,
    maxScore: 25,
    evidence: [model.evidence, provider.evidence, local.evidence],
  };
}
