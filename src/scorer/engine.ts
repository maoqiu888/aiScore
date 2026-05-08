import type {
  DimensionResult,
  CategoryCoverage,
  GradeInfo,
  Grade,
  Suggestion,
  ScoreReport,
} from "../types.js";

const GRADE_TABLE: { min: number; grade: Grade; title: string; comment: string }[] = [
  { min: 90, grade: "SSS", title: "天道演算使", comment: "你已超越凡尘，AI 在你手中如臂使指" },
  { min: 80, grade: "S", title: "万法归一", comment: "工具与心合一，万法皆为你所用" },
  { min: 70, grade: "A", title: "御灵尊者", comment: "大模型在你手中已初具威力" },
  { min: 60, grade: "B", title: "阵法小成", comment: "基础扎实，继续修炼前途无量" },
  { min: 40, grade: "C", title: "初窥门径", comment: "修仙之路刚刚开始，潜力无穷" },
  { min: 0, grade: "D", title: "凡骨未褪", comment: "是时候踏入 AI 修仙之路了" },
];

export function getGradeInfo(total: number): GradeInfo {
  for (const entry of GRADE_TABLE) {
    if (total >= entry.min) {
      return { grade: entry.grade, title: entry.title, comment: entry.comment };
    }
  }
  return { grade: "D", title: "凡骨未褪", comment: "是时候踏入 AI 修仙之路了" };
}

export function estimateBeatPercent(total: number): number {
  // Sigmoid-like curve: most users cluster around 30-50
  if (total >= 95) return 99;
  if (total >= 90) return 97;
  if (total >= 80) return 92;
  if (total >= 70) return 82;
  if (total >= 60) return 68;
  if (total >= 50) return 52;
  if (total >= 40) return 35;
  if (total >= 30) return 20;
  if (total >= 20) return 10;
  return 5;
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
  modelName?: string,
): ScoreReport {
  const total = dimensions.reduce((sum, d) => sum + d.score, 0);
  const maxTotal = dimensions.reduce((sum, d) => sum + d.maxScore, 0);
  const gradeInfo = getGradeInfo(total);
  const suggestions = buildSuggestions(categories);
  const beatPercent = estimateBeatPercent(total);

  return { total, maxTotal, gradeInfo, dimensions, categories, suggestions, beatPercent, modelName };
}
