export interface McpCategoryDef {
  id: string;
  label: string;
  weight: number;
  patterns: string[];
}

export const MCP_CATEGORIES: McpCategoryDef[] = [
  {
    id: "database",
    label: "数据访问",
    weight: 5,
    patterns: [
      "mysql", "postgres", "postgresql", "sqlite", "supabase", "mongodb",
      "redis", "dynamodb", "planetscale", "neon", "turso", "prisma",
      "drizzle", "sequelize",
    ],
  },
  {
    id: "browser",
    label: "浏览器",
    weight: 5,
    patterns: [
      "puppeteer", "playwright", "browserbase", "browser-tools",
      "browser-use", "selenium", "chromium", "browserless",
    ],
  },
  {
    id: "monitoring",
    label: "监控运维",
    weight: 5,
    patterns: [
      "sentry", "datadog", "grafana", "prometheus", "pagerduty",
      "opsgenie", "newrelic", "logflare", "axiom",
    ],
  },
  {
    id: "search",
    label: "搜索联网",
    weight: 4,
    patterns: [
      "brave-search", "tavily", "exa", "serper", "serpapi",
      "google-search", "bing-search", "duckduckgo", "perplexity",
    ],
  },
  {
    id: "code-repo",
    label: "代码仓库",
    weight: 4,
    patterns: [
      "github", "gitlab", "bitbucket", "gitea", "sourcegraph",
    ],
  },
  {
    id: "filesystem",
    label: "文件系统",
    weight: 3,
    patterns: [
      "filesystem", "google-drive", "dropbox", "s3", "cloudflare-r2",
      "minio",
    ],
  },
  {
    id: "collaboration",
    label: "通讯协作",
    weight: 3,
    patterns: [
      "slack", "linear", "notion", "jira", "asana", "trello",
      "discord", "teams", "confluence",
    ],
  },
  {
    id: "automation",
    label: "自动化",
    weight: 3,
    patterns: [
      "n8n", "zapier", "make", "ifttt", "temporal", "inngest",
    ],
  },
  {
    id: "specialized",
    label: "专业领域",
    weight: 2,
    patterns: [
      "figma", "stripe", "aws", "vercel", "netlify", "cloudflare",
      "twilio", "sendgrid", "resend", "docker", "kubernetes",
    ],
  },
];

export function getMcpCategory(mcpName: string): string | null {
  const lower = mcpName.toLowerCase();
  for (const cat of MCP_CATEGORIES) {
    if (cat.patterns.some((p) => lower.includes(p))) {
      return cat.id;
    }
  }
  return null;
}

export function getMcpCategoryWeight(categoryId: string): number {
  return MCP_CATEGORIES.find((c) => c.id === categoryId)?.weight ?? 0;
}
