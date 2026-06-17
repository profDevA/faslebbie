// Homepage content — verbatim from the Figma prototype (docs/homepage-spec.md).

export type SectionId =
  | "design"
  | "research"
  | "prototype"
  | "teach"
  | "mentor"
  | "write"
  | "lead"
  | "advise";

export type HeroSegment =
  | { type: "text"; text: string }
  | { type: "keyword"; id: SectionId; text: string }
  | { type: "story"; text: string };

export const heroSegments: HeroSegment[] = [
  { type: "text", text: "I " },
  { type: "keyword", id: "design", text: "design" },
  { type: "text", text: " digital product experiences and " },
  { type: "keyword", id: "research", text: "research" },
  {
    type: "text",
    text: " the material (minerals) and immaterial (AI) systems that enable them. With a maker-founder mindset, I ",
  },
  { type: "keyword", id: "prototype", text: "prototype" },
  { type: "text", text: ", " },
  { type: "keyword", id: "teach", text: "teach" },
  { type: "text", text: " and " },
  { type: "keyword", id: "mentor", text: "mentor" },
  { type: "text", text: ", " },
  { type: "keyword", id: "write", text: "write" },
  { type: "text", text: ", " },
  { type: "keyword", id: "lead", text: "lead" },
  { type: "text", text: ", and " },
  { type: "keyword", id: "advise", text: "advise" },
  {
    type: "text",
    text: ", helping teams and organizations use design as a force for systems transition at scale. ",
  },
  { type: "story", text: "And there's more to my story+." },
];

export interface PanelContent {
  title: string;
  body: string[];
  cta: { label: string; href: string };
  /** Tool-stack icon row — only the design panel has one in the prototype. */
  hasToolStack?: boolean;
}

// Rendered strip of the design panel's 13 tool icons from the Figma prototype.
// TODO: replace with individual named icons once Fas confirms the tool list.
export const toolStackImage = "/tools/tool-stack-row.png";

export const panels: Record<SectionId, PanelContent> = {
  design: {
    title: "design",
    body: [
      "Designing products, systems, and experiences across enterprise software, AI, and civic infrastructure. From Meta to industrial field research — design as organizational leverage.",
    ],
    cta: { label: "View Design Work", href: "/work" },
    hasToolStack: true,
  },
  research: {
    title: "research",
    body: [
      "Researching mineral systems, AI infrastructures, and post-extractive futures through design.",
      "From African mining communities to enterprise AI, the work explores how systems shape people, ecologies, and transition.",
    ],
    cta: { label: "Explore Research", href: "/research" },
  },
  prototype: {
    title: "prototype",
    body: [
      "Prototyping ideas, interfaces, systems, and experimental workflows in public.",
      "A living playground of unfinished concepts, interactions, and emerging directions.",
    ],
    cta: { label: "Enter Playground", href: "/build" },
  },
  teach: {
    title: "teach",
    body: [
      "Teaching across Carnegie Mellon, MIT GOV/LAB, SFK International, and Njala University — treating the classroom as an active studio.",
      "Focused on systems thinking, product design, and real-world practice.",
    ],
    cta: { label: "Continue to Teaching", href: "/teaching" },
  },
  mentor: {
    title: "mentor",
    body: [
      "Mentoring emerging designers, researchers, and entrepreneurs across design, AI, and systems thinking.",
      "Focused especially on underrepresented communities navigating creative and technological futures.",
    ],
    cta: { label: "Continue to Mentorship", href: "/teaching" },
  },
  write: {
    title: "write",
    body: [
      "Writing about design systems, AI, leadership, extraction, and organizational transformation.",
      "Books, essays, journals, frameworks, and ongoing lines of inquiry.",
    ],
    cta: { label: "Continue to Writing", href: "/blogs" },
  },
  lead: {
    title: "lead",
    body: [
      "Leading design organizations across Meta, Consumer Reports, PTC, and MIT GOV/LAB.",
      "Building systems where design becomes infrastructure — not just output.",
    ],
    cta: { label: "Continue to Leadership", href: "/leadership" },
  },
  advise: {
    title: "advise",
    body: [
      "Advising organizations navigating AI transitions, design transformation, and systems change.",
      "Working across enterprise, civic innovation, and sustainable futures.",
    ],
    cta: { label: "Continue to Advisory", href: "/leadership" },
  },
};

// ── About content (Figma 224:857 / 135:2260) ──────────────────────────────
// Tokens: "text" = plain; "role" = the designer/researcher/educator typer;
// "key" = red keyword on a gray pill (homepage style); "term" = black
// terminal-style tag with a >/~ prefix. Verbatim copy from the Figma frame.
export type AboutToken =
  | { t: "text"; text: string }
  | { t: "typer"; words: readonly string[] } // black >/~ tag that retype-cycles on click
  // "key" expands a panel on click. tone "red" = homepage-style red pill;
  // tone "gray" = System-2 keyword (black text on a gray pill, Figma 187:*).
  | { t: "key"; text: string; tone?: "red" | "gray" }
  | { t: "term"; text: string }
  | { t: "logo"; name: keyof typeof aboutLogos }
  | { t: "photo"; src: string; alt: string }; // inline personal photo (hover-pops)

// Inline brand logos (Figma 187:1596). Each SVG is a self-contained chip — the
// colored background rect and internal padding are baked in — so they're
// rendered inline (no <img>, no wrapper background). `src` is relative to
// /public; the About page reads these files server-side and inlines them.
export const aboutLogos = {
  "carnegie-mellon": { src: "/about-logos/carnegie-mellon-university.svg" },
  parsons: { src: "/about-logos/parsons.svg" },
  utah: { src: "/about-logos/utah.svg" },
  frankl: { src: "/about-logos/franki.svg" },
  meta: { src: "/about-logos/meta.svg" },
  mastercard: { src: "/about-logos/mastercard.svg" },
  ptc: { src: "/about-logos/ptc.svg" },
  "consumer-reports": { src: "/about-logos/consumer-reports.svg" },
  "western-digital": { src: "/about-logos/western-digital.svg" },
  mit: { src: "/about-logos/mit.svg" },
} as const;

// System 1 — the role is a single click-to-retype tag in the first sentence;
// the credentials are plain serif text with inline university logos (Figma
// 224:957). Only the role cycles. (Israel's 06-12 walkthrough implied a second
// credential typer, but the static frame is the source of truth — Xiang 06-16.)
export const roleWords = ["designer", "researcher", "educator"];

// Retype-cycling >/~ tags — same component as the role tag. Labels verbatim
// from the Figma frames (2147236505 / 506 / 507).
export const sectorWords = [
  "Fintech.",
  "Enterprise Securities & Analytics",
  "Consumer Tech",
  "Healthcare",
  "Civic infrastructure.",
];
export const consultWords = [
  "design leadership",
  "AI systems",
  "civic systems",
  "sustainable transitions",
];
export const communityWords = [
  "underrepresented communities",
  "African creatives",
  "early-career technologists",
  "systems education",
];

// Gray keywords expand INLINE (purple text flows into the paragraph, per the
// Figma states 187:*). Each keyword maps to a token array; nested keywords are
// themselves expandable buttons. Only "sustainable minerals" has final copy;
// the rest are lorem until Fas writes them. TODO(Fas): final copy for LOREM.
const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
const lorem = (): AboutToken[] => [{ t: "text", text: LOREM }];

export const aboutExpansions: Record<string, AboutToken[]> = {
  // The one with finalized copy — and it contains nested keyword buttons.
  "sustainable minerals": [
    {
      t: "text",
      text: "my research focuses on mineral exploration and mining design decisions, which tend to focus on economic and technical priorities. While social, ecological, and cultural values are increasingly acknowledged, they are still poorly understood and weakly embedded in decision-making across mining policies, practices, and processes. This knowledge gap results in mistrust, conflict, delay, and potential failure. To address this, my research investigates how ",
    },
    { t: "key", text: "design decisions", tone: "gray" },
    { t: "text", text: " shape " },
    { t: "key", text: "mineral systems", tone: "gray" },
    {
      t: "text",
      text: " — and how those systems, in turn, reshape communities, ecologies, and futures. For two decades, I've worked inside ",
    },
    { t: "key", text: "African mining communities", tone: "gray" },
    { t: "text", text: ", developing " },
    { t: "key", text: "post-extractive frameworks", tone: "gray" },
    {
      t: "text",
      text: " that center local knowledge and agency over extraction and profit. This work culminated in ",
    },
    { t: "key", text: "Mineral Choreography", tone: "gray" },
    {
      t: "text",
      text: " — a new domain of inquiry establishing design as an active force within the ",
    },
    { t: "key", text: "extractive sector", tone: "gray" },
    { t: "text", text: " and " },
    { t: "key", text: "sustainability transitions", tone: "gray" },
    {
      t: "text",
      text: ". I am working directly with local communities — alongside engineers, policymakers, and scientists. I write about all of it across ",
    },
    { t: "key", text: "books", tone: "gray" },
    { t: "text", text: ", " },
    { t: "key", text: "journals & articles", tone: "gray" },
    { t: "text", text: ", and " },
    { t: "key", text: "academic work", tone: "gray" },
    { t: "text", text: "." },
  ],
  // Top-level keywords (lorem until finalized)
  Product: lorem(),
  "Transition design": lorem(),
  "AI as material": lorem(),
  "Scalar Design Leadership": lorem(),
  reader: lorem(),
  fan: lorem(),
  "Carnegie Mellon University": lorem(),
  // Nested keywords inside the research passage (lorem until finalized)
  "design decisions": lorem(),
  "mineral systems": lorem(),
  "African mining communities": lorem(),
  "post-extractive frameworks": lorem(),
  "Mineral Choreography": lorem(),
  "extractive sector": lorem(),
  "sustainability transitions": lorem(),
  books: lorem(),
  "journals & articles": lorem(),
  "academic work": lorem(),
};

// Award marks shown in the "recognized and awarded" panel (Figma 187:2004).
// Each SVG is an isolated export with the panel-colour background baked in, so
// it sits flush on the panel. `h` is the Figma render height in px (widths vary,
// so we size by height and let width follow the aspect ratio).
export const aboutAwards = [
  { src: "/about-awards/new-macy.svg", alt: "New Macy / ASC.Cybernetics", h: 22 },
  { src: "/about-awards/parsons.svg", alt: "Parsons School of Design", h: 17 },
  { src: "/about-awards/webby.svg", alt: "The Webby Awards", h: 27 },
  { src: "/about-awards/utah-challenge.svg", alt: "Utah Entrepreneur Challenge", h: 20 },
  { src: "/about-awards/carnegie-mellon.svg", alt: "Carnegie Mellon University", h: 17 },
] as const;

// Red keywords open a BOXED panel (homepage style: title, body, CTA, × close) —
// Figma 187:2356 (teach), 187:1913 (recognized and awarded), 187:2107 (monthly).
export const aboutPanels: Record<
  string,
  {
    body: string[];
    cta?: { label: string; href: string };
    awards?: typeof aboutAwards;
    placeholder?: boolean;
  }
> = {
  teach: {
    body: [
      "Teaching across Carnegie Mellon, MIT GOV/LAB, SFK International, and Njala University — treating the classroom as an active studio.",
      "Focused on systems thinking, product design, and real-world practice.",
    ],
    cta: { label: "Continue to Teaching", href: "/teaching" },
  },
  "recognized and awarded": { body: [LOREM], awards: aboutAwards, placeholder: true },
  monthly: {
    body: [LOREM],
    cta: { label: "Book a Call", href: "/contact" },
    placeholder: true,
  },
};

export const aboutParagraphs: AboutToken[][] = [
  [
    { t: "text", text: "As a transdisciplinary " },
    { t: "typer", words: roleWords },
    { t: "text", text: " I hold a Phd in Design from " },
    { t: "logo", name: "carnegie-mellon" },
    { t: "text", text: "Carnegie Mellon University, a Master's in Design from " },
    { t: "logo", name: "parsons" },
    { t: "text", text: "Parsons School of Design and a Bachelor's in Entrepreneurship, " },
    { t: "logo", name: "utah" },
    { t: "text", text: "University of Utah." },
  ],
  [
    { t: "text", text: "I work at the intersection of " },
    { t: "key", text: "Product", tone: "gray" },
    { t: "text", text: " and " },
    { t: "key", text: "Transition design", tone: "gray" },
    { t: "text", text: ", while my research focuses on " },
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
    { t: "text", text: "Franki. Previously led design across " },
    { t: "logo", name: "meta" },
    { t: "text", text: "Meta, " },
    { t: "logo", name: "mastercard" },
    { t: "text", text: "Mastercard/Finicity, " },
    { t: "logo", name: "ptc" },
    { t: "text", text: "PTC, " },
    { t: "logo", name: "consumer-reports" },
    { t: "text", text: "Consumer Reports, and " },
    { t: "logo", name: "western-digital" },
    { t: "text", text: "Western Digital/SanDisk, working across " },
    { t: "typer", words: sectorWords },
  ],
  [
    { t: "text", text: "I " },
    { t: "key", text: "teach" },
    { t: "text", text: " design at " },
    { t: "key", text: "Carnegie Mellon University", tone: "gray" },
    { t: "text", text: " and serve as a mentor and advisor at " },
    { t: "logo", name: "mit" },
    {
      t: "text",
      text: "MIT GOV/LAB. My teaching extends internationally to SFK International and ACG Arts in China, and Njala University in Sierra Leone.",
    },
  ],
  [
    { t: "text", text: "My work has been " },
    { t: "key", text: "recognized and awarded" },
    { t: "text", text: " across product design, entrepreneurship, and academia. See " },
    { t: "key", text: "what people are saying" },
    { t: "text", text: "." },
  ],
  [
    { t: "text", text: "I speak & consult on " },
    { t: "typer", words: consultWords },
    { t: "text", text: " and offer free mentorship " },
    { t: "key", text: "monthly" },
    { t: "text", text: " to " },
    { t: "typer", words: communityWords },
    { t: "text", text: " in design and tech." },
  ],
  [
    { t: "text", text: "Outside of the work, I'm a " },
    { t: "key", text: "reader", tone: "gray" },
    { t: "text", text: ", a " },
    { t: "key", text: "fan", tone: "gray" },
    { t: "text", text: ", a husband and father " },
    { t: "photo", src: "/about-logos/father.png", alt: "Fas with family" },
    { t: "text", text: "." },
  ],
];

// "What people are saying" — testimonials carousel (Fas 06/15: pop-up you can
// click "next" through, like case studies). PLACEHOLDER copy — final quotes
// pending from Fas.
export const testimonials = [
  {
    quote:
      "Fas brings rare clarity to messy, ambiguous problems — he can hold the systems view and the craft at the same time.",
    name: "Placeholder Name",
    role: "VP of Design, Company",
  },
  {
    quote:
      "Working with Fas reshaped how our team thinks about design as infrastructure, not output. The impact outlasted the engagement.",
    name: "Placeholder Name",
    role: "Founder, Startup",
  },
  {
    quote:
      "A generous mentor and a sharp strategist. Fas raises the level of everyone in the room.",
    name: "Placeholder Name",
    role: "Design Lead, Org",
  },
];

// Order + labels per the 2026-06-11 meeting (brackets removed in Nav.tsx).
export const navItems = [
  { label: "Work", href: "/work" },
  { label: "Leadership", href: "/leadership" },
  { label: "Research", href: "/research" },
  { label: "Build", href: "/build" },
  { label: "Teaching", href: "/teaching" },
  { label: "Blogs & Media", href: "/blogs" },
];
