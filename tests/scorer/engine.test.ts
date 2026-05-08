import { describe, it, expect } from "vitest";
import { computeReport, getGradeInfo } from "../../src/scorer/engine.js";
import type { DimensionResult, CategoryCoverage } from "../../src/types.js";

describe("getGradeInfo", () => {
  it("returns SSS for 90-100", () => {
    expect(getGradeInfo(95).grade).toBe("SSS");
    expect(getGradeInfo(90).grade).toBe("SSS");
  });
  it("returns S for 80-89", () => {
    expect(getGradeInfo(85).grade).toBe("S");
  });
  it("returns A for 70-79", () => {
    expect(getGradeInfo(75).grade).toBe("A");
  });
  it("returns B for 60-69", () => {
    expect(getGradeInfo(65).grade).toBe("B");
  });
  it("returns C for 40-59", () => {
    expect(getGradeInfo(50).grade).toBe("C");
  });
  it("returns D for 0-39", () => {
    expect(getGradeInfo(20).grade).toBe("D");
  });
});

describe("computeReport", () => {
  const dimensions: DimensionResult[] = [
    { name: "brain", score: 25, maxScore: 30, evidence: [] },
    { name: "power", score: 32, maxScore: 40, evidence: [] },
    { name: "config", score: 21, maxScore: 30, evidence: [] },
  ];

  const categories: CategoryCoverage[] = [
    { category: "database", label: "数据访问", covered: true, weight: 5 },
    { category: "browser", label: "浏览器", covered: false, weight: 5 },
    { category: "monitoring", label: "监控运维", covered: false, weight: 5 },
  ];

  it("sums dimension scores into total", () => {
    const report = computeReport(dimensions, categories);
    expect(report.total).toBe(78);
    expect(report.maxTotal).toBe(100);  // 30+40+30
  });

  it("assigns correct grade", () => {
    const report = computeReport(dimensions, categories);
    expect(report.gradeInfo.grade).toBe("A");
  });

  it("generates suggestions for uncovered high-weight categories", () => {
    const report = computeReport(dimensions, categories);
    expect(report.suggestions.length).toBeGreaterThan(0);
    expect(report.suggestions[0].points).toBeGreaterThanOrEqual(report.suggestions[1]?.points ?? 0);
  });

  it("suggestions are sorted by points descending", () => {
    const report = computeReport(dimensions, categories);
    for (let i = 1; i < report.suggestions.length; i++) {
      expect(report.suggestions[i - 1].points).toBeGreaterThanOrEqual(report.suggestions[i].points);
    }
  });
});
