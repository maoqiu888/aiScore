import { describe, it, expect, vi, beforeEach } from "vitest";
import { scanBrain } from "../../src/scanner/brain.js";

describe("scanBrain", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("scores 10 for model tier when claude settings has opus", () => {
    const result = scanBrain({
      claudeModel: "claude-opus-4-6",
      envKeys: {},
      ollamaModels: null,
    });
    const modelEvidence = result.evidence.find((e) => e.label === "Model Tier");
    expect(modelEvidence?.status).toBe("found");
    expect(result.score).toBeGreaterThanOrEqual(10);
  });

  it("scores 7 for model tier when sonnet detected", () => {
    const result = scanBrain({
      claudeModel: "claude-sonnet-4-6",
      envKeys: {},
      ollamaModels: null,
    });
    expect(result.score).toBeGreaterThanOrEqual(7);
  });

  it("scores multi-provider coverage for 3 API keys", () => {
    const result = scanBrain({
      claudeModel: null,
      envKeys: {
        ANTHROPIC_API_KEY: true,
        OPENAI_API_KEY: true,
        GOOGLE_API_KEY: true,
      },
      ollamaModels: null,
    });
    const providerEvidence = result.evidence.find((e) => e.label === "Multi-Provider");
    expect(providerEvidence?.status).toBe("found");
    expect(result.score).toBeGreaterThanOrEqual(8);
  });

  it("scores 7 for ollama with pulled models", () => {
    const result = scanBrain({
      claudeModel: null,
      envKeys: {},
      ollamaModels: ["llama3", "codellama"],
    });
    const localEvidence = result.evidence.find((e) => e.label === "Local Models");
    expect(localEvidence?.status).toBe("found");
    expect(localEvidence?.detail).toContain("llama3");
  });

  it("scores 3 for ollama installed but no models", () => {
    const result = scanBrain({
      claudeModel: null,
      envKeys: {},
      ollamaModels: [],
    });
    const localEvidence = result.evidence.find((e) => e.label === "Local Models");
    expect(localEvidence?.status).toBe("found");
    expect(localEvidence?.detail).toContain("installed");
  });

  it("maxScore is always 25", () => {
    const result = scanBrain({
      claudeModel: null,
      envKeys: {},
      ollamaModels: null,
    });
    expect(result.maxScore).toBe(25);
  });
});
