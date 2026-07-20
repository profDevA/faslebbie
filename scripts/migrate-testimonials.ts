/**
 * One-off migration: seed Sanity `testimonial` documents from the in-code list
 * (src/lib/content.ts → testimonials) and upload each head-shot from /public.
 * Idempotent: deterministic _ids + createOrReplace, asset uploads cached.
 *
 * Run from frontend/:
 *   sanity exec scripts/migrate-testimonials.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";

import { getCliClient } from "sanity/cli";

import { testimonials } from "../src/lib/content";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PUBLIC = join(process.cwd(), "public");

const assetCache = new Map<string, string | null>();

async function uploadImage(p?: string) {
  if (!p) return undefined;
  if (!assetCache.has(p)) {
    const abs = join(PUBLIC, p.replace(/^\//, ""));
    if (!existsSync(abs)) {
      console.warn(`  ! missing asset: ${p}`);
      assetCache.set(p, null);
    } else {
      const asset = await client.assets.upload("image", createReadStream(abs), {
        filename: basename(abs),
      });
      assetCache.set(p, asset._id);
    }
  }
  const id = assetCache.get(p);
  return id ? { _type: "image", asset: { _type: "reference", _ref: id } } : undefined;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function migrate() {
  console.log(`→ ${testimonials.length} testimonials`);
  for (let i = 0; i < testimonials.length; i++) {
    const t = testimonials[i];
    console.log(`  [${i + 1}/${testimonials.length}] ${t.name}`);
    await client.createOrReplace({
      _id: `testimonial-${slugify(t.name)}`,
      _type: "testimonial",
      name: t.name,
      // Strip the legacy leading "- " so the Studio value is clean.
      role: t.role.replace(/^[-\u2013\s]+/, ""),
      quote: t.quote,
      photo: await uploadImage(t.avatar),
      orderRank: String(i + 1).padStart(5, "0"),
    });
  }
  console.log("✓ testimonials migrated");
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
