import type { DimensionResult, EvidenceItem } from "../types.js";
import { getMcpCategory, MCP_CATEGORIES } from "../registry/mcp-registry.js";
import {
  getSkillCategory,
  SKILL_CATEGORIES,
  expandSuite,
} from "../registry/skills-registry.js";

export interface PowerInput {
  mcpNames: string[];
  skillNames: string[];
}

function scoreMcp(mcpNames: string[]): { score: number; evidence: EvidenceItem; coveredCategories: Set<string> } {
  const coveredCategories = new Set<string>();
  const matched: string[] = [];

  for (const name of mcpNames) {
    const cat = getMcpCategory(name);
    if (cat) {
      coveredCategories.add(cat);
      matched.push(name);
    }
  }

  let weightSum = 0;
  for (const catId of coveredCategories) {
    const catDef = MCP_CATEGORIES.find((c) => c.id === catId);
    if (catDef) weightSum += catDef.weight;
  }

  const score = Math.min(18, weightSum);
  const detail = matched.length > 0
    ? `${matched.join(", ")} (${coveredCategories.size}/${MCP_CATEGORIES.length} categories)`
    : "None detected";
  const status = matched.length > 0 ? "found" as const : "missing" as const;

  return { score, evidence: { label: "MCP Servers", status, detail }, coveredCategories };
}

function scoreSkills(skillNames: string[]): { score: number; evidence: EvidenceItem; coveredCategories: Set<string> } {
  const allSkills = new Set<string>();
  const suiteNames: string[] = [];

  for (const name of skillNames) {
    const expanded = expandSuite(name);
    if (expanded.length > 0) {
      suiteNames.push(name);
      for (const s of expanded) allSkills.add(s);
    } else {
      allSkills.add(name);
    }
  }

  const coveredCategories = new Set<string>();
  for (const skill of allSkills) {
    const cat = getSkillCategory(skill);
    if (cat) coveredCategories.add(cat);
  }

  const totalWeight = SKILL_CATEGORIES.reduce((sum, c) => sum + c.weight, 0);
  let coveredWeight = 0;
  for (const catId of coveredCategories) {
    const catDef = SKILL_CATEGORIES.find((c) => c.id === catId);
    if (catDef) coveredWeight += catDef.weight;
  }

  const score = Math.min(12, Math.round((coveredWeight / totalWeight) * 12));

  const parts: string[] = [];
  if (suiteNames.length > 0) parts.push(`Suites: ${suiteNames.join(", ")}`);
  parts.push(`${coveredCategories.size}/${SKILL_CATEGORIES.length} categories`);
  const detail = parts.join(" | ");
  const status = coveredCategories.size > 0 ? "found" as const : "missing" as const;

  return { score, evidence: { label: "Skill Categories", status, detail }, coveredCategories };
}

export function scanPower(input: PowerInput): DimensionResult {
  const mcp = scoreMcp(input.mcpNames);
  const skills = scoreSkills(input.skillNames);
  const score = mcp.score + skills.score;

  return {
    name: "power",
    score,
    maxScore: 30,
    evidence: [mcp.evidence, skills.evidence],
  };
}
