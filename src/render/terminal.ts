import chalk from "chalk";
import boxen from "boxen";
import type { DimensionResult, EvidenceItem, CategoryCoverage, Suggestion } from "../types.js";

const DIMENSION_LABELS: Record<string, { icon: string; label: string }> = {
  brain: { icon: "🧠", label: "Brain" },
  power: { icon: "⚡", label: "Power" },
  tuning: { icon: "🎯", label: "Tuning" },
  ecosystem: { icon: "🌐", label: "Ecosystem" },
};

export function renderBar(score: number, max: number, width: number): string {
  const filled = Math.round((score / max) * width);
  const empty = width - filled;
  return chalk.green("█".repeat(filled)) + chalk.gray("░".repeat(empty));
}

export function renderScoreBox(total: number, grade: string, title: string): string {
  const lines = [
    `⚡ AI SCORE: ${total} / 100`,
    `等级: ${grade} — ${title}`,
  ];
  const content = lines.map((l) => chalk.bold.white(l)).join("\n");
  return boxen(content, {
    padding: 1,
    borderStyle: "double",
    borderColor: "cyan",
    textAlignment: "center",
  });
}

export function renderDimensions(dimensions: DimensionResult[]): string {
  const lines: string[] = [];
  for (const dim of dimensions) {
    const meta = DIMENSION_LABELS[dim.name] ?? { icon: "?", label: dim.name };
    const bar = renderBar(dim.score, dim.maxScore, 18);
    const scoreStr = `${dim.score}/${dim.maxScore}`;
    lines.push(`  ${meta.icon} ${meta.label.padEnd(12)} ${bar}  ${scoreStr}`);
  }
  return lines.join("\n");
}

export function renderEvidence(dimensions: DimensionResult[]): string {
  const lines: string[] = [chalk.gray("  ── 凭据 Evidence ───────────────────────")];
  for (const dim of dimensions) {
    const meta = DIMENSION_LABELS[dim.name] ?? { icon: "?", label: dim.name };
    lines.push("");
    lines.push(`  ${meta.icon} ${chalk.bold(meta.label)}`);
    for (const ev of dim.evidence) {
      const icon = ev.status === "found" ? chalk.green("✓") : chalk.red("✗");
      const detail = ev.detail ? chalk.gray(` ${ev.detail}`) : "";
      lines.push(`     ${icon} ${ev.label}${detail}`);
    }
  }
  return lines.join("\n");
}

export function renderCategories(categories: CategoryCoverage[]): string {
  const lines: string[] = [chalk.gray("  ── 能力域覆盖 ──────────────────────────")];
  for (const cat of categories) {
    const barWidth = 16;
    let bar: string;
    let level: string;
    if (cat.covered) {
      bar = chalk.green("█".repeat(barWidth));
      level = chalk.green("强");
    } else {
      bar = chalk.gray("░".repeat(barWidth));
      level = chalk.red("缺失");
    }
    lines.push(`  ${cat.label.padEnd(8)} ${bar}  ${level}`);
  }
  return lines.join("\n");
}

export function renderSuggestions(suggestions: Suggestion[]): string {
  if (suggestions.length === 0) return "";
  const lines: string[] = [
    "",
    chalk.yellow("  💡 提升建议:"),
  ];
  suggestions.forEach((s, i) => {
    lines.push(`     ${i + 1}. ${chalk.green(`+${s.points} 分`)} → ${s.action}`);
  });
  return lines.join("\n");
}

export function renderFullReport(
  total: number,
  grade: string,
  title: string,
  dimensions: DimensionResult[],
  categories: CategoryCoverage[],
  suggestions: Suggestion[],
  cardPath?: string,
): string {
  const parts: string[] = [
    renderScoreBox(total, grade, title),
    "",
    renderDimensions(dimensions),
    "",
    renderEvidence(dimensions),
    "",
    renderCategories(categories),
    renderSuggestions(suggestions),
  ];
  if (cardPath) {
    parts.push("");
    parts.push(chalk.cyan(`  📸 评分卡片已保存: ${cardPath}`));
  }
  return parts.join("\n");
}
