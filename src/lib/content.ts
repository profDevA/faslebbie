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

// Inline brand logos (downloaded from Figma 187:1596) with their box colors.
export const aboutLogos = {
  "carnegie-mellon": { src: "/about-logos/carnegie-mellon.png", bg: "#c41230" },
  parsons: { src: "/about-logos/parsons.png", bg: "#f8f5f0" },
  utah: { src: "/about-logos/utah.png", bg: "#fefefe" },
  frankl: { src: "/about-logos/frankl.svg", bg: "#ffe500" },
  meta: { src: "/about-logos/meta.png", bg: "#1f1f1d" },
  mastercard: { src: "/about-logos/mastercard.png", bg: "#f8f5f0" },
  ptc: { src: "/about-logos/ptc.svg", bg: "#4d585a" },
  "consumer-reports": { src: "/about-logos/consumer-reports.svg", bg: "#00ae4d" },
  "western-digital": { src: "/about-logos/western-digital.svg", bg: "#f8f5f0" },
  mit: { src: "/about-logos/mit.png", bg: "#db1f2e" },
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

// About keyword dropdowns (Systems 2 & 3). Real copy where the Figma shows it;
// the Figma itself still uses lorem for several, so those are placeholders.
// TODO(Fas/Israel): final copy for the keywords marked PLACEHOLDER.
const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
export const aboutPanels: Record<
  string,
  { body: string[]; cta?: { label: string; href: string }; placeholder?: boolean }
> = {
  Product: { body: [LOREM], cta: { label: "Continue", href: "/work" }, placeholder: true },
  "Transition design": { body: [LOREM], cta: { label: "Continue", href: "/research" }, placeholder: true },
  "AI as material": { body: [LOREM], placeholder: true },
  "Scalar Design Leadership": { body: [LOREM], placeholder: true },
  teach: {
    body: [
      "Teaching across Carnegie Mellon, MIT GOV/LAB, SFK International, and Njala University — treating the classroom as an active studio.",
    ],
    cta: { label: "Continue to Teaching", href: "/teaching" },
  },
  "recognized and awarded": { body: [LOREM], placeholder: true },
  "what people are saying": { body: [LOREM, LOREM], cta: { label: "Read more", href: "/leadership" }, placeholder: true },
  monthly: { body: [LOREM], placeholder: true },
  reader: { body: [LOREM], placeholder: true },
  fan: { body: [LOREM], placeholder: true },
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
    { t: "text", text: ", while my research focuses on sustainable minerals, " },
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
    { t: "text", text: " design at Carnegie Mellon University and serve as a mentor and advisor at " },
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
