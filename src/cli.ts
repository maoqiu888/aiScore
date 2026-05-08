import { Command } from "commander";
import chalk from "chalk";
import { detectAll } from "./scanner/detect.js";
import { scanBrain } from "./scanner/brain.js";
import { scanPower } from "./scanner/power.js";
import { scanConfig } from "./scanner/config.js";
import { computeReport } from "./scorer/engine.js";
import { renderFullReport } from "./render/terminal.js";
import { generateCard } from "./render/card.js";
import { MCP_CATEGORIES } from "./registry/mcp-registry.js";
import { SKILL_CATEGORIES } from "./registry/skills-registry.js";
import { getMcpCategory } from "./registry/mcp-registry.js";
import { getSkillCategory, expandSuite } from "./registry/skills-registry.js";
import type { CategoryCoverage } from "./types.js";

function buildCategories(mcpNames: string[], skillNames: string[]): CategoryCoverage[] {
  const coveredMcp = new Set<string>();
  for (const name of mcpNames) {
    const cat = getMcpCategory(name);
    if (cat) coveredMcp.add(cat);
  }

  const coveredSkill = new Set<string>();
  const allSkills = new Set<string>();
  for (const name of skillNames) {
    const expanded = expandSuite(name);
    if (expanded.length > 0) {
      for (const s of expanded) allSkills.add(s);
    } else {
      allSkills.add(name);
    }
  }
  for (const skill of allSkills) {
    const cat = getSkillCategory(skill);
    if (cat) coveredSkill.add(cat);
  }

  const categories: CategoryCoverage[] = [];
  for (const cat of MCP_CATEGORIES) {
    categories.push({
      category: cat.id,
      label: cat.label,
      covered: coveredMcp.has(cat.id),
      weight: cat.weight,
    });
  }
  for (const cat of SKILL_CATEGORIES) {
    categories.push({
      category: cat.id,
      label: cat.label,
      covered: coveredSkill.has(cat.id),
      weight: cat.weight,
    });
  }
  return categories;
}

export function run(): void {
  const program = new Command();
  program
    .name("ai-score")
    .description("AI toolchain benchmark — score your AI setup")
    .version("0.1.0")
    .option("--json", "Output raw JSON instead of formatted text")
    .option("--no-card", "Skip PNG card generation")
    .option("--offline", "Run fully offline, do not report score")
    .action(async (opts) => {
      console.log(chalk.cyan("\n  ⏳ Scanning your AI toolchain...\n"));

      const detected = detectAll();
      const brainResult = scanBrain(detected.brain);
      const powerResult = scanPower(detected.power);
      const configResult = scanConfig(detected.config);
      const dimensions = [brainResult, powerResult, configResult];
      const categories = buildCategories(detected.power.mcpNames, detected.power.skillNames);
      const brainEvidence = brainResult.evidence.find((e) => e.label === "Model");
      const modelName = brainEvidence?.detail?.split("(")[0]?.trim() ?? undefined;
      const report = computeReport(dimensions, categories, modelName);

      if (opts.json) {
        console.log(JSON.stringify(report, null, 2));
        return;
      }

      const output = renderFullReport(report);
      console.log(output);

      if (opts.card !== false) {
        try {
          const cardPath = "./ai-score-card.png";
          generateCard(report, cardPath);
          console.log(chalk.cyan(`  📸 评分卡片已保存: ${cardPath}\n`));
        } catch {
          console.log(chalk.yellow(`  ⚠️  卡片生成失败（可能缺少 canvas 依赖）\n`));
        }
      }

      console.log();
    });

  program.parse();
}
