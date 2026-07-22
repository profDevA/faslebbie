// Blogs & Media content model (Figma 318-5704 / 308-4566 + modals 16-570 /
// 504-16389). Two tabs: ".blog" (a centered list of writing, grouped by column)
// and ".media" (a grid of talks / podcasts / interviews). Both open a paged
// modal. This in-code data is the fallback used when the Sanity `blogsPage`
// singleton (or a field) is empty — see lib/blogsFromSanity.ts.

// A block in the full article body rendered inside the (scrollable) modal.
// For `img`, `text` holds the image src (a /blog/… path or a Sanity URL).
export type BlogBlock = {
  kind: "h2" | "h3" | "p" | "li" | "img";
  text: string;
};

export type BlogPost = {
  slug: string;
  category: string; // grouping column, e.g. "Design Muscle"
  meta: string; // small line above the title, e.g. "Design · 5 min read"
  title: string;
  // Modal (cover slide + maroon caption panel):
  kicker: string; // e.g. "Design · 5 Min Read"
  description: string;
  body?: BlogBlock[]; // full article, shown below the hero (scrolls)
  url?: string; // optional "Read blog" link to the full article
  cover?: string; // optional cover image URL (else a themed placeholder)
  coverBg: string; // placeholder cover background
  panelBg: string; // caption panel background
  panelText: string; // caption panel text color
};

export type MediaItem = {
  slug: string;
  format: string; // "Podcast" | "Talk" | "Interview" | "Panel"
  title: string;
  platform: string; // "Spotify", "MIT Media Lab", …
  year: string;
  thumb?: string; // optional card/preview thumbnail
  video?: string; // optional embed URL (else a black play placeholder)
  // Modal detail panel:
  source: string; // "The Design Leadership Podcast"
  detail: string; // "Spotify • Episode 32 • 2024"
  description: string;
  themes: string[]; // ["Design Systems", "Infrastructure", "Leadership"]
};

// Plural breadcrumb segment for a media format ("Podcast" → "Podcasts").
export function mediaCategory(format: string): string {
  const map: Record<string, string> = {
    Podcast: "Podcasts",
    Talk: "Talks",
    Interview: "Interviews",
    Panel: "Panels",
  };
  return map[format] ?? `${format}s`;
}

import { blogBodies } from "./blogBodies";

const MAROON = "#3a1618";
const SALMON = "#e8917b";

export const blogPosts: BlogPost[] = [
  {
    slug: "design-pulse-org-design-health-monitor",
    category: "Design Muscle",
    meta: "Design, Extractives · 5 min read",
    title: "Design Pulse: Org Design Health Monitor",
    kicker: "Design, Extractives · 5 Min Read",
    description:
      "How systematic diagnosis of design team capabilities across five organizational levels can become a management tool for navigating shifting priorities.",
    body: blogBodies["design-pulse-org-design-health-monitor"],
    url: "https://faslebbie.com/design-pulse-a-framework-for-reading-organizational-design-health-in-real-time/",
    cover: "/blog/design-pulse-org-design-health-monitor/cover.png",
    coverBg: "#eaa31e",
    panelBg: MAROON,
    panelText: SALMON,
  },
  {
    slug: "tetrahedral-model",
    category: "Design Muscle",
    meta: "Design · 7 min read",
    title: "Tetrahedral Model: Building Stronger Ties in Product Teams",
    kicker: "Design · 7 Min Read",
    description: "A systems model for cross-disciplinary coordination.",
    body: blogBodies["tetrahedral-model"],
    url: "https://faslebbie.com/the-tetrahedral-product-organization/",
    cover: "/blog/tetrahedral-model/cover.png",
    coverBg: "#2f6f6a",
    panelBg: "#12302e",
    panelText: "#8fd0c8",
  },
  {
    slug: "design-handbook-that-works",
    category: "Design Muscle",
    meta: "Design · 5 min read",
    title: "Building a Design Handbook That Actually Works",
    kicker: "Design · 5 Min Read",
    description:
      "Why your brilliant ideas from your last company might be sabotaging your new team — and what I've learned about doing it differently.",
    body: blogBodies["design-handbook-that-works"],
    url: "https://faslebbie.com/building-a-design-handbook-that-works/",
    cover: "/blog/design-handbook-that-works/cover.jpg",
    coverBg: "#6b4bb0",
    panelBg: "#241540",
    panelText: "#c3add6",
  },
  {
    slug: "trust-through-five-expectations",
    category: "Design Muscle",
    meta: "Design · 4 min read",
    title: "Building Trust Through Five Clear Expectations",
    kicker: "Design · 4 Min Read",
    description:
      "How to build trust and clarity with your team across all levels of design work.",
    body: blogBodies["trust-through-five-expectations"],
    url: "https://faslebbie.com/setting-clear-expectations-a-design-leaders-framework/",
    cover: "/blog/trust-through-five-expectations/cover.jpg",
    coverBg: "#c9532e",
    panelBg: "#3a1710",
    panelText: "#f0a98a",
  },
  {
    slug: "commitments-to-a-design-team",
    category: "Design Muscle",
    meta: "Design · 5 min read",
    title: "My Commitments to a Design Team",
    kicker: "Design · 5 Min Read",
    description:
      "How systematic leadership across five organizational levels creates conditions for teams to thrive, from individual wellbeing to company-wide influence.",
    body: blogBodies["commitments-to-a-design-team"],
    url: "https://faslebbie.com/my-five-commitments-to-a-team-2/",
    cover: "/blog/commitments-to-a-design-team/cover.png",
    coverBg: "#1f5f8b",
    panelBg: "#0f2a3d",
    panelText: "#9fc6de",
  },
];

export const mediaItems: MediaItem[] = [
  {
    slug: "design-systems-in-practice",
    format: "Podcast",
    title: "Design Systems In Practice",
    platform: "Spotify",
    year: "2024",
    source: "The Design Leadership Podcast",
    detail: "Spotify • Episode 32 • 2024",
    description:
      "A conversation on building design systems that scale across products and teams. We explore practical approaches, organizational dynamics, and the infrastructure that makes systems work.",
    themes: ["Design Systems", "Infrastructure", "Leadership"],
  },
  {
    slug: "designing-ai-infrastructure",
    format: "Podcast",
    title: "Designing AI Infrastructure",
    platform: "Apple Podcasts",
    year: "2025",
    source: "The Design Leadership Podcast",
    detail: "Apple Podcasts • Episode 41 • 2025",
    description:
      "What it means to design for AI systems as infrastructure — the interfaces, guardrails, and human trust that determine whether the technology is actually usable.",
    themes: ["AI", "Infrastructure", "Design"],
  },
  {
    slug: "the-practice-of-leadership",
    format: "Podcast",
    title: "The Practice Of Leadership",
    platform: "YouTube",
    year: "2024",
    source: "Design Leadership Series",
    detail: "YouTube • 2024",
    description:
      "Leadership treated as a practice rather than a title — the daily habits, decisions, and repair work that build a healthy, high-output design organization.",
    themes: ["Leadership", "Teams", "Practice"],
  },
  {
    slug: "design-leadership-in-complex-systems",
    format: "Talk",
    title: "Design Leadership In Complex Systems",
    platform: "Google Design Conference",
    year: "2025",
    source: "Google Design Conference",
    detail: "Google Design Conference • 2025",
    description:
      "A talk on leading design where the system is bigger than any one team — aligning intent, navigating ambiguity, and keeping craft alive at scale.",
    themes: ["Systems", "Leadership", "Scale"],
  },
  {
    slug: "post-extractive-futures",
    format: "Panel",
    title: "Post-Extractive Futures",
    platform: "The New School",
    year: "2023",
    source: "The New School",
    detail: "The New School • 2023",
    description:
      "A panel on what comes after extraction — design's role in imagining and building futures that are regenerative rather than depleting.",
    themes: ["Extractives", "Futures", "Design"],
  },
  {
    slug: "ai-infrastructure-and-society",
    format: "Talk",
    title: "AI Infrastructure & Society",
    platform: "MIT Media Lab",
    year: "2024",
    source: "MIT Media Lab",
    detail: "MIT Media Lab • 2024",
    description:
      "How the infrastructure choices behind AI shape society — access, accountability, and the design decisions that quietly set the terms.",
    themes: ["AI", "Society", "Infrastructure"],
  },
  {
    slug: "design-leadership-in-transition",
    format: "Interview",
    title: "Design Leadership In Transition",
    platform: "Design Observer",
    year: "2023",
    source: "Design Observer",
    detail: "Design Observer • 2023",
    description:
      "An interview on leading design teams through transition — reorgs, AI shifts, and changing mandates — without losing the people or the craft.",
    themes: ["Leadership", "Transition", "Teams"],
  },
  {
    slug: "systems-thinking-in-practice",
    format: "Interview",
    title: "Systems Thinking In Practice",
    platform: "AIGA",
    year: "2024",
    source: "AIGA",
    detail: "AIGA • 2024",
    description:
      "Putting systems thinking to work in everyday design decisions — seeing the whole, finding the leverage points, and designing the feedback loops.",
    themes: ["Systems", "Practice", "Method"],
  },
];
