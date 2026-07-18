// Teaching / Pedagogy page content (Figma 16-19731 / 16-22597 / 16-19360 /
// 158-10172 / 280-4632). Same ".txt" / ".img" architecture as Work / Leadership
// / Build. The ".txt" prose has:
//   • gray institution pills + a black `>/~ learn it` cycle term (intro),
//   • red `student` links that open the paged Student Works modal,
//   • red `action` links — "See all student works" (→ ".img") and
//     "Explore my student exhibitions" (→ the SFK Beijing exhibition overlay).
//
// Student copy is migrated from the live site (faslebbie.com/students-work);
// imagery is placeholder (tinted blocks) until Fas supplies the real photos.
// Kept in-code for now (like Leadership / Build) — the meeting flagged this as
// the next thing to move into Sanity (one editable template), a follow-up.

export type TeachToken =
  | { t: "text"; text: string }
  // Gray, rounded institution pill (static — Figma 16-22597 intro).
  | { t: "pill"; text: string }
  // Black `>/~` terminal-style highlight, e.g. the "learn it" cycle term.
  | { t: "term"; text: string }
  // Red, underlined link that opens the Student Works modal by `id`.
  | { t: "student"; id: string; text: string }
  // Red, underlined action link: switch to ".img" / open the exhibition.
  | { t: "action"; kind: "students" | "exhibition"; text: string };

export interface StudentProject {
  id: string;
  /** Card caption + modal title (modal appends a colon). */
  title: string;
  /** Long descriptive subtitle (from the live site title), e.g. for alt text. */
  headline: string;
  /** Sentence-case description; the modal renders it `capitalize` (Figma). */
  description: string;
  /** Card height tier for the masonry rhythm. */
  span: "sm" | "md" | "lg";
  /** Placeholder card art tint (until real project imagery is supplied). */
  tint: string;
  /** Whether the placeholder art is light (caption/label goes dark). */
  lightArt?: boolean;
  /** Real image URLs (empty → placeholder). Carousel cycles these. */
  images?: string[];
  /** Placeholder slide count for the modal carousel when `images` is empty. */
  slides?: number;
}

// Student projects — order matches the ".img" grid (Figma 280-4434). Copy from
// faslebbie.com/students-work.
export const students: StudentProject[] = [
  {
    id: "new-transport",
    title: "New Transport",
    headline: "Reimagining Urban Transit Experience",
    description:
      "Franklin Guttman's project addresses urban transportation challenges through innovative design solutions that enhance commuter experiences, reduce environmental impact, and reimagine transit infrastructure for evolving urban systems and changing passenger needs.",
    span: "md",
    tint: "#8f8a82",
    slides: 6,
  },
  {
    id: "ephemeral",
    title: "Ephemeral",
    headline: "Cultivating Mindfulness in the Digital Age",
    description:
      "An analog intervention addressing digital overwhelm through card-based contemplative prompts. This low-tech approach creates technology-free spaces for mindfulness, offering tools for cultivating awareness in fast-paced digital environments.",
    span: "lg",
    tint: "#cbb9a3",
    lightArt: true,
    slides: 4,
  },
  {
    id: "trash-to-treasure",
    title: "Trash to Treasure",
    headline: "Reimagining Waste as Relational Objects",
    description:
      "A community ritual transforming waste perception through “scrap-sculpting” exchanges. Participants create mementos from personal waste, establishing meaningful household fixtures that foster intergenerational appreciation and address environmental concerns.",
    span: "md",
    tint: "#b8923f",
    slides: 5,
  },
  {
    id: "honey-honey",
    title: "Honey Honey",
    headline: "Gaming Environmental Collapse",
    description:
      "A subversive board game placing players as honeybees navigating environmental challenges like habitat loss and industrial production. The game fosters empathy for pollinators while delivering sobering messages about ecological stewardship.",
    span: "md",
    tint: "#d8d2c4",
    lightArt: true,
    slides: 4,
  },
  {
    id: "the-little-home",
    title: "The Little Home",
    headline: "Bridging Family Distance Through Storytelling",
    description:
      "Combines physical playing cards with IoT technology enabling asynchronous bonding between parents and children during formative years, transforming bedtime routines into flexible, creative interactions that preserve connection despite separation.",
    span: "lg",
    tint: "#2f2a26",
    slides: 5,
  },
  {
    id: "compare-n-go",
    title: "Compare-N-Go",
    headline: "Rethinking Convenience Food Choices",
    description:
      "A pop-up vending machine campaign juxtaposing processed and healthy foods with nutrition facts at purchase point. Creates disruptive awareness moments to subvert thoughtless consumption patterns and redirect college students toward healthier snack choices.",
    span: "sm",
    tint: "#26221f",
    slides: 4,
  },
  {
    id: "pads-tampons-cups",
    title: "Pads, Tampons, Cups and More",
    headline: "Demystifying Menstruation",
    description:
      "A comprehensive campaign empowering young girls experiencing their first menstrual cycles through educational booklets, product kits, and accessible public dispensers. The project demystifies menstruation by providing clear, inclusive information and practical tools, helping adolescents navigate their early experiences with confidence.",
    span: "md",
    tint: "#c98f9a",
    slides: 5,
  },
  {
    id: "uum",
    title: "Uum",
    headline: "Reinventing the Vacuum as Centerpiece",
    description:
      "Transforms vacuuming from laborious task to aesthetic experience by reimagining the appliance as sculptural furniture with shape-change capabilities and integrated lighting. Challenges conventional home appliance design by elevating utilitarian objects to decorative centerpieces.",
    span: "lg",
    tint: "#3a4450",
    slides: 4,
  },
  {
    id: "welcome-to-walkatopia",
    title: "Welcome to Walkatopia",
    headline: "Reimagining Pedestrian-Centric Cities",
    description:
      "Challenges America's car-centric infrastructure through an immersive digital experience guiding users through unwalkable cities. The campaign disrupts established mental models, helping audiences envision pedestrian-friendly alternatives that reduce social disparities and environmental impact.",
    span: "sm",
    tint: "#6f7b6a",
    slides: 5,
  },
  {
    id: "origin",
    title: "Origin",
    headline: "A Shared Technology Vision",
    description:
      "A conceptual system reframing smartphones as shared public resources accessed through secure ID authentication. By challenging planned obsolescence and promoting communal device use, the project encourages mindful digital consumption and reduces electronic waste.",
    span: "lg",
    tint: "#7a5cc0",
    slides: 5,
  },
  {
    id: "ecolivery",
    title: "Ecolivery",
    headline: "Addressing Food Delivery Waste",
    description:
      "A delivery app offering eco-friendly packaging to restaurants through monthly subscriptions. Features strategic design elements like dedicated “eco” categories and promotional benefits to encourage environmentally conscious dining choices during increased pandemic delivery demand.",
    span: "md",
    tint: "#a7c39a",
    lightArt: true,
    slides: 4,
  },
  {
    id: "spinning-out",
    title: "Spinning Out",
    headline: "Visualizing Scooter Chaos in Public Spaces",
    description:
      "A visual intervention highlighting the escalating problem of abandoned rental scooters cluttering public spaces. Through hyperbolic imagery and bold design cues, the project prompts viewers to consider the social and environmental impact of unchecked scooter behaviors.",
    span: "md",
    tint: "#4a4f55",
    slides: 4,
  },
  {
    id: "phoneless",
    title: "Phoneless",
    headline: "Reclaiming Mealtime Connections",
    description:
      "A wearable device tracking phone usage during meals, providing reminders to put devices away. Addresses screen time infiltrating social dining experiences, helping users maintain technology awareness while enhancing quality time with friends and family.",
    span: "sm",
    tint: "#d5d0c6",
    lightArt: true,
    slides: 4,
  },
  {
    id: "nudge",
    title: "Nudge",
    headline: "Breaking Social Silos Through Shared Dining",
    description:
      "A dining service offering discounted meals with strangers to combat social media's isolating algorithms. Uses warm branding, authentic testimonials, and social proof tactics to encourage diverse in-person interactions and break down social isolation barriers.",
    span: "md",
    tint: "#c0562f",
    slides: 5,
  },
];

// Intro prose (Figma 16-22597): institution pills + a black `>/~ learn it` term.
export const teachingIntro: TeachToken[][] = [
  [
    { t: "text", text: "I teach across " },
    { t: "pill", text: "Carnegie Mellon" },
    { t: "text", text: ", " },
    { t: "pill", text: "SFK International" },
    { t: "text", text: ", " },
    { t: "pill", text: "Njala University" },
    { t: "text", text: " and " },
    { t: "pill", text: "MIT GOV/LAB" },
    { t: "text", text: ", and now as a " },
    { t: "pill", text: "PhD advisor" },
    {
      t: "text",
      text: " at InGenius Prep. Across every context, my approach follows one cycle: ",
    },
    { t: "term", text: "learn it" },
    { t: "text", text: ". The classroom is a studio. The work is always real." },
  ],
];

export interface TeachSection {
  /** Small kicker label above the section (Figma "Student Works"). */
  kicker: string;
  paragraphs: TeachToken[][];
  /** Trailing red action link. */
  action: { kind: "students" | "exhibition"; text: string };
}

export const teachingSections: TeachSection[] = [
  {
    kicker: "Student Works",
    paragraphs: [
      [
        {
          t: "text",
          text: "I bring a teaching philosophy rooted in entrepreneurial practice, critique, prototyping, and systems thinking. The work students make should never end with a submission. It should travel into portfolios, exhibitions, communities, and public conversations. Across these settings, students move from ideas into systems, translating research into artifacts, services, and speculative futures through projects such as ",
        },
        { t: "student", id: "new-transport", text: "New Transport" },
        { t: "text", text: ", " },
        { t: "student", id: "trash-to-treasure", text: "Trash to Treasure" },
        { t: "text", text: ", " },
        { t: "student", id: "honey-honey", text: "Honey Honey" },
        { t: "text", text: ", and " },
        { t: "student", id: "welcome-to-walkatopia", text: "Welcome to Walkatopia" },
        {
          t: "text",
          text: ". Together, these projects demonstrate how students learn to frame problems, build interventions, and communicate ideas through design.",
        },
      ],
    ],
    action: { kind: "students", text: "See all student works" },
  },
  {
    kicker: "My Student Exhibitions",
    paragraphs: [
      [
        {
          t: "text",
          text: "Student exhibitions extend this philosophy into public settings, where student work becomes visible through installations, prototypes, critique walls, material experiments, and interactive demonstrations. They create opportunities for students to test ideas, share research, and engage broader audiences beyond the classroom. By bringing projects into public view, exhibitions transform design from an academic exercise into a form of public dialogue, helping students learn how ideas are presented, challenged, and understood in the world.",
        },
      ],
    ],
    action: { kind: "exhibition", text: "Explore my student exhibitions" },
  },
];

// SFK Beijing exhibition (Figma 280-4632 / live faslebbie.com/sfk-beijeing-
// exhibition). Placeholder tinted tiles until the real exhibition photos are
// supplied. `pos` drives the scattered collage in the overlay; the same tiles
// render as a neat masonry in the ".img" view.
export interface ExhibitionTile {
  tint: string;
  /** Scattered-collage placement (desktop overlay), as viewport percentages. */
  pos: { top: number; left: number; w: number };
  /** Masonry height tier for the ".img" grid. */
  span: "sm" | "md" | "lg";
}

export const exhibitionTitle = "SFK Beijing Exhibition";

export const exhibitionTiles: ExhibitionTile[] = [
  { tint: "#26221f", pos: { top: 12, left: 4, w: 11 }, span: "sm" },
  { tint: "#8a5a3c", pos: { top: 6, left: 30, w: 11 }, span: "md" },
  { tint: "#c9c3b6", pos: { top: 6, left: 52, w: 8 }, span: "lg" },
  { tint: "#3a4450", pos: { top: 7, left: 84, w: 11 }, span: "md" },
  { tint: "#6f4a8f", pos: { top: 34, left: 3, w: 11 }, span: "md" },
  { tint: "#c9b7a0", pos: { top: 40, left: 20, w: 10 }, span: "sm" },
  { tint: "#4a4f55", pos: { top: 33, left: 84, w: 11 }, span: "sm" },
  { tint: "#c05a2f", pos: { top: 47, left: 4, w: 11 }, span: "md" },
  { tint: "#3d5a80", pos: { top: 47, left: 22, w: 11 }, span: "sm" },
  { tint: "#d8d2c4", pos: { top: 45, left: 82, w: 12 }, span: "lg" },
  { tint: "#5a6b52", pos: { top: 70, left: 4, w: 11 }, span: "sm" },
  { tint: "#8f8a82", pos: { top: 78, left: 15, w: 9 }, span: "sm" },
  { tint: "#b8923f", pos: { top: 62, left: 84, w: 11 }, span: "md" },
  { tint: "#2f3b4a", pos: { top: 84, left: 4, w: 12 }, span: "md" },
  { tint: "#a7969a", pos: { top: 86, left: 28, w: 11 }, span: "sm" },
  { tint: "#c9d4e0", pos: { top: 88, left: 60, w: 10 }, span: "lg" },
  { tint: "#7a5cc0", pos: { top: 84, left: 84, w: 11 }, span: "sm" },
];
