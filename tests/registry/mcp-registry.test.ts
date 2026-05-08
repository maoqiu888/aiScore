import { describe, it, expect } from "vitest";
import {
  getMcpCategory,
  MCP_CATEGORIES,
  getMcpCategoryWeight,
} from "../../src/registry/mcp-registry.js";

describe("mcp-registry", () => {
  it("returns correct category for known MCP servers", () => {
    expect(getMcpCategory("mysql")).toBe("database");
    expect(getMcpCategory("postgres")).toBe("database");
    expect(getMcpCategory("puppeteer")).toBe("browser");
    expect(getMcpCategory("playwright")).toBe("browser");
    expect(getMcpCategory("brave-search")).toBe("search");
    expect(getMcpCategory("github")).toBe("code-repo");
    expect(getMcpCategory("sentry")).toBe("monitoring");
    expect(getMcpCategory("n8n")).toBe("automation");
    expect(getMcpCategory("slack")).toBe("collaboration");
    expect(getMcpCategory("filesystem")).toBe("filesystem");
    expect(getMcpCategory("figma")).toBe("specialized");
  });

  it("returns null for unknown MCP servers", () => {
    expect(getMcpCategory("totally-unknown-xyz")).toBeNull();
  });

  it("category weights match spec", () => {
    expect(getMcpCategoryWeight("database")).toBe(5);
    expect(getMcpCategoryWeight("browser")).toBe(5);
    expect(getMcpCategoryWeight("monitoring")).toBe(5);
    expect(getMcpCategoryWeight("search")).toBe(4);
    expect(getMcpCategoryWeight("code-repo")).toBe(4);
    expect(getMcpCategoryWeight("filesystem")).toBe(3);
    expect(getMcpCategoryWeight("collaboration")).toBe(3);
    expect(getMcpCategoryWeight("automation")).toBe(3);
    expect(getMcpCategoryWeight("specialized")).toBe(2);
  });

  it("has all 9 categories defined", () => {
    expect(MCP_CATEGORIES).toHaveLength(9);
  });
});
