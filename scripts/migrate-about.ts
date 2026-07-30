/**
 * Seed the aboutPage singleton in Sanity from the in-code bio in
 * src/lib/content.ts. Idempotent: fixed _id + createOrReplace.
 *
 * About was the last page still hardcoded. After this runs, Fas can edit the
 * bio, the keyword reveal copy and the CV/Resume/LinkedIn/Email links in the
 * Studio — including the keywords that are still Lorem ipsum, which he needs to
 * write himself (Transition design, AI as material, reader, fan, plus the ten
 * nested under "sustainable minerals").
 *
 * Run from frontend/:
 *   sanity exec scripts/migrate-about.ts --with-user-token
 */
import { randomUUID } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";

import { getCliClient } from "sanity/cli";

import {
  aboutExpansions,
  aboutLinks,
  aboutParagraphs,
  type AboutToken,
} from "../src/lib/content";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const PUBLIC = join(process.cwd(), "public");

// ── inline photo upload ─────────────────────────────────────────────────────
const assetCache = new Map<string, string | null>();

async function uploadImage(p: string): Promise<string | null> {
  if (assetCache.has(p)) return assetCache.get(p)!;
  const abs = join(PUBLIC, p.replace(/^\//, ""));
  if (!existsSync(abs)) {
    console.warn(`  ! missing asset: ${p}`);
    assetCache.set(p, null);
    return null;
  }
  const asset = await client.assets.upload("image", createReadStream(abs), {
    filename: basename(abs),
  });
  assetCache.set(p, asset._id);
  return asset._id;
}

// ── token -> Portable Text ──────────────────────────────────────────────────
type MarkDef = Record<string, unknown> & { _key: string; _type: string };

/**
 * One block per paragraph. Unlike the other pages' seeds, About mixes annotated
 * spans with INLINE OBJECTS (logo chips, cycling tags, the photo), so children
 * are built as a mixed list rather than spans alone.
 */
async function toBlock(tokens: AboutToken[]) {
  const markDefs: MarkDef[] = [];
  const children: Record<string, unknown>[] = [];

  const span = (text: string, markDef?: Omit<MarkDef, "_key">) => {
    const marks: string[] = [];
    if (markDef) {
      const k = key();
      markDefs.push({ _key: k, ...markDef } as MarkDef);
      marks.push(k);
    }
    children.push({ _type: "span", _key: key(), text, marks });
  };

  for (const tok of tokens) {
    switch (tok.t) {
      case "text":
        span(tok.text);
        break;
      case "key":
        // Grey pills expand inline; every other tone is the red keyword that
        // opens the testimonials pop-up.
        if (tok.tone === "gray") span(tok.text, { _type: "pill" });
        else span(tok.text, { _type: "redKey", kind: "testimonials" });
        break;
      case "link":
        span(tok.text, { _type: "link", href: tok.href });
        break;
      case "term":
        // `aboutProse` has no static `>/~` highlight — About only uses the
        // cycling variant. Nothing in the bio hits this today; seeding it as a
        // grey pill would silently change how it renders, so say so instead.
        console.warn(
          `  ! no aboutProse equivalent for term token "${tok.text}" — seeded as plain text`,
        );
        span(tok.text);
        break;
      case "typer":
        children.push({
          _type: "aboutTyper",
          _key: key(),
          words: [...tok.words],
        });
        break;
      case "logo":
        children.push({ _type: "aboutLogo", _key: key(), name: tok.name });
        break;
      case "photo": {
        const id = await uploadImage(tok.src);
        children.push({
          _type: "aboutPhoto",
          _key: key(),
          alt: tok.alt,
          ...(id
            ? { image: { _type: "image", asset: { _type: "reference", _ref: id } } }
            : {}),
        });
        break;
      }
    }
  }

  return { _type: "block", _key: key(), style: "normal", markDefs, children };
}

async function toBlocks(paras: AboutToken[][]) {
  const blocks = [];
  for (const p of paras) blocks.push(await toBlock(p));
  return blocks;
}

async function main() {
  const bio = await toBlocks(aboutParagraphs);

  // Each expansion is a single flow, so it seeds as one block — but the field
  // is full aboutProse, so Fas can split it into paragraphs and nest further
  // pills from the Studio.
  const expansions = [];
  for (const [keyword, tokens] of Object.entries(aboutExpansions)) {
    expansions.push({
      _type: "aboutExpansion",
      _key: key(),
      keyword,
      body: [await toBlock(tokens)],
    });
  }

  await client.createOrReplace({
    _id: "aboutPage",
    _type: "aboutPage",
    bio,
    expansions,
    links: aboutLinks.map((l) => ({
      _type: "object",
      _key: key(),
      label: l.label,
      href: l.href,
    })),
  });

  console.log(
    `✓ seeded aboutPage — ${bio.length} paragraphs, ${expansions.length} expansions, ${aboutLinks.length} links`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
