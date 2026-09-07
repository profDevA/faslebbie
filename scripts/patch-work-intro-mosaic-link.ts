/**
 * Work `.txt` narrative — mark Franki "Mosaic" as a project link (→ design-assist-ai).
 * Display text: Circle (per Fas 09/07).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-work-intro-mosaic-link.ts --with-user-token
 */
import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";

console.log("patch-work-intro-mosaic-link starting");

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const BLOCK_KEY = "74d1b0cf76af";
const SLUG = "design-assist-ai";
const LINK_TEXT = "Circle";

async function main() {
  const doc = await client.fetch<{ _id: string; intro?: unknown[] }>(
    `*[_type == "workPage"][0]{ _id, intro }`,
  );
  if (!doc?.intro?.length) throw new Error("workPage intro missing");

  const intro = structuredClone(doc.intro) as {
    _key: string;
    _type: string;
    children?: { _key: string; _type: string; text?: string; marks?: string[] }[];
    markDefs?: { _key: string; _type: string; slug?: string }[];
    style?: string;
  }[];

  const block = intro.find((b) => b._key === BLOCK_KEY);
  if (!block?.children) throw new Error(`Block ${BLOCK_KEY} not found`);

  const tail = block.children.find(
    (c) =>
      c.text?.includes("Mosaic") ||
      c.text?.includes("sacrificial concepts like") ||
      c.text?.includes("At Franki, I'm building"),
  );
  if (!tail?.text) throw new Error("Franki / Mosaic span not found");

  const metaTail =
    " made scattered research queryable, first for designers, then for engineering and product. ";
  const before =
    "At Franki, I'm building the team across product design, research, and brand with sacrificial concepts like ";
  const after =
    ", which proposed a system for turning a first purchase into a habit.";

  const designIdx = block.children.indexOf(tail);
  const prefix = block.children.slice(0, designIdx);

  // Tail may still include the Meta sentence after Design Assist AI.
  const frankiStart = tail.text.indexOf("At Franki, I'm building");
  const metaPrefix =
    frankiStart > 0 ? tail.text.slice(0, frankiStart) : metaTail;

  if (frankiStart >= 0 && !tail.text.includes("Mosaic") && !tail.text.includes(LINK_TEXT)) {
    throw new Error(`Unexpected span text: ${tail.text}`);
  }

  const markKey = key();
  block.markDefs = block.markDefs ?? [];
  block.markDefs.push({ _key: markKey, _type: "project", slug: SLUG });

  block.children = [
    ...prefix,
    ...(metaPrefix
      ? [{ _key: key(), _type: "span" as const, marks: [] as string[], text: metaPrefix }]
      : []),
    { _key: key(), _type: "span", marks: [], text: before },
    { _key: key(), _type: "span", marks: [markKey], text: LINK_TEXT },
    { _key: key(), _type: "span", marks: [], text: after },
  ];

  console.log("patched block preview:");
  console.log(
    block.children.map((c) => `${c.marks?.length ? "[link]" : ""}${c.text}`).join(""),
  );

  await client.patch(doc._id).set({ intro }).commit();
  console.log("✓ workPage intro patched — Mosaic → red Circle link");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
