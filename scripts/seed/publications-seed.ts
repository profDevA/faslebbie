/** Books + journals for Words tab — from live faslebbie.com / Figma 2729:2736. */

/** Mirrors the `publicationItem` schema, where `href` is optional. */
export interface SeedPublication {
  title: string;
  year: string;
  href?: string;
}

export const seedBooks: SeedPublication[] = [
  { title: "Souvenirs of my Awakening, Memoir", year: "2020" },
  {
    title: "Mineral Choreography: Extraction Sites Vol 1",
    year: "Forthcoming",
  },
];

export const seedJournals: SeedPublication[] = [
  {
    title: "Mineral Choreography: A Post-Extractive Design For Transition",
    year: "2025",
  },
  {
    title:
      "The Embedded Ally: A Methodological Orientation for Relational Research Engagement CoDesign",
    year: "2025",
  },
  {
    title:
      "An Archaeological & Visual Narrative of Extractive, Pre-Extractive and Post-Extractive Worldviews",
    year: "2025",
  },
  {
    title:
      "Scalar Framework: A Multi-Level Leadership Tool Towards Design Excellence & Transitions",
    year: "2024",
  },
  {
    title:
      "Peace, Hope, and Prosperity through Diamond Cutting, Summer 2023 Volume 32S",
    year: "2023",
  },
  {
    title:
      "Modeling Sustainability and Equity: Artisanal Mining New Realities, Future Possibilities for Sustainable Development",
    year: "—",
  },
  {
    title:
      "Storied Ontologies: The Power of Storytelling to Shape Culture, Marketplace, and Consumer Behavior",
    year: "2022",
  },
  {
    title:
      "Creating Climate Justice, Parsons School of Design (Sustainability & Equity, re: D)",
    year: "2022",
  },
  { title: "Equitable Capitalism, Parsons Transdisciplinary Design", year: "2022" },
  { title: "A Journey of Self Decolonization", year: "2022" },
  {
    title: "How Transdisciplinary Design Liberated Me to be a Better Entrepreneur",
    year: "2022",
  },
  { title: "Why I Remain Hopeful amid Racial Violence in 2020", year: "2020" },
  {
    title: "Racial Injustice 2.0: Race and Design in the Age of Algorithms",
    year: "2020",
  },
];
