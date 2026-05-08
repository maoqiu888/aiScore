import type {
  DimensionResult,
  CategoryCoverage,
  GradeInfo,
  Grade,
  Suggestion,
  ScoreReport,
} from "../types.js";

const GRADE_TABLE: { min: number; grade: Grade; title: string }[] = [
  { min: 90, grade: "SSS", title: "天道演算使" },
  { min: 80, grade: "S", title: "万法归一" },
  { min: 70, grade: "A", title: "御灵尊者" },
  { min: 60, grade: "B", title: "阵法小成" },
  { min: 40, grade: "C", title: "初窥门径" },
  { min: 0, grade: "D", title: "凡骨未褪" },
];

export function getGradeInfo(total: number): GradeInfo {
  for (const entry of GRADE_TABLE) {
    if (total >= entry.min) {
      return { grade: entry.grade, title: entry.title };
    }
  }
  return { grade: "D", title: "凡骨未褪" };
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
