/**
 * Seed teachingPage / buildPage / leadershipPage in Sanity from live-site data.
 * Uploads student-work + exhibition images from public/teaching/ (run
 * `node scripts/download-teaching-assets.mjs` first).
 *
 * Run from frontend/:
 *   sanity exec scripts/migrate-pages.ts --with-user-token
 */
import { createReadStream } from "node:fs";
import { access, readdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

import { getCliClient } from "sanity/cli";

import { LIVE_EXHIBITION_TILES, tilePosFields } from "./seed/exhibition-live";
import {
  exhibitionTitle,
  students,
  studentsWorkIntro,
  teachingIntro,
  teachingSections,
  type TeachToken,
} from "./seed/teaching-seed";
import { buildIntro, buildProjects, type BuildToken } from "../src/lib/build";
import {
  leadershipClosing,
  leadershipExpansions,
  leadershipGallery,
  leadershipIntro,
  leadershipLead,
  type AboutToken,
} from "../src/lib/content";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type MarkDef = Record<string, unknown> & { _key: string; _type: string };

interface SpanBuild {
  text: string;
  markDef?: Omit<MarkDef, "_key">;
}

const assetCache = new Map<string, string>();

async function uploadPublicFile(relativePath: string): Promise<string | undefined> {
  if (assetCache.has(relativePath)) return assetCache.get(relativePath);
  const file = path.join(process.cwd(), "public", relativePath);
  try {
    await access(file);
  } catch {
    console.warn(`  ! missing: ${relativePath}`);
    return undefined;
  }
  const asset = await client.assets.upload("image", createReadStream(file), {
    filename: path.basename(file),
  });
  assetCache.set(relativePath, asset._id);
  return asset._id;
}

function imageRef(assetId: string) {
  return { _type: "image", asset: { _type: "reference", _ref: assetId } };
}

async function studentImageRefs(id: string) {
  const dir = path.join(process.cwd(), "public", "teaching", "students", id);
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }
  const slides = files
    .filter((f) => /^slide-\d+\./i.test(f))
    .sort((a, b) => {
      const na = Number(a.match(/\d+/)?.[0] ?? 0);
      const nb = Number(b.match(/\d+/)?.[0] ?? 0);
      return na - nb;
    });
  const refs = [];
  const seen = new Set<string>();
  for (const file of slides) {
    const rel = `teaching/students/${id}/${file}`;
    const assetId = await uploadPublicFile(rel);
    if (!assetId || seen.has(assetId)) continue;
    seen.add(assetId);
    refs.push({ _key: key(), ...imageRef(assetId) });
  }
  return refs;
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

function teachSpan(tok: TeachToken): SpanBuild {
  if (tok.t === "pill") return { text: tok.text, markDef: { _type: "pill" } };
  if (tok.t === "term") return { text: tok.text, markDef: { _type: "term" } };
  if (tok.t === "student")
    return { text: tok.text, markDef: { _type: "ref", targetId: tok.id } };
  if (tok.t === "action")
    return {
      text: tok.text,
      markDef: {
        _type: "action",
        kind: tok.kind === "exhibition" ? "explore-exhibition" : "see-students",
      },
    };
  return { text: tok.text };
}

const teachBlocks = (paras: TeachToken[][]) =>
  paras.map((p) => block(p.map(teachSpan)));

async function seedTeaching() {
  console.log("Seeding teachingPage (prose + images)…");

  const studentDocs = [];
  for (const p of students) {
    const images = await studentImageRefs(p.id);
    studentDocs.push({
      _type: "studentProject",
      _key: key(),
      id: p.id,
      title: p.title,
      headline: p.headline,
      description: p.description,
      span: p.span,
      tint: p.tint,
      ...(p.lightArt ? { lightArt: true } : {}),
      ...(images.length ? { images } : {}),
    });
    console.log(`  student ${p.id}: ${images.length} image(s)`);
  }

  const exhibitionTiles = [];
  for (const t of LIVE_EXHIBITION_TILES) {
    const rel = `teaching/exhibition/exhibition-${t.file}.jpg`;
    const assetId = await uploadPublicFile(rel);
    exhibitionTiles.push({
      _type: "exhibitionTile",
      _key: key(),
      tint: "#e5e5de",
      span: "md",
      ...tilePosFields(t.pos),
      ...(assetId ? { image: imageRef(assetId) } : {}),
    });
  }

  const doc = {
    _id: "teachingPage",
    _type: "teachingPage",
    intro: teachBlocks(teachingIntro),
    sections: teachingSections.map((s) => ({
      _type: "teachingSection",
      _key: key(),
      kicker: s.kicker,
      body: teachBlocks(s.paragraphs),
      actionKind: s.action.kind,
      actionText: s.action.text,
    })),
    students: studentDocs,
    studentsWorkIntro,
    exhibitionTitle,
    exhibitionTiles,
  };
  await client.createOrReplace(doc);
  console.log(
    `✓ teachingPage — ${studentDocs.length} students, ${exhibitionTiles.length} exhibition tiles, ${assetCache.size} assets uploaded`,
  );
}

function buildSpan(tok: BuildToken): SpanBuild {
  if (tok.t === "proj")
    return { text: tok.text, markDef: { _type: "ref", targetId: tok.id } };
  return { text: tok.text };
}

async function seedBuild() {
  const existing = await client.fetch<{
    projects?: { id?: string; _key?: string; images?: unknown[] }[];
  } | null>(
    `*[_type == "buildPage"][0]{ projects[]{ id, _key, images } }`,
  );

  const keptById = new Map(
    (existing?.projects ?? [])
      .filter((p) => p.id)
      .map((p) => [p.id!, p] as const),
  );

  const doc = {
    _id: "buildPage",
    _type: "buildPage",
    intro: buildIntro.map((p) => block(p.map(buildSpan))),
    projects: buildProjects.map((p) => {
      const kept = keptById.get(p.id);
      return {
        _type: "buildProjectItem",
        _key: kept?._key ?? key(),
        id: p.id,
        title: p.title,
        tech: p.tech,
        span: p.span,
        tint: p.tint,
        ...(p.lightArt ? { lightArt: true } : {}),
        kicker: p.kicker,
        subtitle: p.subtitle,
        blurb: p.subtitle,
        description: p.description,
        howItWorks: p.howItWorks,
        ...(p.note ? { note: p.note } : {}),
        supportedTools: p.supportedTools,
        ...(kept?.images?.length ? { images: kept.images } : {}),
      };
    }),
  };
  await client.createOrReplace(doc);
  console.log("✓ seeded buildPage");
}

function leadSpan(tok: AboutToken): SpanBuild | null {
  if (tok.t === "key" && tok.tone === "gray") {
    const expansion = leadershipExpansions[tok.text];
    return {
      text: tok.text,
      markDef: { _type: "expandPill", ...(expansion ? { expansion } : {}) },
    };
  }
  if (tok.t === "text") return { text: tok.text };
  return null;
}

const leadField = (tokens: AboutToken[]) => [
  block(tokens.map(leadSpan).filter((s): s is SpanBuild => s !== null)),
];

async function seedLeadership() {
  const doc = {
    _id: "leadershipPage",
    _type: "leadershipPage",
    intro: leadField(leadershipIntro),
    momentsHeading: "My leadership moments",
    lead: leadField(leadershipLead),
    exploreText: "Explore my leadership moments",
    closing: leadField(leadershipClosing),
    contactText: "Get in touch",
    moments: leadershipGallery.map((m) => ({
      _type: "leadershipMoment",
      _key: key(),
      id: m.id,
      label: m.label,
      span: m.span,
      ...(m.highlight ? { highlight: true } : {}),
      name: m.popup.name,
      role: m.popup.role,
      testimonial: m.popup.testimonial,
    })),
  };
  await client.createOrReplace(doc);
  console.log("✓ seeded leadershipPage");
}

async function main() {
  await seedTeaching();
  await seedBuild();
  await seedLeadership();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
