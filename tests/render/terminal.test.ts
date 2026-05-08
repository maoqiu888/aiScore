import { describe, it, expect } from "vitest";
import { renderBar, renderScoreBox, renderDimensions, renderSuggestions } from "../../src/render/terminal.js";
import type { DimensionResult, Suggestion } from "../../src/types.js";

describe("renderBar", () => {
  it("renders a progress bar of the correct length", () => {
    const bar = renderBar(50, 100, 20);
    // Strip ANSI codes to check raw character count
    const clean = bar.replace(/\x1b\[[0-9;]*m/g, "");
    expect(clean).toHaveLength(20);
  });

  it("renders full bar at max score", () => {
    const bar = renderBar(100, 100, 10);
    const clean = bar.replace(/\x1b\[[0-9;]*m/g, "");
    expect(clean).toBe("██████████");
  });

  it("renders empty bar at 0", () => {
    const bar = renderBar(0, 100, 10);
    const clean = bar.replace(/\x1b\[[0-9;]*m/g, "");
    expect(clean).toBe("░░░░░░░░░░");
  });
});

describe("renderScoreBox", () => {
  it("includes the total score", () => {
    const output = renderScoreBox(87, "S", "AI 武装到牙齿");
    expect(output).toContain("87");
    expect(output).toContain("100");
  });

  it("includes the grade and title", () => {
    const output = renderScoreBox(87, "S", "AI 武装到牙齿");
    expect(output).toContain("S");
    expect(output).toContain("AI 武装到牙齿");
  });
});

describe("renderDimensions", () => {
  it("renders all four dimensions", () => {
    const dims: DimensionResult[] = [
      { name: "brain", score: 20, maxScore: 25, evidence: [] },
      { name: "power", score: 25, maxScore: 30, evidence: [] },
      { name: "tuning", score: 18, maxScore: 25, evidence: [] },
      { name: "ecosystem", score: 15, maxScore: 20, evidence: [] },
    ];
    const output = renderDimensions(dims);
    expect(output).toContain("Brain");
    expect(output).toContain("Power");
    expect(output).toContain("Tuning");
    expect(output).toContain("Ecosystem");
    expect(output).toContain("20/25");
    expect(output).toContain("25/30");
  });
});

describe("renderSuggestions", () => {
  it("renders suggestion list", () => {
    const suggestions: Suggestion[] = [
      { points: 5, action: "安装 Sentry MCP" },
      { points: 3, action: "配置 brave-search" },
    ];
    const output = renderSuggestions(suggestions);
    expect(output).toContain("+5");
    expect(output).toContain("Sentry");
  });

  it("returns empty string when no suggestions", () => {
    const output = renderSuggestions([]);
    expect(output).toBe("");
  });
});
