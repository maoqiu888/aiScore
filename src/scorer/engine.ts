import type {
  DimensionResult,
  CategoryCoverage,
  GradeInfo,
  Grade,
  Suggestion,
  ScoreReport,
} from "../types.js";

const GRADE_TABLE: { min: number; grade: Grade; title: string }[] = [
  { min: 90, grade: "SSS", title: "AI 军神" },
  { min: 80, grade: "S", title: "AI 武装到牙齿" },
  { min: 70, grade: "A", title: "AI 高玩" },
  { min: 60, grade: "B", title: "AI 熟练工" },
  { min: 40, grade: "C", title: "AI 入门选手" },
  { min: 0, grade: "D", title: "AI 裸奔中" },
];

export function getGradeInfo(total: number): GradeInfo {
  for (const entry of GRADE_TABLE) {
    if (total >= entry.min) {
      return { grade: entry.grade, title: entry.title };
    }
  }
  return { grade: "D", title: "AI 裸奔中" };
}

function buildSuggestions(categories: CategoryCoverage[]): Suggestion[] {
  return categories
    .filter((c) => !c.covered)
    .map((c) => ({
      points: c.weight,
      action: `补充 ${c.label} 能力（+${c.weight} 分）`,
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);
}

export function computeReport(
  dimensions: DimensionResult[],
  categories: CategoryCoverage[],
): ScoreReport {
  const total = dimensions.reduce((sum, d) => sum + d.score, 0);
  const maxTotal = dimensions.reduce((sum, d) => sum + d.maxScore, 0);
  const gradeInfo = getGradeInfo(total);
  const suggestions = buildSuggestions(categories);

  return { total, maxTotal, gradeInfo, dimensions, categories, suggestions };
}
