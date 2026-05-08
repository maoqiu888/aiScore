import { describe, it, expect } from "vitest";
import { scanEcosystem } from "../../src/scanner/ecosystem.js";

describe("scanEcosystem", () => {
  it("scores 3 per installed tool, max 12", () => {
    const result = scanEcosystem({
      installedTools: ["claude", "cursor", "copilot"],
      apiKeyNames: [],
    });
    const toolEvidence = result.evidence.find((e) => e.label === "AI Tools");
    expect(toolEvidence?.status).toBe("found");
    expect(result.score).toBeGreaterThanOrEqual(9);
  });

  it("caps tool score at 12", () => {
    const result = scanEcosystem({
      installedTools: ["claude", "cursor", "copilot", "windsurf", "cline"],
      apiKeyNames: [],
    });
    // 5 tools × 3 = 15, but cap at 12
    expect(result.score).toBeLessThanOrEqual(12);
  });

  it("scores 2 per API key, max 8", () => {
    const result = scanEcosystem({
      installedTools: [],
      apiKeyNames: ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY", "DEEPSEEK_API_KEY"],
    });
    const keyEvidence = result.evidence.find((e) => e.label === "API Keys");
    expect(keyEvidence?.status).toBe("found");
    expect(result.score).toBe(8);
  });

  it("maxScore is always 20", () => {
    const result = scanEcosystem({ installedTools: [], apiKeyNames: [] });
    expect(result.maxScore).toBe(20);
  });

  it("scores 0 for empty ecosystem", () => {
    const result = scanEcosystem({ installedTools: [], apiKeyNames: [] });
    expect(result.score).toBe(0);
  });
});
