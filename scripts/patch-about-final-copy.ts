/**
 * Patch aboutPage with final copy from Final Edits_faslebbiesite.docx (Aug 2026).
 *
 * Preserves existing link PDF uploads when present.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-about-final-copy.ts --with-user-token
 */
import { randomUUID } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";

import { getCliClient } from "sanity/cli";

import type { AboutToken } from "../src/lib/content";
import { ABOUT_EXPANSIONS } from "./about-expansions-data";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const PUBLIC = join(process.cwd(), "public");

/** Calendly URL not in repo yet — free monthly opens contact drawer until Fas confirms. */

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

const HEADLINE = "";

const INTRO: AboutToken[][] = [];

const BIO: AboutToken[][] = [
  [
    { t: "text", text: "I'm a transdisciplinary " },
    {
      t: "typer",
      words: ["designer", "researcher", "educator", "builder", "strategist"],
    },
    {
      t: "text",
      text: " and transition-maker who creates ",
    },
    { t: "key", text: "systems", tone: "gray" },
    {
      t: "text",
      text: " that connect products, stakeholders, and users to meaningful experiences. I hold a PhD in Design from ",
    },
    { t: "logo", name: "carnegie-mellon" },
    {
      t: "text",
      text: "Carnegie Mellon University, a Master's in Design from ",
    },
    { t: "logo", name: "parsons" },
    {
      t: "text",
      text: "Parsons, and a Bachelor's in Entrepreneurship from the ",
    },
    { t: "logo", name: "utah" },
    { t: "text", text: "University of Utah." },
  ],
  [
    { t: "text", text: "My ongoing research focuses on " },
    { t: "key", text: "sustainable minerals", tone: "gray" },
    { t: "text", text: ", the material end of what we build. " },
    { t: "key", text: "AI as material", tone: "gray" },
    { t: "text", text: ", the immaterial end. And " },
    { t: "key", text: "Scalar design leadership", tone: "gray" },
    { t: "text", text: ", building organizational design currency." },
  ],
  [
    { t: "text", text: "Currently Head of Design at " },
    { t: "logo", name: "frankl" },
    { t: "text", text: "Franki. Before that, " },
    { t: "logo", name: "meta" },
    { t: "text", text: "Meta, " },
    { t: "logo", name: "mastercard" },
    { t: "text", text: "Mastercard and Finicity, " },
    { t: "logo", name: "ptc" },
    { t: "text", text: "PTC, " },
    { t: "logo", name: "consumer-reports" },
    { t: "text", text: "Consumer Reports, and " },
    { t: "logo", name: "western-digital" },
    { t: "text", text: "Western Digital and SanDisk, across " },
    {
      t: "typer",
      words: [
        "enterprise infrastructure",
        "fintech",
        "healthcare",
        "industrial manufacturing",
        "civic technology",
        "consumer technology",
      ],
    },
    { t: "text", text: "." },
  ],
  [
    { t: "text", text: "I teach design at " },
    { t: "key", text: "Carnegie Mellon University", tone: "gray" },
    { t: "text", text: " and serve as a mentor and " },
    { t: "key", text: "advisor at MIT GOV/LAB", tone: "gray" },
    {
      t: "text",
      text: ". My teaching extends internationally to ",
    },
    { t: "key", text: "SFK International and ACG Arts", tone: "gray" },
    { t: "text", text: " in China, and " },
    { t: "key", text: "Njala University", tone: "gray" },
    {
      t: "text",
      text: " in Sierra Leone. My work has been ",
    },
    { t: "key", text: "recognized and awarded", tone: "gray" },
    {
      t: "text",
      text: " across the product design industry and academia. See ",
    },
    { t: "key", text: "what people are saying", popup: "testimonials" },
    { t: "text", text: "." },
  ],
  [
    { t: "text", text: "I speak and consult on " },
    {
      t: "typer",
      words: [
        "design leadership",
        "product strategy",
        "design research",
        "AI",
        "civic innovation",
        "sustainable transitions",
        "African futures",
      ],
    },
    { t: "text", text: " and offer " },
    { t: "key", text: "free monthly", popup: "contact" },
    {
      t: "text",
      text: " mentorship to ",
    },
    {
      t: "typer",
      words: [
        "underrepresented communities",
        "students",
        "career-transitioners",
        "African creatives",
      ],
    },
    { t: "text", text: " in design, research, and tech. Outside of work, I'm a " },
    { t: "key", text: "reader", tone: "gray" },
    { t: "text", text: ", a " },
    { t: "key", text: "fan", tone: "gray" },
    { t: "text", text: ", and a husband and father " },
    {
      t: "photo",
      src: "/family.png",
      alt: "Fas with family",
    },
    { t: "text", text: "." },
  ],
];

const EXPANSIONS = ABOUT_EXPANSIONS;

type MarkDef = Record<string, unknown> & { _key: string; _type: string };

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
        if (tok.tone === "gray") span(tok.text, { _type: "pill" });
        else {
          const kind =
            tok.popup === "contact" ? "contact" : "testimonials";
          span(tok.text, { _type: "redKey", kind });
        }
        break;
      case "link":
        span(tok.text, { _type: "link", href: tok.href });
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
            ? {
                image: {
                  _type: "image",
                  asset: { _type: "reference", _ref: id },
                },
              }
            : {}),
        });
        break;
      }
      default:
        break;
    }
  }

  return { _type: "block", _key: key(), style: "normal", markDefs, children };
}

async function toBlocks(paras: AboutToken[][]) {
  const blocks = [];
  for (const p of paras) blocks.push(await toBlock(p));
  return blocks;
}

const LINK_DEFAULTS = [
  { label: "CV", href: "/cv.pdf", passwordProtected: true },
  { label: "Resume", href: "/resume.pdf", passwordProtected: true },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/faslebbie/",
    passwordProtected: false,
  },
];

async function main() {
  const existing = await client.fetch<{
    links?: {
      _key?: string;
      label?: string;
      href?: string;
      pdf?: { asset?: { _ref?: string } };
      passwordProtected?: boolean;
    }[];
  }>(`*[_id == "aboutPage"][0]{ links }`);

  const byLabel = new Map(
    (existing?.links ?? []).map((l) => [l.label?.toLowerCase(), l]),
  );

  const links = LINK_DEFAULTS.map((l) => {
    const prev = byLabel.get(l.label.toLowerCase());
    return {
      _type: "object" as const,
      _key: prev?._key ?? key(),
      label: l.label,
      href: l.href,
      passwordProtected: l.passwordProtected,
      ...(prev?.pdf?.asset?._ref ? { pdf: prev.pdf } : {}),
    };
  });

  const expansions = await Promise.all(
    Object.entries(EXPANSIONS).map(async ([keyword, tokens]) => ({
      _type: "aboutExpansion" as const,
      _key: key(),
      keyword,
      body: [await toBlock(tokens)],
    })),
  );

  await client.createOrReplace({
    _id: "aboutPage",
    _type: "aboutPage",
    headline: HEADLINE,
    intro: await toBlocks(INTRO),
    bio: await toBlocks(BIO),
    expansions,
    links,
  });

  console.log(
    `✓ patched aboutPage — headline, ${INTRO.length} intro, ${BIO.length} bio paragraphs, ${expansions.length} expansions`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
