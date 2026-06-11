// Dev helper: screenshot the homepage states via headless Edge.
// Usage: node scripts/screenshot.mjs [url] [outDir]
import puppeteer from "puppeteer-core";
import { existsSync, mkdirSync } from "node:fs";

const url = process.argv[2] ?? "http://localhost:3001/";
const outDir = process.argv[3] ?? ".dev-shots";

const edgePaths = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];
const executablePath = edgePaths.find((p) => existsSync(p));
if (!executablePath) throw new Error("Edge not found");

mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });
await page.goto(url, { waitUntil: "networkidle0" });
await page.screenshot({ path: `${outDir}/home-default.png` });

// Expand the "design" keyword panel
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("main button")].find(
    (b) => b.textContent?.trim() === "design",
  );
  if (!btn) throw new Error("design keyword button not found");
  btn.click();
});
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: `${outDir}/home-design-open.png` });

await browser.close();
console.log(`saved to ${outDir}/`);
