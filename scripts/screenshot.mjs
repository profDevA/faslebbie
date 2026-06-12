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

// Mobile (iPhone-ish width)
await page.setViewport({ width: 402, height: 900 });
await page.goto(url, { waitUntil: "networkidle0" });
await page.screenshot({ path: `${outDir}/mobile-default.png`, fullPage: true });

// Mobile: expand the "design" keyword panel
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("main button")].find(
    (b) => b.textContent?.trim() === "design",
  );
  btn?.click();
});
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: `${outDir}/mobile-panel.png`, fullPage: true });
await page.reload({ waitUntil: "networkidle0" });

// Mobile menu open
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("header button")].find(
    (b) => b.textContent?.trim().toLowerCase() === "menu",
  );
  btn?.click();
});
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: `${outDir}/mobile-menu.png` });

// iPad portrait
await page.setViewport({ width: 768, height: 1024 });
await page.goto(url, { waitUntil: "networkidle0" });
await page.screenshot({ path: `${outDir}/ipad-default.png` });

await browser.close();
console.log(`saved to ${outDir}/`);
