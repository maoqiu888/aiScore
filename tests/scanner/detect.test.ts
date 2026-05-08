import { describe, it, expect } from "vitest";
import { parseOllamaList, extractMcpNames, extractSkillNames } from "../../src/scanner/detect.js";

describe("parseOllamaList", () => {
  it("parses ollama list output into model names", () => {
    const output = `NAME              ID            SIZE    MODIFIED
llama3:latest     abc123        4.7 GB  2 days ago
codellama:latest  def456        3.8 GB  5 days ago`;
    expect(parseOllamaList(output)).toEqual(["llama3:latest", "codellama:latest"]);
  });

  it("returns empty array for empty output", () => {
    expect(parseOllamaList("")).toEqual([]);
  });
});

describe("extractMcpNames", () => {
  it("extracts MCP server names from .mcp.json", () => {
    const config = {
      mcpServers: {
        "mysql-dev": { command: "npx", args: [] },
        "brave-search": { command: "npx", args: [] },
      },
    };
    expect(extractMcpNames(config)).toEqual(["mysql-dev", "brave-search"]);
  });

  it("extracts from claude_desktop_config.json format", () => {
    const config = {
      mcpServers: {
        github: { command: "npx", args: [] },
      },
    };
    expect(extractMcpNames(config)).toEqual(["github"]);
  });

  it("returns empty for invalid config", () => {
    expect(extractMcpNames(null)).toEqual([]);
    expect(extractMcpNames({})).toEqual([]);
  });
});

describe("extractSkillNames", () => {
  it("extracts skill plugin names from plugins directory listing", () => {
    const dirs = ["superpowers", "document-skills", "example-skills"];
    expect(extractSkillNames(dirs)).toEqual(["superpowers", "document-skills", "example-skills"]);
  });

  it("returns empty array for empty input", () => {
    expect(extractSkillNames([])).toEqual([]);
  });
});
