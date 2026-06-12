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

// Order + labels per the 2026-06-11 meeting (brackets removed in Nav.tsx).
export const navItems = [
  { label: "Work", href: "/work" },
  { label: "Leadership", href: "/leadership" },
  { label: "Research", href: "/research" },
  { label: "Build", href: "/build" },
  { label: "Teaching/Mentorship", href: "/teaching" },
  { label: "Blogs & Media", href: "/blogs" },
];
