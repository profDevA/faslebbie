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

// v2 shell — top (name dominant) and scrolled (name faded, text forward)
const v2url = new URL("/v2", url).href;
await page.setViewport({ width: 1440, height: 900 });
await page.goto(v2url, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: `${outDir}/v2-top.png` });
await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.1));
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: `${outDir}/v2-scrolled.png` });

// v2 About content (below the 220vh hero)
await page.evaluate(() => {
  const about = document.getElementById("about");
  about?.scrollIntoView({ behavior: "instant", block: "start" });
});
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: `${outDir}/v2-about.png`, fullPage: false });

// Click an About keyword to verify the dropdown expands
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("#about [data-about-key]")].find(
    (b) => b.textContent?.trim() === "teach",
  );
  btn?.click();
});
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: `${outDir}/v2-about-open.png`, fullPage: false });

// v2 mobile
await page.setViewport({ width: 402, height: 900 });
await page.goto(v2url, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: `${outDir}/v2-mobile-top.png` });
await page.evaluate(() => document.getElementById("about")?.scrollIntoView());
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: `${outDir}/v2-mobile-about.png` });

// About page — desktop, testimonials pop-up, mobile
const aboutUrl = new URL("/about", url).href;
await page.setViewport({ width: 1440, height: 1000 });
await page.goto(aboutUrl, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: `${outDir}/about.png`, fullPage: true });
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("[data-about-key]")].find(
    (b) => b.textContent?.trim().startsWith("what people"),
  );
  btn?.click();
});
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: `${outDir}/about-testimonials.png` });
await page.setViewport({ width: 402, height: 900 });
await page.goto(aboutUrl, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: `${outDir}/about-mobile.png`, fullPage: true });

await browser.close();
console.log(`saved to ${outDir}/`);
