export interface SkillCategoryDef {
  id: string;
  label: string;
  weight: number;
  patterns: string[];
}

export const SKILL_CATEGORIES: SkillCategoryDef[] = [
  {
    id: "coding",
    label: "编码规范",
    weight: 6,
    patterns: [
      "test-driven-development", "tdd", "code-review", "requesting-code-review",
      "receiving-code-review", "debugging", "systematic-debugging",
      "verification-before-completion", "simplify",
    ],
  },
  {
    id: "workflow",
    label: "工程流程",
    weight: 5,
    patterns: [
      "brainstorming", "writing-plans", "executing-plans",
      "using-git-worktrees", "subagent-driven-development",
      "dispatching-parallel-agents", "finishing-a-development-branch",
    ],
  },
  {
    id: "api-integration",
    label: "API/集成",
    weight: 5,
    patterns: [
      "claude-api", "mcp-builder",
    ],
  },
  {
    id: "frontend",
    label: "前端设计",
    weight: 4,
    patterns: [
      "frontend-design", "ui-ux-pro-max", "webapp-testing",
      "web-artifacts-builder", "theme-factory",
    ],
  },
  {
    id: "docs",
    label: "文档输出",
    weight: 3,
    patterns: [
      "docx", "pdf", "pptx", "xlsx", "doc-coauthoring", "internal-comms",
    ],
  },
  {
    id: "creative",
    label: "创意生成",
    weight: 3,
    patterns: [
      "algorithmic-art", "canvas-design", "slack-gif-creator",
      "brand-guidelines",
    ],
  },
];

const SUITES: Record<string, string[]> = {
  superpowers: [
    "using-superpowers", "brainstorming", "writing-plans", "executing-plans",
    "test-driven-development", "systematic-debugging", "requesting-code-review",
    "receiving-code-review", "verification-before-completion",
    "dispatching-parallel-agents", "subagent-driven-development",
    "using-git-worktrees", "finishing-a-development-branch", "writing-skills",
  ],
  "document-skills": [
    "doc-coauthoring", "mcp-builder", "web-artifacts-builder", "theme-factory",
    "frontend-design", "canvas-design", "algorithmic-art", "claude-api",
    "slack-gif-creator", "internal-comms", "brand-guidelines",
    "pptx", "xlsx", "pdf", "docx", "webapp-testing", "skill-creator",
  ],
};

export function getSkillCategory(skillName: string): string | null {
  const lower = skillName.toLowerCase();
  for (const cat of SKILL_CATEGORIES) {
    if (cat.patterns.some((p) => lower.includes(p))) {
      return cat.id;
    }
  }
  return null;
}

export function getSkillCategoryWeight(categoryId: string): number {
  return SKILL_CATEGORIES.find((c) => c.id === categoryId)?.weight ?? 0;
}

export function expandSuite(suiteName: string): string[] {
  return SUITES[suiteName] ?? [];
}
