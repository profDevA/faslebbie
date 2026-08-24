/** Words tab rows — collab doc SITE FINAL COPY (5); layout Figma 3315:4124. */

export interface SeedPublication {
  title: string;
  year: string;
  tag?: string;
  href?: string;
}

export const seedCurrentProjects: SeedPublication[] = [
  {
    title: "Root Foundation, Co-Design System & Makers' Space",
    tag: "Initiative",
    year: "2024",
  },
  {
    title: "Transition Design, African Mineral Pulse",
    tag: "Panel · Carnegie Mellon University",
    year: "2025",
  },
  {
    title: "AI As Raw Materials for Design",
    tag: "Conference · Design Research Society",
    year: "2025",
  },
  {
    title: "Selecting Diamond Rough, A Guide for Artisanal Miners",
    tag: "Partnership · Pact + GIA",
    year: "2025",
  },
];

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
    tag: "Journal · Transition Design",
    year: "2025",
  },
  {
    title:
      "The Embedded Ally: A Methodological Orientation for Relational Research Engagement",
    tag: "Journal · Codesign",
    year: "2025",
  },
  {
    title:
      "An Archaeological & Visual Narrative of Extractive, Pre-Extractive and Post-Extractive Worldviews",
    tag: "Journal · Historical Analysis",
    year: "2025",
  },
  {
    title:
      "Scalar Framework: A Multi-Level Leadership Tool Towards Design Excellence & Transitions",
    tag: "Journal · Design Leadership",
    year: "2024",
  },
  {
    title: "Peace, Hope, and Prosperity through Diamond Cutting",
    tag: "Publication · Vol. 32S",
    year: "2023",
  },
  {
    title:
      "Modeling Sustainability and Equity: Artisanal Mining New Realities, Future Possibilities for Sustainable Development",
    tag: "Article",
    year: "2023",
  },
  {
    title:
      "Storied Ontologies: The Power of Storytelling to Shape Culture, Marketplace, and Consumer Behavior",
    tag: "Article",
    year: "2022",
  },
  {
    title: "Creating Climate Justice",
    tag: "Publication · Parsons School of Design",
    year: "2022",
  },
  {
    title: "Equitable Capitalism",
    tag: "Publication · Parsons Transdisciplinary Design",
    year: "2022",
  },
];
