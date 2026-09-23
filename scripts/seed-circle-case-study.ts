/**
 * Create published Sanity doc `cs-circle` (slug `circle`) from the Memory Tubes
 * Coral spine — sections only, no media. Run once before patch-circle-hero-overview.
 *
 *   npx sanity exec scripts/seed-circle-case-study.ts --with-user-token -- --dry
 *   npx sanity exec scripts/seed-circle-case-study.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";
import { LexoRank } from "lexorank";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const PUB_ID = "cs-circle";
const TEMPLATE_SLUG = "memory-tubes";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type Json = Record<string, unknown>;

function rekey(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(rekey);
  if (!value || typeof value !== "object") return value;
  const o = { ...(value as Json) };
  if (typeof o._key === "string") o._key = key();
  if (typeof o._type === "string" && (o._type === "image" || o._type === "file")) {
    return undefined;
  }
  delete o.asset;
  delete o.crop;
  delete o.hotspot;
  for (const k of Object.keys(o)) {
    const next = rekey(o[k]);
    if (next === undefined) delete o[k];
    else o[k] = next;
  }
  return o;
}

async function main() {
  const existing = await client.getDocument(PUB_ID);
  if (existing) {
    console.log(`✓ ${PUB_ID} already exists — skip seed`);
    return;
  }

  const template = await client.fetch<{ sections?: unknown[]; orderRank?: string }>(
    `*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
      sections, orderRank
    }`,
    { slug: TEMPLATE_SLUG },
  );
  if (!template?.sections?.length) {
    throw new Error(`Template ${TEMPLATE_SLUG} missing`);
  }

  const lastRank = await client.fetch<string | null>(
    `*[_type == "caseStudy" && !(_id in path("drafts.**"))] | order(orderRank desc)[0].orderRank`,
  );
  const orderRank = lastRank
    ? LexoRank.parse(lastRank).genNext().toString()
    : LexoRank.min().genNext().toString();

  const sections = rekey(structuredClone(template.sections)) as Json[];

  const doc = {
    _id: PUB_ID,
    _type: "caseStudy",
    title: "Circle",
    slug: { _type: "slug", current: "circle" },
    tagline: "Lorem ipsum dolor sit amet consectetur adipiscing.",
    from: "Lorem",
    to: "Ipsum",
    orderRank,
    passwordProtected: false,
    sections,
  };

  console.log(`seed-circle (${DRY ? "dry" : "live"}) from ${TEMPLATE_SLUG}`);
  console.log(`  sections: ${sections.length} types → ${sections.map((s) => s._type).join(", ")}`);
  console.log(`  orderRank: ${orderRank}`);

  if (!DRY) {
    await client.create(doc);
    console.log(`✓ created ${PUB_ID}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
