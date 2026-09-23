/**
 * Work `.txt` intro — Meta/Franki paragraph project links:
 *   **Design Assist AI** → `design-assist-ai`
 *   **Circle** → `circle`
 *
 * Idempotent repair (fixes the bug where retargeting one mark sent DAI to Circle).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-work-intro-circle-link.ts --with-user-token
 */
import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";

console.log("patch-work-intro-circle-link starting");

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const BLOCK_KEY = "74d1b0cf76af";
const DAI_SLUG = "design-assist-ai";
const CIRCLE_SLUG = "circle";
const DAI_TEXT = "Design Assist AI";
const CIRCLE_TEXT = "Circle";

type Span = { _key: string; _type: string; text?: string; marks?: string[] };
type MarkDef = { _key: string; _type: string; slug?: string };

function slugForSpan(block: { markDefs?: MarkDef[] }, span: Span): string | undefined {
  const markKey = span.marks?.[0];
  if (!markKey) return undefined;
  const def = block.markDefs?.find((m) => m._key === markKey);
  if (def?._type !== "project") return undefined;
  return def.slug;
}

function isCorrect(block: { markDefs?: MarkDef[]; children?: Span[] }) {
  const dai = block.children?.find((c) => c.text === DAI_TEXT);
  const circle = block.children?.find((c) => c.text === CIRCLE_TEXT);
  return (
    slugForSpan(block, dai ?? {}) === DAI_SLUG &&
    slugForSpan(block, circle ?? {}) === CIRCLE_SLUG
  );
}

async function main() {
  const doc = await client.fetch<{ _id: string; intro?: unknown[] }>(
    `*[_type == "workPage"][0]{ _id, intro }`,
  );
  if (!doc?.intro?.length) throw new Error("workPage intro missing");

  const intro = structuredClone(doc.intro) as {
    _key: string;
    _type: string;
    children?: Span[];
    markDefs?: MarkDef[];
  }[];

  const block = intro.find((b) => b._key === BLOCK_KEY);
  if (!block?.children) throw new Error(`Block ${BLOCK_KEY} not found`);

  if (isCorrect(block)) {
    console.log(`✓ workPage intro: ${DAI_TEXT} → ${DAI_SLUG}, ${CIRCLE_TEXT} → ${CIRCLE_SLUG}`);
    return;
  }

  console.log("before:");
  for (const c of block.children) {
    console.log(`  ${slugForSpan(block, c) ?? c.marks?.[0] ?? "—"} | ${c.text?.slice(0, 60)}`);
  }

  const metaTail =
    " made scattered research queryable, first for designers, then for engineering and product. ";
  const frankiBefore =
    "At Franki, I'm building the team across product design, research, and brand with sacrificial concepts like ";
  const frankiAfter =
    ", which proposed a system for turning a first purchase into a habit.";

  const daiMarkKey = key();
  const circleMarkKey = key();

  block.markDefs = (block.markDefs ?? []).filter((m) => m._type !== "project");
  block.markDefs.push(
    { _key: daiMarkKey, _type: "project", slug: DAI_SLUG },
    { _key: circleMarkKey, _type: "project", slug: CIRCLE_SLUG },
  );

  block.children = [
    {
      _key: key(),
      _type: "span",
      marks: [],
      text: "At Meta, I built a Scalar leadership approach to raise my team's craft and maturity. ",
    },
    { _key: key(), _type: "span", marks: [daiMarkKey], text: DAI_TEXT },
    { _key: key(), _type: "span", marks: [], text: metaTail },
    { _key: key(), _type: "span", marks: [], text: frankiBefore },
    { _key: key(), _type: "span", marks: [circleMarkKey], text: CIRCLE_TEXT },
    { _key: key(), _type: "span", marks: [], text: frankiAfter },
  ];

  await client.patch(doc._id).set({ intro }).commit();

  console.log("after:");
  for (const c of block.children) {
    console.log(`  ${slugForSpan(block, c) ?? "—"} | ${c.text?.slice(0, 60)}`);
  }
  console.log(`✓ workPage intro repaired — ${DAI_TEXT} → ${DAI_SLUG}, ${CIRCLE_TEXT} → ${CIRCLE_SLUG}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
