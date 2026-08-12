/**
 * Patch aboutPage with final copy from
 * docs/reference/faslebbie + Xiang Collaboration SITE FINAL COPY.docx
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

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const PUBLIC = join(process.cwd(), "public");

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

const HEADLINE = "Designing for Transitions.";

const INTRO: AboutToken[][] = [
  [
    {
      t: "text",
      text: "I'm a design leader and transition-maker who helps teams move from what a system currently does to what it should. That means building what's missing, dismantling what no longer serves, and repairing what can be saved.",
    },
  ],
];

const BIO: AboutToken[][] = [
  [
    { t: "text", text: "A transdisciplinary " },
    {
      t: "typer",
      words: [
        "designer",
        "researcher",
        "educator",
        "builder",
        "strategist",
        "design leader",
      ],
    },
    { t: "text", text: ", with a PhD in Design from " },
    { t: "logo", name: "carnegie-mellon" },
    {
      t: "text",
      text: "Carnegie Mellon University, a Master's in Design from ",
    },
    { t: "logo", name: "parsons" },
    {
      t: "text",
      text: "Parsons School of Design, and a Bachelor's in Entrepreneurship from the ",
    },
    { t: "logo", name: "utah" },
    { t: "text", text: "University of Utah." },
  ],
  [
    { t: "text", text: "I work at the intersection of " },
    { t: "key", text: "Product", tone: "gray" },
    { t: "text", text: " and " },
    { t: "key", text: "Systems design", tone: "gray" },
    { t: "text", text: ". My ongoing research spans " },
    { t: "key", text: "sustainable minerals", tone: "gray" },
    { t: "text", text: ", " },
    { t: "key", text: "AI as material", tone: "gray" },
    { t: "text", text: ", and " },
    { t: "key", text: "Scalar Design Leadership", tone: "gray" },
    { t: "text", text: "." },
  ],
  [
    { t: "text", text: "Currently Head of Design at " },
    { t: "logo", name: "frankl" },
    { t: "text", text: "Franki. Before that, " },
    { t: "logo", name: "meta" },
    { t: "text", text: "Meta, " },
    { t: "logo", name: "ptc" },
    { t: "text", text: "PTC, and " },
    { t: "logo", name: "consumer-reports" },
    { t: "text", text: "Consumer Reports, across " },
    {
      t: "typer",
      words: [
        "Enterprise infrastructure",
        "Fintech",
        "Healthcare",
        "Industrial manufacturing",
        "Civic technology",
        "Consumer technology",
      ],
    },
    { t: "text", text: "." },
  ],
  [
    { t: "text", text: "I " },
    { t: "link", text: "teach", href: "/teaching" },
    { t: "text", text: " design at " },
    { t: "key", text: "Carnegie Mellon University", tone: "gray" },
    { t: "text", text: " and serve as a mentor and " },
    { t: "key", text: "advisor", tone: "gray" },
    { t: "text", text: " at " },
    { t: "logo", name: "mit" },
    {
      t: "text",
      text: "MIT GOV/LAB. My teaching extends internationally to SFK and ACG Arts in China, and Njala University in Sierra Leone.",
    },
  ],
  [
    { t: "key", text: "Recognized and awarded", tone: "gray" },
    {
      t: "text",
      text: " across product design, research, entrepreneurship, and academia. See ",
    },
    { t: "key", text: "what people are saying" },
    { t: "text", text: " →" },
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
    { t: "text", text: " and offer free mentorship " },
    // Doc: Calendly / booking — still /teaching until Fas confirms URL.
    { t: "link", text: "monthly", href: "/teaching" },
    { t: "text", text: " to " },
    {
      t: "typer",
      words: [
        "underrepresented communities",
        "emerging designers",
        "early-career designers",
        "career-transition designers",
        "African creatives",
      ],
    },
    { t: "text", text: " in design and tech." },
  ],
  [
    { t: "text", text: "Outside of work, I'm a " },
    { t: "key", text: "reader", tone: "gray" },
    { t: "text", text: ", a " },
    { t: "key", text: "fan", tone: "gray" },
    { t: "text", text: ", a husband and father " },
    {
      t: "photo",
      src: "/family.png",
      alt: "Fas with family",
    },
    { t: "text", text: "." },
  ],
];

const EXPANSIONS: Record<string, AboutToken[]> = {
  Product: [
    {
      t: "text",
      text: "I create systems of design that link products, stakeholders, and users to achieve meaningful experiences. Over the past decade that has run from zero to one up to enterprise scale: infrastructure, securities, open banking, industrial AR, civic tools. High-complexity domains where trust and organizational alignment matter as much as interface polish.",
    },
  ],
  "Systems design": [
    {
      t: "text",
      text: "Some of the biggest problems facing the world, war, hunger, poverty, and environmental degradation, are what Donella Meadows called system failures, where no piece can be fixed in isolation from the rest. Push on one part and the effect surfaces somewhere you were not looking, often years later. Products now carry the same character. They sit inside supply chains, institutions, and incentives that shape them long before anyone opens a design file, which is why the work needs a longer time horizon than most projects allow. What I design on a screen depends on what comes out of the ground, on the critical minerals that power every device. Holding both ends is what systems design means in my practice, and why it takes a transdisciplinary lens.",
    },
  ],
  "sustainable minerals": [
    {
      t: "text",
      text: "Mineral exploration and mining decisions get made on economic and technical priorities. Social, ecological, and cultural values are acknowledged and then weakly embedded across mining policies, practices, and processes. That gap produces mistrust, conflict, delay, and failure. My research asks how design decisions shape mineral systems, and how those systems reshape the communities and ecologies around them. A decade of fieldwork in African mining communities and a PhD from Carnegie Mellon, developing post-extractive frameworks that center local knowledge and agency over extraction and profit. This work culminated in what I call mineral choreography, a new domain of inquiry establishing design as an active force within the extractive sector and sustainability transitions. The premise is that minerals are not passive raw material, they are active agents in transition, shaped by worldviews and power. Minerality at Scale is the tool that came out of it, tracing material trajectories from the individual and local up to the planetary. The work is co-designed with mining communities alongside engineers, policymakers, and scientists.",
    },
  ],
  "AI as material": [
    {
      t: "text",
      text: "AI is not a feature you add. It is a material with properties, constraints, and consequences a designer is responsible for understanding. Same as minerals. Paola Antonelli called it a new raw material for designers, and the question I keep working on is not what AI can do for design but what design can do for AI. In conversations with companies the pattern repeats: data science teams build things no user wants, design teams want things no one can build. My work sits in that gap. I am building a taxonomy of AI capabilities mapped to design research methodologies. I presented the argument at the Design Research Society in 2025. At Meta I built Design Assist AI on the same premise, internally to make a team faster and externally as product.",
    },
  ],
  "Scalar Design Leadership": [
    {
      t: "text",
      text: "I view leadership as an interactive system focused on resonant relationships through quality interactions. In practice, my Scalar Leadership Approach is founded on six years of applied research into how design scales, tested at Meta across fourteen product portfolios, at Consumer Reports, and at Franki. Three levels, each one a system to be designed. Scale deep (designing the people systems): individual capability, team cohesion, psychological safety, operational resilience. Scale wide (designing the collaboration systems): cross-functional accessibility, transparent documentation, service frameworks, distributed thinking. Scale up (designing the organizational systems): strategic influence, institutional integration, leadership engagement, where success is measured by whether design is embedded in how organizational decisions get made. Each level operates across five dimensions: personal, product, team, strategy, company. But a framework is only a lens. I still prototype and talk to customers, because credibility with a team comes from staying close to the craft.",
    },
  ],
  "Carnegie Mellon University": [
    {
      t: "text",
      text: "I teach undergraduate design studies. Persuasion, on how design moves attitudes and behavior. Place, on how physical environments shape design decisions. Plus two graduate seminars. My method is the LTP cycle: learn it, teach it, practice it. Students build theory, teach it to peers, then apply it until something real exists. The classroom is a studio. The work should never die on submission.",
    },
  ],
  advisor: [
    {
      t: "text",
      text: "At MIT GOV/LAB I advise on civic innovation with African governments, developing frameworks to repair trust between citizens and the state. I run co-design workshops that put officials, civil society, and residents in the same room, then build the training so local teams can carry it without me. The aim is policy design that is culturally grounded and rooted in lived experience, not imported.",
    },
  ],
  "Recognized and awarded": [
    {
      t: "text",
      text: "A Webby for user experience. The Carnegie Mellon Teaching Fellowship. The #NewMacy Cybernetics Prize for systems thinking. The Strategic Design Excellence Award at Parsons. The Utah Entrepreneurship Challenge. Industry and academy have recognized the same work.",
    },
  ],
  reader: [
    {
      t: "text",
      text: "C.S. Lewis, Chimamanda Ngozi Adichie, Ta-Nehisi Coates, Donella Meadows. Systems literature and African futurism, theology and fiction, often at the same time. I read to think slower than the work usually allows.",
    },
  ],
  fan: [
    {
      t: "text",
      text: "Liverpool FC, since I was a kid. I still play soccer myself. Seinfeld, which I grew up on and still watch. Surfing whenever the water allows, usually with my wife.",
    },
  ],
};

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
        else span(tok.text, { _type: "redKey", kind: "testimonials" });
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
  {
    label: "Email",
    href: "mailto:dr.faslebbie@gmail.com",
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
