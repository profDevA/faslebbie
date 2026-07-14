// Research page content (Figma "Faslebbie July Hollistic" 28fl2XqojJTa3jEblotAaz:
// desktop frames 1-40936 → 1-41873, modal detail 1-40135 → 1-40813).
//
// The page mirrors the About/Leadership reveal: a "Research" watermark recedes
// as the pinned prose brightens forward. Within the prose, red links open a
// paged modal ("Minerals & Post-Extractive Design") whose slides are the
// paradigms / principles / modalities / manifesto / field notes documented
// below. Copy is transcribed verbatim from the Figma design.

export type ResearchSectionId =
  | "paradigms"
  | "principles"
  | "modalities"
  | "manifesto"
  | "field-notes";

// Ordered — drives the modal's Previous/Next paging + dots.
export const researchSectionOrder: ResearchSectionId[] = [
  "paradigms",
  "principles",
  "modalities",
  "manifesto",
  "field-notes",
];

export const researchSectionLabel: Record<ResearchSectionId, string> = {
  paradigms: "Paradigms",
  principles: "Principles",
  modalities: "Modalities",
  manifesto: "Manifesto",
  "field-notes": "Field Notes",
};

export const researchBreadcrumbRoot = "Minerals & Post-Extractive Design";

// --- Hero prose tokens ---------------------------------------------------
// `hl` = grey highlight pill (emphasis), `link` = red word that opens a modal
// section, `ext` = red link to another route.
export type ResearchToken =
  | { t: "text"; text: string }
  | { t: "hl"; text: string }
  | { t: "link"; text: string; opens: ResearchSectionId }
  | { t: "ext"; text: string; href: string };

export type ResearchArea = {
  kicker: string;
  body: ResearchToken[];
};

export const researchAreas: ResearchArea[] = [
  {
    kicker: "01 — Minerals & Post-Extractive Design",
    body: [
      { t: "text", text: "My research investigates how " },
      { t: "hl", text: "design decisions" },
      { t: "text", text: " shape " },
      { t: "hl", text: "mineral systems" },
      { t: "text", text: " — and how those systems, in turn, reshape " },
      { t: "hl", text: "communities, ecologies, and futures" },
      {
        t: "text",
        text: ". For two decades, I've worked inside ",
      },
      { t: "hl", text: "African mining communities" },
      {
        t: "text",
        text: ", developing post-extractive frameworks that center local knowledge and agency over extraction and profit. This work unfolds across ",
      },
      { t: "link", text: "paradigms", opens: "paradigms" },
      { t: "text", text: ", " },
      { t: "link", text: "principles", opens: "principles" },
      { t: "text", text: ", " },
      { t: "link", text: "modalities", opens: "modalities" },
      { t: "text", text: ", and a " },
      { t: "link", text: "manifesto", opens: "manifesto" },
      { t: "text", text: " — grounded in the " },
      { t: "link", text: "field notes", opens: "field-notes" },
      { t: "text", text: "." },
    ],
  },
  {
    kicker: "02 — AI As A Design Material",
    body: [
      { t: "text", text: "A second line of inquiry examines " },
      { t: "hl", text: "AI as raw material" },
      { t: "text", text: " — not as a productivity tool, but as " },
      { t: "hl", text: "design infrastructure" },
      {
        t: "text",
        text: " that reshapes design practice, creative agency, and what it means to ",
      },
      { t: "hl", text: "build" },
      {
        t: "text",
        text: ". This research connects my industry work at Meta with emerging questions about ",
      },
      { t: "hl", text: "AI ethics" },
      { t: "text", text: " & " },
      { t: "hl", text: "design equity" },
      { t: "text", text: "." },
    ],
  },
  {
    kicker: "03 — Design Leadership & The Scalar Framework",
    body: [
      { t: "text", text: "A third line of inquiry examines how " },
      { t: "hl", text: "design leadership" },
      { t: "text", text: " itself, how teams scale, how organizations become " },
      { t: "hl", text: "designable systems" },
      {
        t: "text",
        text: ", and what excellence looks like across levels of complexity. Six years of applied research produced the ",
      },
      { t: "ext", text: "Scalar Framework", href: "/leadership" },
      {
        t: "text",
        text: ", a multi-level leadership tool grounded in practice, not theory alone.",
      },
    ],
  },
];

export const researchClosing: ResearchToken[] = [
  { t: "text", text: "I write about all of it across " },
  { t: "ext", text: "books", href: "/blogs" },
  { t: "text", text: ", " },
  { t: "ext", text: "journals & articles", href: "/blogs" },
  { t: "text", text: ", and " },
  { t: "ext", text: "academic work", href: "/blogs" },
  { t: "text", text: "." },
];

// --- Modal section content ----------------------------------------------
export type NumberedItem = { n: string; title: string; body: string };

export type ParadigmsContent = {
  kind: "paradigms";
  label: string;
  intro: string;
  items: NumberedItem[];
};

export type PrinciplesContent = {
  kind: "principles";
  label: string;
  intro: string;
  items: NumberedItem[];
  conclusion: { kicker: string; body: string };
};

export type ModalitiesContent = {
  kind: "modalities";
  kicker: string;
  statement: string;
  items: { n: string; label: string }[];
  groups: { title: string; items: string[] }[];
  footnote: string;
};

// Manifesto paragraphs: an array of inline runs (bold flag) per paragraph.
export type ManifestoRun = { text: string; bold?: boolean };
export type ManifestoContent = {
  kind: "manifesto";
  paragraphs: ManifestoRun[][];
};

export type FieldNote = {
  n: string;
  place: string;
  quote: string;
  methodology: string;
  themes: string;
  insight: string;
  image?: string;
};
export type FieldNotesContent = {
  kind: "field-notes";
  notes: FieldNote[];
};

export type ResearchSectionContent =
  | ParadigmsContent
  | PrinciplesContent
  | ModalitiesContent
  | ManifestoContent
  | FieldNotesContent;

export const researchSections: Record<
  ResearchSectionId,
  ResearchSectionContent
> = {
  paradigms: {
    kind: "paradigms",
    label: "Paradigms",
    intro:
      "This is built directly from your own framework — three mineral-oriented worldviews, each with its own ontology, design conditions, and choreography.",
    items: [
      {
        n: "01",
        title: "Pre-extractive — Earth as a Place (Symbiosis)",
        body: "Minerals as sacred elements within divine order, received rather than taken, governed by Lahi Kafo principles and Ndumo (rest periods) that let resources regenerate. The pre-extractive worldview, which sees Earth as a place, choreographs minerals through sacred relationships and reciprocity systems, demonstrating sophisticated resource stewardship that integrates minerals into cultural and spiritual frameworks.",
      },
      {
        n: "02",
        title: "Extractive — Earth as a Commodity (Fragmentation)",
        body: "The dominant paradigm since the colonial era. Extractive worldviews gained dominance during the colonial era and continue to shape much of the current global economic system, viewing Earth primarily as a source of commodities — resources move rapidly and globally with a short lifespan before being discarded at disposal sites. Structured by five design conditions: codification of worldviews, concentration of power, forging of relations, organization of labor, and ASM as design protest.",
      },
      {
        n: "03",
        title: "Post-extractive — Earth as a Whole (Reintegration)",
        body: "Post-extractive worldviews challenge the extractive paradigm, seeking to balance resource utilization with environmental stewardship and social equity, drawing on traditional wisdom and modern scientific understanding to reimagine our relationship with minerals and the Earth. Not the cessation of mining, but its transformation — community agency, regenerative relationships, entrepreneurial exit pathways.",
      },
    ],
  },
  principles: {
    kind: "principles",
    label: "Principles",
    intro:
      "These principles emerged through years of fieldwork, design practice, and collaboration with mining communities. Together they provide a practical framework for making design decisions that prioritize local knowledge, shared stewardship, and long-term systemic change over extraction and efficiency alone.",
    items: [
      {
        n: "01",
        title: "Start with what people actually need.",
        body: "Begin with what Kono residents need — Bongura, the cracks where current systems fail — not what global markets demand. The 4Cs (cut, clarity, color, carat) are embedded within Anglo-European and Western epistemological frameworks, including capitalism and commercialization, marginalizing the knowledge of the people closest to the stone. If a value system can't account for the miner's wellbeing, it's an incomplete value system.",
      },
      {
        n: "02",
        title: "Keep communities in control",
        body: "Power doesn't get loaned to communities — it gets returned. The embedded ally framework moves a researcher from extractive observer to committed steward, and becoming a steward means researchers are responsible for protecting their subject community from external undermining forces and fostering ongoing engagement long after the research formally ends. Communities drive; design assists.",
      },
      {
        n: "03",
        title: "Open the black box of the supply chain",
        body: "Most consumers never see the line connecting their purchase to its origin. Build the receipts. A jewelry designer in Las Vegas put it plainly: pristine retail spaces are built while miners work in toxic pits, and the industry designs spaces that help customers forget the connection. Show people what their money actually touched.",
      },
      {
        n: "04",
        title: "Design for the rupture",
        body: "Treat instability as information, not failure. Resources move rapidly through consumption cycles but remain stagnant in sacrifice zones, divorced from their ecological and cultural contexts — that imbalance is itself a signal. Bongura are cracks where the light gets in; they're where transition becomes possible, not a deviation from the plan.",
      },
      {
        n: "05",
        title: "Become a steward, not a visitor",
        body: "Entering a community is the easy part. The embedded ally approach has three stages: entering as a researcher who actively unlearns Western hegemonic assumptions, attuning to cultural realities through direct lived connection, and becoming a steward after leaving. Most research stops at stage one. Don't.",
      },
      {
        n: "06",
        title: "Make mineral literacy learnable",
        body: 'Power gaps often start as knowledge gaps. One Kono diamond trader explained the imbalance directly: "We don\'t understand the market price overseas." The Kono Language Mineral Literacy Taxonomy exists to close that gap in the community\'s own language, not an imported one.',
      },
      {
        n: "07",
        title: "Support co-creation, not extraction",
        body: "The difference between research on a community and research with one is the difference between data and dignity. Participatory Action Research moves community members from subjects to co-researchers and co-designers. The Ladder of Citizen Participation marks the line: the first five rungs are tokenism, the next three are real shared power.",
      },
      {
        n: "08",
        title: "Design tools people can actually wield",
        body: "A framework nobody can operate is just a diagram. Tools like the Minerality at Scale Toolkit and the Kono Language Mineral Literacy Taxonomy are built to be picked up and used by the communities they serve — legible, teachable, and owned locally rather than administered from outside.",
      },
      {
        n: "09",
        title: "Protect what has non-economic value",
        body: "Some land isn't for sale at any price, and the framework has to hold that. Sacred groves, sacred sites, and ancestral land carry value that exists outside market logic. Communities like those protecting Lake Sonfon in Koinadugu District show this in practice — defending land because it resists being priced, not despite it.",
      },
      {
        n: "10",
        title: "Know what shouldn't be extracted",
        body: "Just because a resource can be commodified doesn't mean it should be. Post-extractive worldviews see mineral resources not as commodities to be extracted but as part of living systems requiring stewardship and care. Some decisions are about restraint, not optimization.",
      },
      {
        n: "11",
        title: "Design for everyone's exit, not just entry",
        body: "Not every community wants the same ending. Post-extractive practice can mean ceasing mining entirely, or transforming how mining is done — Gudynas describes post-extractivism as not a ban on all mining, but the significant transformation of these activities to minimize their environmental and cultural impact. Both are legitimate destinations.",
      },
      {
        n: "12",
        title: "Provide context across scales, not just answers",
        body: "A single intervention rarely fixes a systemic problem. The Minerality at Scale Toolkit plots observations across five scales — micro, individual, community, regional, and global — against the mineral's full choreography, because a decision made at one scale ripples, often invisibly, into all the others.",
      },
    ],
    conclusion: {
      kicker: "The bottom line",
      body: "Design doesn't sit outside extraction, watching — it's already inside the system, choreographing who benefits and who bears the cost. The work isn't to walk away from minerals, but to change the choreography: returning power to the people closest to the ground, honoring what can't be priced, and building real exits out of dependency rather than permanent reasons to stay in it.",
    },
  },
  modalities: {
    kind: "modalities",
    kicker: "The modalities are how the research actually happened.",
    statement:
      "The channels through which knowledge was exchanged in the field, they define how data was given and how understanding was received.",
    items: [
      { n: "01", label: "semi-structured interviews" },
      { n: "02", label: "elder oral history collection" },
      { n: "03", label: "participant observation" },
      { n: "04", label: "community mapping" },
      { n: "05", label: "co-design sessions" },
      { n: "06", label: "archival research" },
      { n: "07", label: "field photography" },
      { n: "08", label: "autoethnographic journaling" },
      { n: "09", label: "q-methodology" },
    ],
    groups: [
      {
        title: "human & oral",
        items: [
          "semi-structured interviews",
          "elder oral history",
          "participant observation",
          "community mapping",
          "co-design sessions",
        ],
      },
      {
        title: "documentary & recorded",
        items: [
          "archival research",
          "field photography",
          "autoethnographic journaling",
          "q-methodology",
        ],
      },
    ],
    footnote: "field encounters move between both channels",
  },
  manifesto: {
    kind: "manifesto",
    paragraphs: [
      [
        { text: "Mineral choreography", bold: true },
        {
          text: " is a framework that names design as the force shaping how minerals move — from origin to extraction, consumption, and disposal.",
        },
      ],
      [
        { text: "It is the " },
        { text: "lens", bold: true },
        {
          text: " for understanding mineral resource systems in Sierra Leone and across the Global South.",
        },
      ],
      [
        {
          text: "Our goal is to show that beneficiation failures are not market failures — they are ",
        },
        { text: "predictable outcomes of designed systems", bold: true },
        { text: ", and design can be redirected." },
      ],
      [
        { text: "We " },
        { text: "document", bold: true },
        {
          text: " the worldviews that shape mineral systems: pre-extractive, extractive, post-extractive.",
        },
      ],
      [
        { text: "We " },
        { text: "study", bold: true },
        {
          text: " what makes a mineral system just, sustainable, and community-led — and translate those findings into usable frameworks: the Mineral Choreography Framework, the Minerality at Scale Toolkit, the embedded ally methodology.",
        },
      ],
      [
        {
          text: "Mineral choreography exists to make visible what extraction hides, return power to those closest to the ground, and build pathways toward post-extractive futures.",
        },
      ],
      [
        { text: "It acts as a " },
        { text: "living primer", bold: true },
        {
          text: " — nine interconnected elements, like acupuncture needles, each a precise point of intervention in a much larger system.",
        },
      ],
      [
        {
          text: "A toolkit for anyone designing a more honest relationship with the Earth.",
        },
      ],
    ],
  },
  "field-notes": {
    kind: "field-notes",
    notes: [
      {
        n: "01",
        place: "Kono District, Sierra Leone",
        quote:
          '"Artisanal mining site at dawn. The scale of manual labor remains invisible to global interface design."',
        methodology: "Relational, systemic, and multi-sited.",
        themes: "Labor · Infrastructure · Value Chain",
        insight:
          "Infrastructure is not just code; it is the physical metabolic cost of the material world.",
        image: "/research/field-note-01.jpg",
      },
    ],
  },
};
