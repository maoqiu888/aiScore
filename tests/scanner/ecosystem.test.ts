import { describe, it, expect } from "vitest";
import { scanEcosystem } from "../../src/scanner/ecosystem.js";

describe("scanEcosystem", () => {
  it("scores 3 per installed tool, max 12", () => {
    const result = scanEcosystem({
      installedTools: ["Claude Code", "Cursor", "Copilot"],
      toolConfigs: [],
    });
    const toolEvidence = result.evidence.find((e) => e.label === "AI Tools");
    expect(toolEvidence?.status).toBe("found");
    expect(result.score).toBeGreaterThanOrEqual(9);
  });

  it("caps tool score at 12", () => {
    const result = scanEcosystem({
      installedTools: ["Claude Code", "Cursor", "Copilot", "Windsurf", "Cline"],
      toolConfigs: [],
    });
    expect(result.score).toBeLessThanOrEqual(12);
  });

  it("scores 2 per configured tool, max 8", () => {
    const result = scanEcosystem({
      installedTools: [],
      toolConfigs: [
        { tool: "Claude Code", hasConfig: true },
        { tool: "Cursor", hasConfig: true },
        { tool: "Copilot", hasConfig: true },
        { tool: "Windsurf", hasConfig: true },
      ],
    });
    const configEvidence = result.evidence.find((e) => e.label === "Tool Configs");
    expect(configEvidence?.status).toBe("found");
    expect(result.score).toBe(8);
  });

  it("does not count unconfigured tools", () => {
    const result = scanEcosystem({
      installedTools: [],
      toolConfigs: [
        { tool: "Claude Code", hasConfig: true },
        { tool: "Cursor", hasConfig: false },
      ],
    });
    expect(result.score).toBe(2);
  });

  it("maxScore is always 20", () => {
    const result = scanEcosystem({ installedTools: [], toolConfigs: [] });
    expect(result.maxScore).toBe(20);
  });

  it("scores 0 for empty ecosystem", () => {
    const result = scanEcosystem({ installedTools: [], toolConfigs: [] });
    expect(result.score).toBe(0);
  });
});
