import { describe, it, expect } from "vitest";
import { scanBrain } from "../../src/scanner/brain.js";

describe("scanBrain", () => {
  it("scores high for opus model", () => {
    const result = scanBrain({ modelId: "claude-opus-4-6" });
    expect(result.score).toBeGreaterThanOrEqual(25);
    expect(result.evidence[0].detail).toContain("Opus");
  });

  it("scores GPT-5.5 correctly", () => {
    const result = scanBrain({ modelId: "gpt-5.5" });
    expect(result.score).toBeGreaterThanOrEqual(20);
    expect(result.evidence[0].detail).toContain("GPT-5.5");
  });

  it("scores Gemini models", () => {
    const result = scanBrain({ modelId: "gemini-2.5-pro" });
    expect(result.score).toBeGreaterThan(15);
    expect(result.evidence[0].detail).toContain("Gemini");
  });

  it("scores DeepSeek models", () => {
    const result = scanBrain({ modelId: "deepseek-v3" });
    expect(result.score).toBeGreaterThan(15);
    expect(result.evidence[0].detail).toContain("DeepSeek");
  });

  it("scores Grok models", () => {
    const result = scanBrain({ modelId: "grok-4" });
    expect(result.score).toBeGreaterThan(20);
  });

  it("scores Qwen models", () => {
    const result = scanBrain({ modelId: "qwen-3" });
    expect(result.score).toBeGreaterThan(15);
  });

  it("scores Llama models", () => {
    const result = scanBrain({ modelId: "llama-4" });
    expect(result.score).toBeGreaterThan(15);
  });

  it("ranks opus > sonnet > haiku", () => {
    const opus = scanBrain({ modelId: "claude-opus-4-6" });
    const sonnet = scanBrain({ modelId: "claude-sonnet-4-6" });
    const haiku = scanBrain({ modelId: "claude-haiku-4.5" });
    expect(opus.score).toBeGreaterThan(sonnet.score);
    expect(sonnet.score).toBeGreaterThan(haiku.score);
  });

  it("scores 0 for no model", () => {
    const result = scanBrain({ modelId: null });
    expect(result.score).toBe(0);
  });

  it("gives baseline for unknown model", () => {
    const result = scanBrain({ modelId: "some-unknown-v99" });
    expect(result.score).toBe(10);
    expect(result.evidence[0].detail).toContain("unranked");
  });

  it("maxScore is 30", () => {
    expect(scanBrain({ modelId: null }).maxScore).toBe(30);
  });
});
