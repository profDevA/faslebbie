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

// Teaching `.philosophy` prose — Final Edits_faslebbiesite (2).docx (Aug 2026).
// Three paragraphs, no kickers; red `projects` / `exhibitions` pills.
const teachingReveals = {
  "Carnegie Mellon":
    ", where I teach undergraduate design studies, Persuasion on how design shapes attitudes, emotions, and behavior, and Place on physical environments as dynamic conditions shaped by design,",
  "MIT GOV/LAB":
    ", as design advisor working with African governments on frameworks to repair trust between citizens and the state, running co-design workshops and trainings that put officials, civil society, and local citizens to work together in the implementation process,",
  "SFK International":
    ", where I am a Visiting Professor in Beijing teaching Design for the 21st Century, a lecture and seminar course examining digital inclusion, biometrics, AI and racial bias, privacy and surveillance, environmental disruption, and global migration,",
  "Njala University":
    ", here I do 4 weeks once a year intensive course on Sustainable Foundations for Mineral Design, examining mineral systems within a design studies framework, the taxonomy of place-based minerals, their societal and ecological roles, and the communities that depend on them,",
  "PhD students at InGenius Prep":
    ", as Graduate Coach and PhD Advisor, working on graduate admissions, research positioning, and doctoral preparation, extending mentorship beyond the classroom into one-on-one advising.",
  "learn it, teach it, practice it":
    ', "learn it" builds theoretical capacity through readings and discussion and their translation into practical concepts; "teach it" builds communication capacity through sessions where students teach and present the material to their peers; and "practice it" is where students apply concepts to materialize something tangible,',
} as const;

export const teachingIntro: TeachToken[][] = [
  [
    { t: "text", text: "I teach design studies at " },
    { t: "pill", text: "Carnegie Mellon", expansion: teachingReveals["Carnegie Mellon"] },
    { t: "text", text: "; civic innovation with " },
    { t: "pill", text: "MIT GOV/LAB", expansion: teachingReveals["MIT GOV/LAB"] },
    { t: "text", text: "; design and technology at " },
    { t: "pill", text: "SFK International", expansion: teachingReveals["SFK International"] },
    { t: "text", text: "; and sustainable transitions for mineral design at " },
    { t: "pill", text: "Njala University", expansion: teachingReveals["Njala University"] },
    { t: "text", text: ". I advise " },
    {
      t: "pill",
      text: "PhD students at InGenius Prep",
      expansion: teachingReveals["PhD students at InGenius Prep"],
    },
    { t: "text", text: "." },
  ],
  [
    {
      t: "text",
      text: "My teaching philosophy is rooted in entrepreneurial practice, critique, prototyping, and systems thinking where knowledge is co-created. I practice a pedagogical framework I call the LTP cycle: ",
    },
    {
      t: "pill",
      text: "learn it, teach it, practice it",
      expansion: teachingReveals["learn it, teach it, practice it"],
    },
    {
      t: "text",
      text: ", where students' participation is tested across these three modalities of learning, reinforcing a learning model in which their projects never end with a submission. It should travel into portfolios, exhibitions, communities, and public conversations.",
    },
  ],
  [
    { t: "text", text: "Their " },
    { t: "action", kind: "students", text: "projects" },
    {
      t: "text",
      text: " move from ideas into systems, translating research into artifacts, services, and speculative futures. Many of my students have gone on to Google, Apple, and top design firms, entered graduate programs at leading universities, and shown work in ",
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
 