/**
 * Compare Figma @4x card exports vs Sanity cardThumbnail assets.
 * Reads:
 *   tmp/work-covers-figma-4x/<slug>.png
 *   tmp/work-covers-sanity/<slug>.png
 *
 * png-size via IHDR parse (no deps).
 */
import { createReadStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ROOT = process.cwd();
const FIGMA_DIR = join(ROOT, "tmp", "work-covers-figma-4x");
const SANITY_DIR = join(ROOT, "tmp", "work-covers-sanity");
const REPORT = join(ROOT, "tmp", "work-covers-comparison.md");

const SLUGS = [
  "2020-us-census-benefit-calculator",
  "experian-boost",
  "diamond-valuation-ai",
  "remote-assistant-object-detection",
  "financial-data-exchange",
  "design-assist-ai",
  "oc-digital-resource-navigator",
  "oc-links",
  "acme-lending",
];

function pngSize(path) {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(path);
    const chunks = [];
    stream.on("data", (c) => {
      chunks.push(c);
      if (Buffer.concat(chunks).length >= 24) {
        stream.destroy();
        const buf = Buffer.concat(chunks);
        if (buf.toString("ascii", 1, 4) !== "PNG") {
          reject(new Error(`${path}: not PNG`));
          return;
        }
        resolve({ w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) });
      }
    });
    stream.on("error", reject);
    stream.on("end", () => reject(new Error(`${path}: too small`)));
  });
}

async function fetchSanityThumbs() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_READ_TOKEN;
  const query = `*[_type == "caseStudy" && slug.current in $slugs]{
    "slug": slug.current,
    title,
    "url": cardThumbnail.asset->url,
    "w": cardThumbnail.asset->metadata.dimensions.width,
    "h": cardThumbnail.asset->metadata.dimensions.height,
    "size": cardThumbnail.asset->size
  }`;
  const url = `https://${projectId}.api.sanity.io/v2025-01-01/data/query/${dataset}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, params: { slugs: SLUGS } }),
  });
  const json = await res.json();
  if (json.error) throw new Error(JSON.stringify(json.error));
  return json.result;
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  mkdirSync(FIGMA_DIR, { recursive: true });
  mkdirSync(SANITY_DIR, { recursive: true });

  const sanityRows = await fetchSanityThumbs();
  const bySlug = new Map(sanityRows.map((r) => [r.slug, r]));

  for (const slug of SLUGS) {
    const row = bySlug.get(slug);
    if (!row?.url) {
      console.warn(`skip sanity download — no thumb: ${slug}`);
      continue;
    }
    const dest = join(SANITY_DIR, `${slug}.png`);
    const bytes = await download(row.url, dest);
    console.log(`sanity ${slug}: ${bytes} bytes`);
  }

  const lines = [
    "# Work `.img` cover comparison — Figma @4x vs Sanity",
    "",
    "Figma source: `2562:39181` (`.img` wall). Exports are card art frames @ **scale 4**.",
    "",
    "| Slug | Title | Figma @4x | Sanity now | Width Δ | File Δ | Replace? |",
    "|------|-------|-----------|------------|---------|--------|------------|",
  ];

  for (const slug of SLUGS) {
    const row = bySlug.get(slug);
    const figmaPath = join(FIGMA_DIR, `${slug}.png`);
    const sanityPath = join(SANITY_DIR, `${slug}.png`);
    const title = row?.title ?? slug;

    let figma = null;
    let sanity = null;
    let figmaBytes = 0;
    let sanityBytes = 0;

    if (existsSync(figmaPath)) {
      figma = await pngSize(figmaPath);
      figmaBytes = (await import("node:fs")).statSync(figmaPath).size;
    }
    if (existsSync(sanityPath)) {
      sanity = await pngSize(sanityPath);
      sanityBytes = (await import("node:fs")).statSync(sanityPath).size;
    }

    const figmaCell = figma
      ? `${figma.w}×${figma.h} (${Math.round(figmaBytes / 1024)}KB)`
      : "missing";
    const sanityCell = sanity
      ? `${sanity.w}×${sanity.h} (${Math.round(sanityBytes / 1024)}KB)`
      : row?.w
        ? `${row.w}×${row.h} (meta only)`
        : "missing";

    const widthDelta =
      figma && sanity
        ? `${sanity.w >= figma.w * 0.95 ? "≈" : "+"}${figma.w - sanity.w}px`
        : "—";

    const replace =
      !figma
        ? "no figma file"
        : !sanity && row?.w
          ? row.w < 600
            ? "**yes** (Sanity <600px)"
            : "maybe"
          : sanity && figma.w > sanity.w + 100
            ? "**yes** (Figma much larger)"
            : sanity && figma.w <= sanity.w + 50
              ? "no (Sanity OK)"
              : "review";

    lines.push(
      `| \`${slug}\` | ${title} | ${figmaCell} | ${sanityCell} | ${widthDelta} | ${figmaBytes && sanityBytes ? `${Math.round((figmaBytes - sanityBytes) / 1024)}KB` : "—"} | ${replace} |`,
    );
  }

  lines.push(
    "",
    "## Notes",
    "",
    "- **Replace yes** = Figma export is materially higher resolution than Sanity `cardThumbnail`.",
    "- Figma files live in `tmp/work-covers-figma-4x/`; copy to `tmp/work-covers/` then run `patch-work-img-covers.ts`.",
    "- Card-only art (no title/meta chrome) — matches existing patch script.",
    "",
  );

  writeFileSync(REPORT, lines.join("\n"));
  console.log(`\nWrote ${REPORT}`);
  console.log(lines.slice(4, 4 + SLUGS.length + 1).join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
