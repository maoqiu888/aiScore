import { describe, it, expect } from "vitest";
import { scanTuning } from "../../src/scanner/tuning.js";

describe("scanTuning", () => {
  it("scores 8 for multiple instruction files", () => {
    const result = scanTuning({
      instructionFiles: [
        { name: "CLAUDE.md", lines: 80, hasHeadings: true },
        { name: ".cursorrules", lines: 30, hasHeadings: false },
      ],
      hasHooks: false,
      settingsLevel: "default",
    });
    const fileEvidence = result.evidence.find((e) => e.label === "Instruction Files");
    expect(fileEvidence?.status).toBe("found");
  });

  it("scores quality based on line count and structure", () => {
    const rich = scanTuning({
      instructionFiles: [{ name: "CLAUDE.md", lines: 80, hasHeadings: true }],
      hasHooks: false,
      settingsLevel: "default",
    });
    const thin = scanTuning({
      instructionFiles: [{ name: "CLAUDE.md", lines: 5, hasHeadings: false }],
      hasHooks: false,
      settingsLevel: "default",
    });
    expect(rich.score).toBeGreaterThan(thin.score);
  });

  it("scores 5 for hooks configured", () => {
    const withHooks = scanTuning({
      instructionFiles: [],
      hasHooks: true,
      settingsLevel: "default",
    });
    const without = scanTuning({
      instructionFiles: [],
      hasHooks: false,
      settingsLevel: "default",
    });
    expect(withHooks.score - without.score).toBe(5);
  });

  it("scores settings level correctly", () => {
    const rich = scanTuning({
      instructionFiles: [],
      hasHooks: false,
      settingsLevel: "rich",
    });
    const basic = scanTuning({
      instructionFiles: [],
      hasHooks: false,
      settingsLevel: "basic",
    });
    const def = scanTuning({
      instructionFiles: [],
      hasHooks: false,
      settingsLevel: "default",
    });
    expect(rich.score).toBeGreaterThan(basic.score);
    expect(basic.score).toBeGreaterThan(def.score);
  });

  it("maxScore is always 25", () => {
    const result = scanTuning({
      instructionFiles: [],
      hasHooks: false,
      settingsLevel: "default",
    });
    expect(result.maxScore).toBe(25);
  });
});
