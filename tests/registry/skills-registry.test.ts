import { describe, it, expect } from "vitest";
import {
  getSkillCategory,
  SKILL_CATEGORIES,
  getSkillCategoryWeight,
  expandSuite,
} from "../../src/registry/skills-registry.js";

describe("skills-registry", () => {
  it("returns correct category for known skills", () => {
    expect(getSkillCategory("test-driven-development")).toBe("coding");
    expect(getSkillCategory("brainstorming")).toBe("workflow");
    expect(getSkillCategory("frontend-design")).toBe("frontend");
    expect(getSkillCategory("docx")).toBe("docs");
    expect(getSkillCategory("algorithmic-art")).toBe("creative");
    expect(getSkillCategory("claude-api")).toBe("api-integration");
  });

  it("returns null for unknown skills", () => {
    expect(getSkillCategory("completely-unknown-skill")).toBeNull();
  });

  it("category weights match spec", () => {
    expect(getSkillCategoryWeight("coding")).toBe(6);
    expect(getSkillCategoryWeight("workflow")).toBe(5);
    expect(getSkillCategoryWeight("api-integration")).toBe(5);
    expect(getSkillCategoryWeight("frontend")).toBe(4);
    expect(getSkillCategoryWeight("docs")).toBe(3);
    expect(getSkillCategoryWeight("creative")).toBe(3);
  });

  it("expands superpowers suite into individual skills", () => {
    const skills = expandSuite("superpowers");
    expect(skills.length).toBeGreaterThan(5);
    expect(skills).toContain("test-driven-development");
    expect(skills).toContain("brainstorming");
    expect(skills).toContain("systematic-debugging");
  });

  it("returns empty array for unknown suite", () => {
    expect(expandSuite("no-such-suite")).toEqual([]);
  });
});
