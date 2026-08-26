// Research page content. Hero + modal copy: collaboration doc
// `faslebbie + Xiang Collaboration SITE FINAL COPY` (Research tab).
// Runtime reads Sanity `researchPage`; this file is the patch/seed source.

export type ResearchSectionId =
  | "paradigms"
  | "principles"
  | "modalities"
  | "manifesto"
  | "field-notes";

export const researchSectionOrder: ResearchSectionId[] = [
  "paradigms",
  "principles",
  "modalities",
  "manifesto",
  "field-notes",
];

/** All five research popups share Previous / dots / Next. */
export const researchPagerIds: ResearchSectionId[] = [
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

export type ResearchToken =
  | { t: "text"; text: string }
  | { t: "break" }
  | { t: "hl"; text: string; expansion?: string; expand?: ResearchToken[] }
  | { t: "link"; text: string; opens: ResearchSectionId }
  | { t: "ext"; text: string; href: string }
  | { t: "photo"; src: string; alt: string };

export type ResearchArea = {
  kicker: string;
  body: ResearchToken[];
};

export const researchAreas: ResearchArea[] = [
  {
    kicker: "01 — Minerals, Material & Post-Extractive Design",
    body: [
      { t: "text", text: "My doctoral research investigates how " },
      {
        t: "hl",
        text: "design decisions",
        expansion:
          "Mineral exploration and mining decisions get made on economic and technical priorities. Social, ecological, and cultural values are acknowledged and then weakly embedded across mining policies, practices, and processes. That gap produces mistrust, conflict, delay, and failure. Design is already in the room where those decisions happen. It is rarely named as design, which is why nobody examines it.",
      },
      { t: "text", text: " shape " },
      {
        t: "hl",
        text: "mineral systems",
        expansion:
          "This work culminated in what I call mineral choreography, a new domain of inquiry establishing design as an active force within the extractive sector and sustainability transitions. The premise is that minerals are not passive raw material. They are active agents in transition, shaped by worldviews and power. Mineral flows are not static industrial processes but designed, choreographed, and contested spaces.",
      },
      {
        t: "text",
        text: ", and how those systems, in turn, reshape the ",
      },
      {
        t: "hl",
        text: "communities and ecologies",
        expansion:
          "A century of growth-oriented consumption has left mining communities in a cycle of extractive obesity, one that depletes the resource, accelerates climate damage, and exploits labor while the community stays poor. The fieldwork centers on the Kono District of Sierra Leone, where I was born, tracing its relationship with its minerals across three eras: the pre-extractive past, the extractive present, and the post-extractive practices that sketch a possible future. A parallel study follows consumption sites in American urban privilege zones, far removed from the extraction that supplies them.",
      },
      {
        t: "text",
        text: " around them. A decade of fieldwork in African mining communities and a PhD from Carnegie Mellon",
      },
      { t: "text", text: ", developing " },
      {
        t: "hl",
        text: "post-extractive frameworks",
        expansion:
          "A primer of nine elements establishing a new domain of inquiry at the intersection of design, the extractive sector, and sustainability transitions. It gives Transition Design a systems-level view for analyzing mineral choreographies, defines design as an active force inside extractive industries, and identifies frameworks for community-driven resource infrastructure. Minerality at Scale is the tool that came out of it, tracing material trajectories from the individual and local up to the planetary. All of it co-designed with mining communities alongside engineers, policymakers, and scientists.",
      },
      {
        t: "text",
        text: " that center local knowledge and agency over extraction and profit.",
      },
      { t: "break" },
      { t: "text", text: "The work produced a set of artifacts: " },
      { t: "link", text: "paradigms", opens: "paradigms" },
      { t: "text", text: ", " },
      { t: "link", text: "principles", opens: "principles" },
      { t: "text", text: ", " },
      { t: "link", text: "modalities", opens: "modalities" },
      { t: "text", text: ", a " },
      { t: "link", text: "manifesto", opens: "manifesto" },
      { t: "text", text: ", and the " },
      { t: "link", text: "field notes", opens: "field-notes" },
      { t: "text", text: " underneath all of it." },
    ],
  },
  {
    kicker: "02 — AI as a Design Material",
    body: [
      { t: "text", text: "A second line of inquiry, still underway, treats " },
      {
        t: "hl",
        text: "AI as raw material",
        expansion:
          "AI is not a feature you add. It is a material with properties, constraints, and consequences a designer is responsible for understanding. Same as minerals. Paola Antonelli called it a new raw material for designers at the Artificial Imperfection seminar, and I have spent the years since asking what that means in practice. Most work treats AI as something to add rather than a substrate to think with, which is why so much of it arrives without a point of view.",
      },
      {
        t: "text",
        text: " rather than a productivity tool. It asks less what AI can do for design and more what ",
      },
      {
        t: "hl",
        text: "design can do for AI",
        expansion:
          "Two questions sit at this intersection and the field mostly asks one. What AI can do for design gets the attention. What design can do for AI gets far less. In conversations with companies the pattern repeats: data science teams build things no user wants, design teams want things no one can build. My work sits in that gap, which is a design problem before it is a technical one.",
      },
      { t: "text", text: ", and turns that into " },
      {
        t: "hl",
        text: "tools for design research",
        expansion:
          "Design research is slow. Gathering and analyzing enough data to see a pattern takes weeks, and sensemaking is where it stalls. I am building a taxonomy that maps AI capabilities to specific design research methodologies, and web applications that let researchers explore it. The working question: how might we build a tool that helps design researchers get more out of their interviews? Presented at the Design Research Society in 2025.",
      },
      {
        t: "text",
        text: ". The work runs alongside industry practice at Meta and PTC, and keeps returning to questions of ",
      },
      {
        t: "hl",
        text: "ethics and equity",
        expansion:
          "Drawing on earlier work on race and algorithmic systems. Who benefits from AI-accelerated design, whose labor gets displaced, and what a designer is accountable for when the material starts making decisions. The question is not whether to use AI but what you owe the people affected by what it produces.",
      },
      { t: "text", text: "." },
    ],
  },
  {
    kicker: "03 — Design Leadership & the Scalar Framework",
    body: [
      { t: "text", text: "A third line of inquiry treats " },
      {
        t: "hl",
        text: "design leadership",
        expansion:
          "Leadership is usually taught as a set of behaviors and studied as a personality trait. I treat it as a design problem instead. An organization is built, which means it was designed, which means it can be redesigned. Most were not designed deliberately. They accumulated. The research question is what happens when you approach one the way you would approach any other system: prototype it, test it, revise it.",
      },
      {
        t: "text",
        text: " itself as a research subject. The working hypothesis is that leadership is an interactive system, and that the unit which matters is not the individual leader but the ",
      },
      {
        t: "hl",
        text: "resonant relationship",
        expansion:
          "If leadership is interactional, then quality of interaction is the variable worth studying. Resonance is what happens when an interaction leaves both people more capable than it found them, and the research traces how it forms at three scales: between individuals, across functions, and between a design organization and the institution around it. It also produces what I call design currency, which is what a design function can actually spend. Not headcount or budget, but whether design input shows up in decisions made without a designer in the room. Most teams have craft and no currency, which is why good work fails to travel.",
      },
      {
        t: "text",
        text: " between people. Six years of applied research testing that across three scales, still developing. It produced the ",
      },
      {
        t: "hl",
        text: "Scalar Framework",
        expansion:
          "Three levels, each one a system to be designed. Each runs across five dimensions: personal, product, team, strategy, company. Tested at Meta across fourteen product portfolios, at Consumer Reports across six research teams, at PTC across forty industrial sites, and at MIT GOV/LAB with civic institutions on two continents. A framework is only a lens. There is no single set of rules that produces design success, which is why staying close to the craft matters as much as holding the framework.",
      },
      { t: "text", text: ", and the " },
      {
        t: "hl",
        text: "commitments and asks",
        expansion:
          "A framework provides the structure. Team culture provides the engine. Five commitments I make to every team, each paired with what I ask in return. Personal. I commit to your wellbeing and sustainable growth. I ask you to help me understand how you work best so I can position you for it. Product. I commit to elevating design craft as a strategic differentiator. I ask you to take responsibility for both your growth and the external impact of your decisions. Team. I commit to building autonomous, collaborative, continuously learning teams. I ask you to protect time for both craft and team engagement. Strategy. I commit to positioning design as a driver of product strategy and future vision. I ask you to articulate how your contributions shape it. Organization. I commit to building design's influence across the organization. I ask you to position design as a collaborator rather than a service provider.",
      },
      { t: "text", text: " that make it work in practice." },
    ],
  },
];

export const researchClosing: ResearchToken[] = [
  {
    t: "text",
    text: "These are the three forms my design work takes: minerals into materials, immaterial AI, and organizational leadership systems. I write and speak about it through ",
  },
  { t: "ext", text: "blogs and journals", href: "/blogs" },
  { t: "text", text: ", workshops, presentations, and conferences." },
];

export const researchExpansions: Record<string, string> = Object.fromEntries(
  researchAreas.flatMap((a) =>
    a.body
      .filter((t): t is Extract<ResearchToken, { t: "hl" }> => t.t === "hl" && Boolean(t.expansion))
      .map((t) => [t.text, t.expansion ?? ""]),
  ),
);

export type NumberedItem = { n: string; title: string; body: string };

export type ParadigmsContent = {
  kind: "paradigms";
  label: string;
  intro: string;
  image?: string;
  items: NumberedItem[];
};

export type PrinciplesContent = {
  kind: "principles";
  label: string;
  intro: string;
  image?: string;
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
  images?: string[];
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
      "Three worldviews have governed how minerals move. Each carries its own ontology, its own design conditions, and its own choreography. Each is still active somewhere in the world today.",
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
      "These principles emerged through years of fieldwork, design practice, and collaboration with mining communities in Sierra Leone's Kono District. Together they set the working stance behind every framework here: start from what a community needs, and design real exits out of extraction rather than permanent reasons to stay in it.",
    items: [
      {
        n: "01",
        title: "Start with what people actually need",
        body: "Begin with what Kono residents need. Bongura, the cracks where current systems fail, not what global markets demand. The 4Cs of cut, clarity, color and carat are embedded within Anglo-European and Western epistemological frameworks, including capitalism and commercialization, marginalizing the knowledge of the people closest to the stone. If a value system cannot account for the miner's wellbeing, it is an incomplete value system.",
      },
      {
        n: "02",
        title: "Become an embedded ally",
        body: "Power does not get loaned to communities. It gets returned. The embedded ally framework moves a researcher from extractive observer to committed steward across three stages: entering as a researcher who actively unlearns Western hegemonic assumptions, attuning to cultural realities through direct lived connection, and becoming a steward after leaving. Most research stops at stage one. Stewardship means protecting the community from external undermining forces and sustaining engagement long after the research formally ends. Communities drive. Design assists.",
      },
      {
        n: "03",
        title: "Open the black box of the supply chain",
        body: "Most consumers never see the line connecting their purchase to its origin. Build the receipts. A jewelry designer in Las Vegas put it plainly: pristine retail spaces are built while miners work in toxic pits, and the industry designs spaces that help customers forget the connection. Show people what their money actually touched.",
      },
      {
        n: "04",
        title: "Design for the rupture",
        body: "Treat instability as information, not failure. Resources move rapidly through consumption cycles but remain stagnant in sacrifice zones, divorced from their ecological and cultural contexts. That imbalance is itself a signal. Bongura are cracks where the light gets in. They are where transition becomes possible, not a deviation from the plan.",
      },
      {
        n: "05",
        title: "Make mineral literacy learnable",
        body: "Power gaps often start as knowledge gaps. One Kono diamond trader explained the imbalance directly: we do not understand the market price overseas. The Kono Language Mineral Literacy Taxonomy exists to close that gap in the community's own language, not an imported one.",
      },
      {
        n: "06",
        title: "Support co-creation, not extraction",
        body: "The difference between research on a community and research with one is the difference between data and dignity. Participatory Action Research moves community members from subjects to co-researchers and co-designers. The Ladder of Citizen Participation marks the line: the first five rungs are tokenism, the next three are real shared power.",
      },
      {
        n: "07",
        title: "Build tools people can wield across scales",
        body: "A framework nobody can operate is just a diagram. Tools like the Minerality at Scale Toolkit and the Kono Language Mineral Literacy Taxonomy are built to be picked up and used by the communities they serve: legible, teachable, and owned locally rather than administered from outside. They also have to work at more than one altitude, because a single intervention rarely fixes a systemic problem. Minerality at Scale plots observations across five scales, from micro and individual through community and regional to global, against the mineral's full choreography, because a decision made at one scale ripples, often invisibly, into all the others.",
      },
      {
        n: "08",
        title: "Know what should not be extracted",
        body: "Just because a resource can be commodified does not mean it should be. Some land is not for sale at any price, and the framework has to hold that. Sacred groves, sacred sites, and ancestral land carry value that exists outside market logic. Communities like those protecting Lake Sonfon in Koinadugu District show this in practice, defending land because it resists being priced, not despite it. Post-extractive worldviews see mineral resources not as commodities to be extracted but as part of living systems requiring stewardship and care. Some decisions are about restraint, not optimization.",
      },
      {
        n: "09",
        title: "Design for everyone's exit, not just entry",
        body: "Not every community wants the same ending. Post-extractive practice can mean ceasing mining entirely, or transforming how mining is done. Gudynas describes post-extractivism as not a ban on all mining, but the significant transformation of these activities to minimize their environmental and cultural impact. Both are legitimate destinations.",
      },
    ],
    conclusion: {
      kicker: "The bottom line",
      body: "Design does not sit outside extraction, watching. It is already inside the system, choreographing who benefits and who bears the cost. The work is not to walk away from minerals, but to change the choreography: returning power to the people closest to the ground, honoring what cannot be priced, and building real exits out of dependency rather than permanent reasons to stay in it.",
    },
  },
  modalities: {
    kind: "modalities",
    kicker: "The modalities are how the research actually happened.",
    statement:
      "The channels through which knowledge was exchanged in the field. They define how data was given and how understanding was received.",
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
          "elder oral history",
          "semi-structured interviews",
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
        quote: "Artisanal mining site at dawn",
        methodology: "Relational, systemic, and multi-sited.",
        themes: "Labour · Infrastructure · Value chain",
        insight:
          "The scale of manual labour here stays invisible to the interfaces built downstream from it. Infrastructure is not just code. It is the physical metabolic cost of the material world.",
        image: "/research/field-note-01.jpg",
      },
    ],
  },
};
