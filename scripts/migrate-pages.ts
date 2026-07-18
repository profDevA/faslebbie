/**
 * One-off migration: seed the teachingPage / buildPage / leadershipPage
 * singletons in Sanity from the in-code data models.
 * Idempotent: fixed _ids + createOrReplace. No images are uploaded (the pages
 * fall back to placeholder tints); the team adds real imagery in the Studio.
 *
 * Run from frontend/:
 *   sanity exec scripts/migrate-pages.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import {
  students,
  teachingIntro,
  teachingSections,
  type TeachToken,
} from "../src/lib/teaching";
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

// Generic: build one Portable Text block from a list of {text, markDef} spans.
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

// ── Teaching ────────────────────────────────────────────────────────────────
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
    students: students.map((p) => ({
      _type: "studentProject",
      _key: key(),
      id: p.id,
      title: p.title,
      headline: p.headline,
      description: p.description,
      span: p.span,
      tint: p.tint,
      ...(p.lightArt ? { lightArt: true } : {}),
    })),
  };
  await client.createOrReplace(doc);
  console.log("✓ seeded teachingPage");
}

// ── Build ─────────────────────────────────────────────────────────────────
function buildSpan(tok: BuildToken): SpanBuild {
  if (tok.t === "proj")
    return { text: tok.text, markDef: { _type: "ref", targetId: tok.id } };
  return { text: tok.text };
}

async function seedBuild() {
  const doc = {
    _id: "buildPage",
    _type: "buildPage",
    intro: buildIntro.map((p) => block(p.map(buildSpan))),
    projects: buildProjects.map((p) => ({
      _type: "buildProjectItem",
      _key: key(),
      id: p.id,
      title: p.title,
      tech: p.tech,
      span: p.span,
      tint: p.tint,
      ...(p.lightArt ? { lightArt: true } : {}),
      kicker: p.kicker,
      subtitle: p.subtitle,
      blurb: p.blurb,
      description: p.description,
      howItWorks: p.howItWorks,
      ...(p.note ? { note: p.note } : {}),
      supportedTools: p.supportedTools,
    })),
  };
  await client.createOrReplace(doc);
  console.log("✓ seeded buildPage");
}

// ── Leadership ──────────────────────────────────────────────────────────────
function leadSpan(tok: AboutToken): SpanBuild | null {
  if (tok.t === "key" && tok.tone === "gray") {
    const expansion = leadershipExpansions[tok.text];
    return {
      text: tok.text,
      markDef: { _type: "expandPill", ...(expansion ? { expansion } : {}) },
    };
  }
  if (tok.t === "text") return { text: tok.text };
  return null; // leadership prose only uses text + grey pills
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
