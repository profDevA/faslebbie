/**
 * Seed Home Page, Work Page (.txt narrative), and Site Settings (nav + contact)
 * from the in-code defaults. Idempotent: fixed _ids + createOrReplace.
 *
 * Run from frontend/:
 *   sanity exec scripts/migrate-home-work-site.ts --with-user-token
 *
 * Also re-run migrate-research.ts and migrate-pages.ts so Research areas and
 * Teaching exhibition tiles pick up the richer schemas.
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import {
  heroSegments,
  mobileNavItems,
  navItems,
  workNarrative,
  type HeroSegment,
  type SectionId,
  type WorkToken,
} from "../src/lib/content";
import type { HomeHeroSegment } from "../src/lib/homeFromSanity";

/** Seed-only map: legacy SectionId → route (runtime hero comes from Sanity). */
const SECTION_HREF: Record<SectionId, string> = {
  design: "/work",
  research: "/research",
  prototype: "/build",
  teach: "/teaching",
  mentor: "/teaching",
  write: "/blogs",
  lead: "/leadership",
  advise: "/about",
};

function seedHomeSegments(): HomeHeroSegment[] {
  return heroSegments.map((seg: HeroSegment): HomeHeroSegment => {
    if (seg.type === "keyword")
      return { type: "keyword", href: SECTION_HREF[seg.id], text: seg.text };
    if (seg.type === "story")
      return { type: "story", text: seg.text, href: "/about" };
    return { type: "text", text: seg.text };
  });
}

const client = getCliClient({ apiVersion: "2025-01-01" });
const PUBLIC = join(process.cwd(), "public");
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type MarkDef = Record<string, unknown> & { _key: string; _type: string };
interface SpanBuild {
  text: string;
  markDef?: Omit<MarkDef, "_key">;
}

function block(spans: SpanBuild[]) {
  const markDefs: MarkDef[] = [];
  const children = spans.map((s) => {
    const marks: string[] = [];
    if (s.markDef) {
      const _key = key();
      markDefs.push({ _key, ...s.markDef } as MarkDef);
      marks.push(_key);
    }
    return { _type: "span", _key: key(), text: s.text, marks };
  });
  return { _type: "block", _key: key(), style: "normal", markDefs, children };
}

// ── Home ───────────────────────────────────────────────────────────────────
function homeSpan(seg: HomeHeroSegment): SpanBuild {
  if (seg.type === "keyword")
    return { text: seg.text, markDef: { _type: "keyword", href: seg.href } };
  if (seg.type === "story")
    return {
      text: seg.text,
      markDef: { _type: "story", href: seg.href ?? "/about" },
    };
  return { text: seg.text };
}

async function seedHome() {
  // Home hero is one flowing paragraph — collapse segments into a single block.
  const doc = {
    _id: "homePage",
    _type: "homePage",
    hero: [block(seedHomeSegments().map(homeSpan))],
    storyHref: "/about",
  };
  await client.createOrReplace(doc);
  console.log("✓ seeded homePage");
}

// ── Work ───────────────────────────────────────────────────────────────────
function workSpan(tok: WorkToken): SpanBuild {
  if (tok.t === "project")
    return { text: tok.text, markDef: { _type: "project", slug: tok.slug } };
  if (tok.t === "org") return { text: tok.text, markDef: { _type: "org" } };
  return { text: tok.text };
}

async function seedWork() {
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "workPage"][0]{ _id }`,
  );
  const doc = {
    _id: existing?._id ?? "workPage",
    _type: "workPage",
    sectionTitle: "Work",
    intro: workNarrative.map((para) => block(para.map(workSpan))),
    enableTextView: true,
    enableImageView: true,
    loadMoreLabel: "Load More",
  };
  await client.createOrReplace(doc);
  console.log("✓ seeded workPage (.txt narrative)");
}

// ── Site settings ──────────────────────────────────────────────────────────
async function imageValue(rel: string) {
  const abs = join(PUBLIC, rel.replace(/^\//, ""));
  if (!existsSync(abs)) {
    console.warn(`  ! missing asset: ${rel}`);
    return undefined;
  }
  const asset = await client.assets.upload("image", createReadStream(abs), {
    filename: basename(abs),
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

async function seedSite() {
  const portrait = await imageValue("/portrait-master.png");
  const doc = {
    _id: "siteSettings",
    _type: "siteSettings",
    logoName: "Fas lebbie",
    logoSuffix: "Ph.D.",
    navItems: navItems.map((i) => ({
      _type: "navLink",
      _key: key(),
      label: i.label,
      href: i.href,
    })),
    mobileNavItems: mobileNavItems.map((i) => ({
      _type: "navLink",
      _key: key(),
      label: i.label,
      href: i.href,
    })),
    contactDrawerTitle: "Contact",
    contactHeading: "Drop Me a Line",
    contactSubmitLabel: "Send Message",
    contactSuccessTitle: "Thanks — your message is on its way.",
    contactSuccessBody: "Fas will get back to you at the email you provided.",
    contactSendAnotherLabel: "Send another",
    ...(portrait ? { masterPortrait: portrait } : {}),
  };
  await client.createOrReplace(doc);
  console.log("✓ seeded siteSettings");
}

async function main() {
  await seedHome();
  await seedWork();
  await seedSite();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
