/**
 * Parse case-study copy from the collaboration doc extract.
 * Run: node scripts/parse-case-study-collab-doc.mjs
 * Output: scripts/data/caseStudyCollabCopy.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const extractPath = join(__dir, "_tmp-collab-doc-extract.txt");
const outPath = join(__dir, "data", "caseStudyCollabCopy.json");

const DOC = readFileSync(extractPath, "utf8");

/** Map collaboration doc titles → Sanity slug.current */
export const TITLE_TO_SLUG = {
  "Coral Health": "coral-health",
  "Experian Boost": "experian-boost",
  "Financial Data Exchange": "financial-data-exchange",
  "Acme Lending": "acme-lending",
  "The AR Handbook": "remote-assistant-object-detection",
  "OC Links": "oc-links",
  Mosaic: "design-assist-ai",
  Galderma: "galderma",
  "Design Assist AI": "design-assist-ai",
  "Vuforia Chalk": "vuforia-chalk",
  "Life of a Miner VR": "life-of-a-miner-vr",
  "2020 US Census Benefit Calculator": "2020-us-census-benefit-calculator",
  "OC Digital Resource Navigator": "oc-digital-resource-navigator",
  "Diamond Valuation AI (Root Ally)": "diamond-valuation-ai",
  "Memory Tubes": "memory-tubes",
  "Vuforia Editor": "vuforia-expert-capture",
  "Snapback Lifestyle": "snapback-lifestyle",
  "Forever a Surfer": "forever-a-surfer",
};

function decodeEntities(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\u2019/g, "'")
    .replace(/\u201c/g, '"')
    .replace(/\u201d/g, '"')
    .trim();
}

function cleanLine(s) {
  return decodeEntities(s.replace(/\s+/g, " ").trim());
}

/** Value on the line after a label, before [TAG] or blank line. */
function fieldAfter(text, label) {
  const esc = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `(?:^|\\n)${esc}\\s*\\n([^\\n\\[]+?)(?=\\n\\[|$|\\n(?:\\d{2} — |Accordion |Metric |Group [A-D]|Experience block|Project name|Hero statement|Overview paragraph|Problem Context|What I Brought|My Approach|Reflections|Next Steps|Value:|Description \\(|Research &))`,
    "is",
  );
  const m = text.match(re);
  return m ? cleanLine(m[1]) : undefined;
}

function splitStudies(raw) {
  const parts = raw.split(/\n(?=[A-Za-z0-9][^\n]{0,80}— Filled Case Study)/);
  const studies = {};
  for (const part of parts) {
    const head = part.match(/^(.+?) — Filled Case Study/);
    if (!head) continue;
    const title = head[1].trim().replace(/\s+\*$/, "").replace(/ \(.*\)$/, "");
    const slug =
      TITLE_TO_SLUG[title] ??
      TITLE_TO_SLUG[head[1].trim().replace(/\s+\*$/, "")];
    if (!slug) {
      console.warn("! unmapped title:", head[1].trim());
      continue;
    }
    studies[slug] = parseStudy(part, title);
  }
  return studies;
}

function parseAccordions(sectionText) {
  const items = [];
  const re = /Accordion (\d+) — ([^\n]+)\n([\s\S]*?)(?=\nAccordion \d+ —|\n\[ screenshot|\n\d{2} — |$)/g;
  let m;
  while ((m = re.exec(sectionText))) {
    const body = m[3]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("[") && !l.startsWith("("))
      .join(" ");
    items.push({ title: cleanLine(m[2]), body: cleanLine(body) });
  }
  return items;
}

function parseMetrics(sectionText) {
  const items = [];
  const re =
    /Metric (\d+) — [^\n]+\nValue:\s*([^\n·]+?)\s*·\s*Label:\s*([^\n·]+?)\s*·\s*Description:\s*([^\n\[]+)/g;
  let m;
  while ((m = re.exec(sectionText))) {
    const value = cleanLine(m[2]);
    const suffixMatch = value.match(/^(\d+(?:\.\d+)?)(%|pts|×|x)?$/i);
    items.push({
      value: suffixMatch ? suffixMatch[1] : value.replace(/[^\d.]/g, "") || value,
      suffix: suffixMatch?.[2]?.replace(/x/i, "×") ?? "",
      label: cleanLine(m[3]),
      note: cleanLine(m[4]),
    });
  }
  return items;
}

function sectionChunk(studyText, numPrefix) {
  const re = new RegExp(
    `(\\n${numPrefix} — [\\s\\S]*?)(?=\\n\\d{2} — |\\nGaps we could not|$)`,
  );
  const m = studyText.match(re);
  return m ? m[1] : "";
}

function parseStudy(text, title) {
  const s01 = sectionChunk(text, "01");
  const s02 = sectionChunk(text, "02");
  const s03 = sectionChunk(text, "03");
  const s05 = sectionChunk(text, "05");
  const s06 = sectionChunk(text, "06");
  const s08 = sectionChunk(text, "08");
  const s09 = sectionChunk(text, "09");
  const s10 = sectionChunk(text, "10");

  const nextStepsRaw = fieldAfter(s10, "Next Steps paragraph (62 words)");
  const nextStepsItems = nextStepsRaw
    ? nextStepsRaw
        .split(/(?<=[.!?])\s+/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return {
    title,
    hero: {
      projectName: fieldAfter(s01, "Project name"),
      statement: fieldAfter(s01, "Hero statement"),
      from:
        fieldAfter(s01, '"From" value') ??
        fieldAfter(s01, "&quot;From&quot; value") ??
        fieldAfter(s01, "From value"),
      to:
        fieldAfter(s01, '"To" value') ??
        fieldAfter(s01, "&quot;To&quot; value") ??
        fieldAfter(s01, "To value"),
    },
    overview: {
      body: fieldAfter(s02, "Overview paragraph (102 words)"),
      disciplines: fieldAfter(s02, "Research & Design disciplines (15 words)"),
      duration: fieldAfter(s02, "Duration"),
      team: fieldAfter(s02, "Team"),
    },
    problemContext: {
      problem: fieldAfter(s03, "Problem Context paragraph (111 words)"),
      brought: fieldAfter(s03, "What I Brought paragraph (62 words)"),
    },
    approach: {
      blurb: fieldAfter(s05, "My Approach paragraph (36 words)"),
      accordion: parseAccordions(s05),
    },
    artifacts: {
      intro: fieldAfter(s06, "Description (14 words)") ?? fieldAfter(s06, "Description"),
    },
    desktopMotion: {
      body: fieldAfter(s08, "Description (29 words)") ?? fieldAfter(s08, "Description"),
    },
    impact: {
      metrics: parseMetrics(s09),
    },
    reflection: {
      body: fieldAfter(s10, "Reflections paragraph (111 words)"),
      nextSteps: nextStepsItems.length ? nextStepsItems : nextStepsRaw ? [nextStepsRaw] : [],
    },
  };
}

const studies = splitStudies(DOC);
writeFileSync(outPath, JSON.stringify(studies, null, 2), "utf8");
console.log(`parsed ${Object.keys(studies).length} studies → ${outPath}`);
for (const [slug, s] of Object.entries(studies)) {
  const ok = [
    s.hero.statement ? "hero" : "",
    s.overview.body ? "overview" : "",
    s.problemContext.problem ? "problem" : "",
    s.reflection.body ? "reflection" : "",
  ]
    .filter(Boolean)
    .join("+");
  console.log(`  ${slug}: ${ok || "(sparse)"}`);
}
