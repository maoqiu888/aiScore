import { describe, it, expect } from "vitest";
import { scanBrain } from "../../src/scanner/brain.js";

describe("scanBrain", () => {
  it("scores high for opus model based on ELO", () => {
    const result = scanBrain({ claudeModel: "claude-opus-4-6" });
    expect(result.score).toBeGreaterThanOrEqual(20);
    const ev = result.evidence.find((e) => e.label === "Model");
    expect(ev?.status).toBe("found");
    expect(ev?.detail).toContain("Opus");
    expect(ev?.detail).toContain("ELO");
  });

  it("scores lower for sonnet than opus", () => {
    const opus = scanBrain({ claudeModel: "claude-opus-4-6" });
    const sonnet = scanBrain({ claudeModel: "claude-sonnet-4-6" });
    expect(opus.score).toBeGreaterThan(sonnet.score);
  });

  it("scores lower for haiku than sonnet", () => {
    const sonnet = scanBrain({ claudeModel: "claude-sonnet-4-6" });
    const haiku = scanBrain({ claudeModel: "claude-haiku-4.5-20251001" });
    expect(sonnet.score).toBeGreaterThan(haiku.score);
  });

  it("scores 0 for no model detected", () => {
    const result = scanBrain({ claudeModel: null });
    expect(result.score).toBe(0);
    expect(result.evidence[0].status).toBe("missing");
  });

  it("gives baseline score for unknown model", () => {
    const result = scanBrain({ claudeModel: "some-unknown-model-v99" });
    expect(result.score).toBe(10);
    expect(result.evidence[0].detail).toContain("unranked");
  });

  it("maxScore is always 25", () => {
    const result = scanBrain({ claudeModel: null });
    expect(result.maxScore).toBe(25);
  });
});
