import { describe, it, expect } from "vitest";
import { scanPower } from "../../src/scanner/power.js";

describe("scanPower", () => {
  it("scores MCP by category coverage, not count", () => {
    const result = scanPower({
      mcpNames: ["mysql", "postgres", "sqlite"],
      skillNames: [],
    });
    expect(result.score).toBeLessThanOrEqual(18);
  });

  it("scores higher for diverse MCP categories", () => {
    const narrow = scanPower({
      mcpNames: ["mysql", "postgres", "sqlite"],
      skillNames: [],
    });
    const broad = scanPower({
      mcpNames: ["mysql", "puppeteer", "brave-search"],
      skillNames: [],
    });
    expect(broad.score).toBeGreaterThan(narrow.score);
  });

  it("expands skill suites for scoring", () => {
    const result = scanPower({
      mcpNames: [],
      skillNames: ["superpowers"],
    });
    expect(result.score).toBeGreaterThan(0);
    const coverageEvidence = result.evidence.find((e) => e.label === "Skill Categories");
    expect(coverageEvidence?.status).toBe("found");
  });

  it("maxScore is always 30", () => {
    const result = scanPower({ mcpNames: [], skillNames: [] });
    expect(result.maxScore).toBe(30);
  });

  it("scores 0 when nothing is installed", () => {
    const result = scanPower({ mcpNames: [], skillNames: [] });
    expect(result.score).toBe(0);
  });
});
