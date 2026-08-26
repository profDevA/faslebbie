// Build / Play Ground page content (Figma 16-2956 → 16-3707). Prototypes,
// ventures, and AI-native systems. Mirrors the About/Leadership token model:
// prose is a stream of tokens where a `proj` token is a red underlined link
// that opens the project modal (which also opens from the ".img" grid).
//
// Listing copy + modal hero fields: collaboration doc via buildProjectDetails.
// Long popup bodies: BUILD_PROJECT_DETAILS in buildProjectDetails.ts.

import { BUILD_PROJECT_COPY } from "./buildProjectDetails";

export type BuildToken =
  | { t: "text"; text: string }
  // Red, underlined project link — opens the paged project modal by `id`.
  | { t: "proj"; id: string; text: string };

export interface BuildProject {
  id: string;
  /** Display title (card caption + modal title + breadcrumb). */
  title: string;
  /** Tech stack chips under the card, e.g. ["Claude", "GPT", "Figma"]. */
  tech: string[];
  /** Card height tier for the masonry rhythm. */
  span: "sm" | "md" | "lg";
  /** Placeholder art tint (until real project imagery is supplied). */
  tint: string;
  /** Whether the placeholder art is light (title/label goes dark). */
  lightArt?: boolean;
  /**
   * Card cover + modal hero (Sanity `images[0]` only).
   */
  images?: string[];
  /** Popup scroll — Output visuals block. */
  outputVisual?: string;
  /** Concept Preview overlay. */
  conceptPreview?: string;
  /** Modal hero kicker, e.g. "Design · 5 Min Read". */
  kicker: string;
  /** Modal hero subtitle. */
  subtitle: string;
  /** Card description (placeholder lorem for now). */
  blurb: string;
  /** Modal body — intro paragraph. */
  description: string;
  /** Modal body — "How it Works" numbered steps. */
  howItWorks: string[];
  /** Modal body — closing note under the steps. */
  note?: string;
  /** Modal body — "Supported tools" chips. */
  supportedTools: string[];
}

const BUILD_LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut.";

// Placeholder modal body (Figma 16-2570 shows this copy for the open card).
const PLACEHOLDER_BODY = {
  description:
    "Prompt Annotations is a Figma plugin that captures your vibe-coding chat transcript and places a structured annotation frame next to your design in the file. It keeps the prompts, AI summary, and full back-and-forth with your design so your whole team has the context behind the work.",
  howItWorks: [
    "Finish your session in Cursor, V0, Bolt, Lovable, or Claude.ai.",
    "Paste or upload your transcript into the plugin.",
    "A structured annotation frame appears next to your design — summary, transcript, timestamp, and source tool included.",
  ],
  note: "An API key for Claude or ChatGPT enables an AI-generated summary of what was built. The plugin works without one.",
  supportedTools: ["Cursor", "V0", "Bolt", "Lovable", "Claude.ai", "Terminal"],
};

export const buildProjects: BuildProject[] = [
  {
    id: "leoney",
    title: "Leoney",
    span: "md",
    tint: "#17322c",
    ...BUILD_PROJECT_COPY.leoney,
    ...PLACEHOLDER_BODY,
  },
  {
    id: "pebble",
    title: "Pebble",
    span: "lg",
    tint: "#c9a892",
    ...BUILD_PROJECT_COPY.pebble,
    ...PLACEHOLDER_BODY,
  },
  {
    id: "gradstudio",
    title: "Gradstudio",
    span: "lg",
    tint: "#eef0ea",
    lightArt: true,
    ...BUILD_PROJECT_COPY.gradstudio,
    ...PLACEHOLDER_BODY,
  },
  {
    id: "rookieball",
    title: "Rookieball",
    span: "md",
    tint: "#9db3c4",
    ...BUILD_PROJECT_COPY.rookieball,
    ...PLACEHOLDER_BODY,
  },
  {
    id: "sensespace-ai",
    title: "SenseSpace AI",
    span: "md",
    tint: "#545064",
    ...BUILD_PROJECT_COPY["sensespace-ai"],
    ...PLACEHOLDER_BODY,
  },
  {
    id: "deepsocal-agent",
    title: "DeepSoCal Agent",
    span: "md",
    tint: "#2f3b4a",
    ...BUILD_PROJECT_COPY["deepsocal-agent"],
    ...PLACEHOLDER_BODY,
  },
  {
    id: "mineral-pulse",
    title: "Mineral Pulse",
    span: "sm",
    tint: "#eef0ea",
    lightArt: true,
    ...BUILD_PROJECT_COPY["mineral-pulse"],
    ...PLACEHOLDER_BODY,
  },
];

// ".txt" prose — collaboration doc Build tab (final copy). Red `proj`
// tokens open the project modal (which also opens from the ".img" grid).
export const buildIntro: BuildToken[][] = [
  [
    {
      t: "text",
      text: "The Playground is a living archive of small experiments: questions, observations, and experiments shaping how I think, and they are still expanding across branding, code, UI, motion, or illustration.",
    },
  ],
  [
    {
      t: "text",
      text: "Where they come from matters more than what they become.",
    },
  ],
  [
    {
      t: "text",
      text: "Necessity is the mother of innovation. Frustration is the father. Everything here started as one or the other, not as a gap in a market I went looking for.",
    },
  ],
  [
    { t: "text", text: "Some of it started at home. " },
    { t: "proj", id: "pebble", text: "Pebble" },
    {
      t: "text",
      text: " came from researching homeschooling for my son. Every tool on the market taught the child. Nothing helped the mom hold the morning together, so Pebble became a shared daily rhythm instead of another curriculum. ",
    },
    { t: "proj", id: "leoney", text: "Leoney" },
    {
      t: "text",
      text: " came from sending remittances to Sierra Leone and wanting that money to become something more durable: reliable access to goods despite a broken shipping infrastructure, and income streams that make remittances a choice instead of the only option. ",
    },
    { t: "proj", id: "rookieball", text: "Rookieball" },
    {
      t: "text",
      text: " came from watching my son play sports and thinking about what his game footage could become if it were captured as data from day one.",
    },
  ],
  [
    { t: "text", text: "Some of it started in the practice. " },
    { t: "proj", id: "gradstudio", text: "Gradstudio" },
    {
      t: "text",
      text: " came from a decade of teaching design students in China each summer and watching them treat my own path as a checklist. SenseSpace AI came from years of watching design teams drown in research data they didn't have time to make sense of. ",
    },
    { t: "proj", id: "deepsocal-agent", text: "DeepSoCal Agent" },
    {
      t: "text",
      text: " came from running client engagements across Southern California and getting tired of rebuilding context from zero every time.",
    },
  ],
  [
    { t: "text", text: "One came from research. " },
    { t: "proj", id: "mineral-pulse", text: "Mineral Pulse" },
    {
      t: "text",
      text: " extends my PhD work into a working prototype, mapping mineral producing nations across Africa so communities and investors can see conditions that are currently hidden.",
    },
  ],
  [
    {
      t: "text",
      text: "Not everything here is finished. Some of it is an idea I am still circling. This page is a thinking record, not a portfolio.",
    },
  ],
];
