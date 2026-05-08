import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir, platform } from "node:os";
import type { ScoreReport } from "../types.js";

const WIDTH = 800;
const HEIGHT = 580;
const BG = "#0f172a";
const TEXT = "#e2e8f0";
const ACCENT = "#38bdf8";
const GREEN = "#4ade80";
const GRAY = "#475569";
const BAR_BG = "#1e293b";
const YELLOW = "#facc15";

const GRADE_COLORS: Record<string, string> = {
  SSS: "#ff6b6b",
  S: "#ffd43b",
  A: "#69db7c",
  B: "#74c0fc",
  C: "#b197fc",
  D: "#868e96",
};

const DIMENSION_META: Record<string, { marker: string; label: string; color: string }> = {
  brain: { marker: "[B]", label: "Brain", color: "#a78bfa" },
  power: { marker: "[P]", label: "Power", color: "#34d399" },
  config: { marker: "[C]", label: "Config", color: "#fbbf24" },
};

function tryLoadCjkFont(): boolean {
  const candidates = platform() === "win32"
    ? [
        "C:\\Windows\\Fonts\\msyh.ttc",
        "C:\\Windows\\Fonts\\simhei.ttf",
        "C:\\Windows\\Fonts\\simsun.ttc",
      ]
    : [
        "/System/Library/Fonts/PingFang.ttc",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
      ];
  for (const path of candidates) {
    if (existsSync(path)) {
      GlobalFonts.registerFromPath(path, "CJK");
      return true;
    }
  }
  return false;
}

const GRADE_TITLES_EN: Record<string, string> = {
  "天道演算使": "Dao Calculator",
  "万法归一": "All Laws as One",
  "御灵尊者": "Spirit Commander",
  "阵法小成": "Formation Adept",
  "初窥门径": "Glimpsed the Path",
  "凡骨未褪": "Mortal Bones",
};

function drawRoundedRect(
  ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>,
  x: number, y: number, w: number, h: number, r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function generateCard(report: ScoreReport, outputPath: string): void {
  const hasCjk = tryLoadCjkFont();
  const fontFamily = hasCjk ? "'CJK', sans-serif" : "sans-serif";

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Model name
  if (report.modelName) {
    ctx.fillStyle = GRAY;
    ctx.font = `16px ${fontFamily}`;
    ctx.textAlign = "center";
    const modelLabel = hasCjk ? `当前模型: ${report.modelName}` : `Model: ${report.modelName}`;
    ctx.fillText(modelLabel, WIDTH / 2, 35);
  }

  // Title
  ctx.fillStyle = ACCENT;
  ctx.font = `bold 22px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.fillText("AI SCORE", WIDTH / 2, 65);

  // Big score
  ctx.fillStyle = TEXT;
  ctx.font = `bold 80px ${fontFamily}`;
  ctx.fillText(`${report.total}`, WIDTH / 2 - 30, 155);

  ctx.font = `28px ${fontFamily}`;
  ctx.fillStyle = GRAY;
  ctx.fillText("/ 100", WIDTH / 2 + 55, 155);

  // Grade badge
  const gradeColor = GRADE_COLORS[report.gradeInfo.grade] ?? ACCENT;
  ctx.fillStyle = gradeColor;
  ctx.font = `bold 32px ${fontFamily}`;
  const title = hasCjk ? report.gradeInfo.title : (GRADE_TITLES_EN[report.gradeInfo.title] ?? report.gradeInfo.title);
  ctx.fillText(`${report.gradeInfo.grade}  ${title}`, WIDTH / 2, 200);

  // Beat percent
  if (report.beatPercent) {
    ctx.fillStyle = YELLOW;
    ctx.font = `bold 16px ${fontFamily}`;
    const beatLabel = hasCjk ? `击败了 ${report.beatPercent}% 的用户` : `Beat ${report.beatPercent}% of users`;
    ctx.fillText(beatLabel, WIDTH / 2, 228);
  }

  // Comment
  if (report.gradeInfo.comment) {
    ctx.fillStyle = GRAY;
    ctx.font = `italic 14px ${fontFamily}`;
    const comment = hasCjk ? report.gradeInfo.comment : "";
    if (comment) ctx.fillText(`"${comment}"`, WIDTH / 2, 252);
  }

  // Separator line
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 268);
  ctx.lineTo(700, 268);
  ctx.stroke();

  // Dimension bars
  const barX = 100;
  const barWidth = 420;
  const barHeight = 28;
  let barY = 290;

  for (const dim of report.dimensions) {
    const meta = DIMENSION_META[dim.name] ?? { marker: "?", label: dim.name, color: GREEN };

    // Label
    ctx.fillStyle = meta.color;
    ctx.font = `bold 18px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.fillText(meta.label, barX, barY + 20);

    // Bar background
    const bx = barX + 100;
    ctx.fillStyle = BAR_BG;
    drawRoundedRect(ctx, bx, barY, barWidth, barHeight, 6);
    ctx.fill();

    // Bar fill
    const fillWidth = Math.max(4, Math.round((dim.score / dim.maxScore) * barWidth));
    ctx.fillStyle = meta.color;
    drawRoundedRect(ctx, bx, barY, fillWidth, barHeight, 6);
    ctx.fill();

    // Score text
    ctx.fillStyle = TEXT;
    ctx.font = `bold 16px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.fillText(`${dim.score}/${dim.maxScore}`, bx + barWidth + 16, barY + 20);

    barY += 55;
  }

  // Suggestions hint
  if (report.suggestions.length > 0) {
    barY += 10;
    ctx.fillStyle = YELLOW;
    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "center";
    const topSuggestion = report.suggestions[0];
    ctx.fillText(`+${topSuggestion.points} pts available — run ai-score for details`, WIDTH / 2, barY);
  }

  // Footer
  ctx.fillStyle = GRAY;
  ctx.font = `13px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.fillText("github.com/maoqiu888/aiScore", WIDTH / 2, HEIGHT - 25);

  const buffer = canvas.toBuffer("image/png");
  writeFileSync(outputPath, buffer);
}
