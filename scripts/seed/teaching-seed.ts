/**
 * Teaching page seed data for Sanity migration scripts only.
 * Not imported by app runtime — see src/lib/teaching.ts for types.
 *
 * Copy migrated from the original in-code teaching.ts (faslebbie.com copy).
 */
import type {
  StudentProject,
  TeachSection,
  TeachToken,
} from "../../src/lib/teaching";

/** Seed-only: modal carousel slide count before real images are uploaded. */
type SeedStudentProject = StudentProject & { slides?: number };

// Student projects — order matches the ".img" grid (Figma 280-4434). Copy from
// faslebbie.com/students-work.
export const students: SeedStudentProject[] = [
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

// Teaching `.txt` prose — holistic Figma 2829:2920. Three paragraphs, no
// kickers and no trailing action pills: the only link out is the red
// `exhibitions` token, and Student Works is reached via the view toggle.
export const teachingIntro: TeachToken[][] = [
  [
    {
      t: "text",
      text: "I teach design, social innovation, and sustainable transitions in the extractive sector across ",
    },
    { t: "pill", text: "Carnegie Mellon" },
    { t: "text", text: ", " },
    { t: "pill", text: "MIT GOV/LAB" },
    { t: "text", text: ", " },
    { t: "pill", text: "SFK International" },
    { t: "text", text: ", and " },
    { t: "pill", text: "Njala University" },
    { t: "text", text: ", and as a " },
    { t: "pill", text: "PhD advisor" },
    { t: "text", text: " at InGenius Prep." },
  ],
  [
    {
      t: "text",
      text: "I bring a teaching philosophy rooted in entrepreneurial practice, critique, prototyping, and systems thinking. Knowledge is co-created, not delivered, through active learning, reflective assessment, learning portfolios, and studio-like approaches. I practice a pedagogical structure I call the ",
    },
    { t: "pill", text: "LTP cycle" },
    {
      t: "text",
      text: ": learn it, teach it, practice it. The work students make should never end with a submission. It should travel into portfolios, exhibitions, communities, and public conversations. Across these settings, students move from ideas into systems, translating research into artifacts, services, and speculative futures.",
    },
  ],
  [
    { t: "text", text: "Their " },
    { t: "pill", text: "projects" },
    {
      t: "text",
      text: " demonstrate how students learn to frame problems, build interventions, and communicate ideas through design. Many of my students have gone on to Google, Apple, and top design firms, entered graduate programs at leading universities, and shown work in ",
    },
    { t: "action", kind: "exhibition", text: "exhibitions" },
    { t: "text", text: " across China, Africa, and the US." },
  ],
];

/** Figma 2829:2920 has no kickered sections — the prose is one three-para run. */
export const teachingSections: TeachSection[] = [];

export const exhibitionTitle = "SFK Beijing Exhibition";

/** Live faslebbie.com/students-work intro block. */
export const studentsWorkIntro =
  "Fas Lebbie has taught several classes at the university level, primarily as a Teaching Fellow at Carnegie Mellon University, and has delivered lectures at MIT, Parsons School of Design, University of Utah, and as a Visiting Professor at SFK International College of Arts in Beijing and Njala University in Sierra Leone. His teaching portfolio includes two graduate-level seminars he designed and taught and two mandatory undergraduate courses that he co-designed and co-taught at Carnegie Mellon University's School of Design.";

export type { TeachToken };
 