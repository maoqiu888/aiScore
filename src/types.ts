export interface McpEntry {
  name: string;
  category: string;
}

export interface SkillEntry {
  name: string;
  category: string;
  suite?: string;
}

export interface EvidenceItem {
  label: string;
  status: "found" | "missing";
  detail?: string;
}

export interface DimensionResult {
  name: "brain" | "power" | "config";
  score: number;
  maxScore: number;
  evidence: EvidenceItem[];
}

export interface CategoryCoverage {
  category: string;
  label: string;
  covered: boolean;
  weight: number;
}

export type Grade = "SSS" | "S" | "A" | "B" | "C" | "D";

export interface GradeInfo {
  grade: Grade;
  title: string;
  comment?: string;
}

export interface Suggestion {
  points: number;
  action: string;
}

export interface ScoreReport {
  total: number;
  maxTotal: number;
  gradeInfo: GradeInfo;
  dimensions: DimensionResult[];
  categories: CategoryCoverage[];
  suggestions: Suggestion[];
  beatPercent?: number;
  modelName?: string;
}
