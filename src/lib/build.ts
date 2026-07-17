// Build / Play Ground page content (Figma 16-2956 → 16-3707). Prototypes,
// ventures, and AI-native systems. Mirrors the About/Leadership token model:
// prose is a stream of tokens where a `proj` token is a red underlined link
// that opens the project modal (which also opens from the ".img" grid).
//
// Copy is seeded from Figma where the design has real text (the intro prose,
// Leoney's subtitle, the modal "How it Works" body) and placeholder elsewhere
// until Fas finalizes it. Kept in-code for now (like Leadership) — easy to
// migrate to Sanity later.

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
    tech: ["Claude", "GPT", "Figma"],
    span: "md",
    tint: "#17322c",
    kicker: "Design · 5 Min Read",
    subtitle:
      "A research-to-practice studio bridging post-extractive design frameworks and African mining communities.",
    blurb: BUILD_LOREM,
    ...PLACEHOLDER_BODY,
  },
  {
    id: "pebble",
    title: "Pebble",
    tech: ["Claude", "GPT", "Figma"],
    span: "lg",
    tint: "#c9a892",
    kicker: "Design · 5 Min Read",
    subtitle:
      "A venture exploring how families save, share, and build wealth together.",
    blurb: BUILD_LOREM,
    ...PLACEHOLDER_BODY,
  },
  {
    id: "gradstudio",
    title: "Gradstudio",
    tech: ["Claude", "GPT", "Figma"],
    span: "lg",
    tint: "#eef0ea",
    lightArt: true,
    kicker: "Design · 5 Min Read",
    subtitle:
      "Infrastructure for organizing knowledge, cohorts, and creative practice.",
    blurb: BUILD_LOREM,
    ...PLACEHOLDER_BODY,
  },
  {
    id: "rookieball",
    title: "Rookieball",
    tech: ["Claude", "GPT", "Figma"],
    span: "md",
    tint: "#9db3c4",
    kicker: "Design · 5 Min Read",
    subtitle:
      "An early system for reimagining how young athletes train and compete.",
    blurb: BUILD_LOREM,
    ...PLACEHOLDER_BODY,
  },
  {
    id: "root-diamonds",
    title: "Root Diamonds",
    tech: ["Claude", "GPT", "Figma"],
    span: "sm",
    tint: "#8a8f86",
    kicker: "Design · 5 Min Read",
    subtitle:
      "A prototype tracing provenance and value across extractive supply chains.",
    blurb: BUILD_LOREM,
    ...PLACEHOLDER_BODY,
  },
  {
    id: "deepsocal-agent",
    title: "DeepSoCal Agent",
    tech: ["Claude", "GPT", "Figma"],
    span: "md",
    tint: "#2f3b4a",
    kicker: "Design · 5 Min Read",
    subtitle:
      "An AI-native agent experiment for place-based knowledge and logistics.",
    blurb: BUILD_LOREM,
    ...PLACEHOLDER_BODY,
  },
  {
    id: "mineral-pulse",
    title: "Mineral Pulse",
    tech: ["Claude", "GPT", "Figma"],
    span: "sm",
    tint: "#eef0ea",
    lightArt: true,
    kicker: "Design · 5 Min Read",
    subtitle:
      "A working prototype visualizing mineral flows and market signals.",
    blurb: BUILD_LOREM,
    ...PLACEHOLDER_BODY,
  },
  {
    id: "provify",
    title: "Provify",
    tech: ["Claude", "GPT", "Figma"],
    span: "md",
    tint: "#c98f5a",
    kicker: "Design · 5 Min Read",
    subtitle:
      "A thinking record for proving out consumer-facing AI experiences.",
    blurb: BUILD_LOREM,
    ...PLACEHOLDER_BODY,
  },
  {
    id: "model-affiliate",
    title: "Model Affiliate",
    tech: ["Claude", "GPT", "Figma"],
    span: "lg",
    tint: "#3a2a24",
    kicker: "Design · 5 Min Read",
    subtitle:
      "An OpenAgency experiment in AI-mediated representation and trust.",
    blurb: BUILD_LOREM,
    ...PLACEHOLDER_BODY,
  },
];

// ".txt" prose (Figma 16-3007 / 16-3407). Red `proj` tokens open the modal.
export const buildIntro: BuildToken[][] = [
  [
    {
      t: "text",
      text: "I build prototypes, ventures, and AI-native systems as a way of testing what design can become when ideas move from theory into working tools.",
    },
  ],
  [
    { t: "text", text: "Some of this work lives as venture infrastructure, including " },
    { t: "proj", id: "leoney", text: "Leoney" },
    { t: "text", text: ", " },
    { t: "proj", id: "pebble", text: "Pebble" },
    { t: "text", text: ", " },
    { t: "proj", id: "gradstudio", text: "Gradstudio" },
    { t: "text", text: " and " },
    { t: "proj", id: "rookieball", text: "Rookieball" },
    {
      t: "text",
      text: ". These projects explore how design can organize knowledge, leadership, resources, and post-extractive futures.",
    },
  ],
  [
    { t: "text", text: "Other builds are closer to experiments and working prototypes: " },
    { t: "proj", id: "root-diamonds", text: "Root Diamonds" },
    { t: "text", text: ", " },
    { t: "proj", id: "deepsocal-agent", text: "DeepSoCal Agent" },
    { t: "text", text: ", " },
    { t: "proj", id: "mineral-pulse", text: "Mineral Pulse" },
    { t: "text", text: ", " },
    { t: "proj", id: "model-affiliate", text: "Model Affiliate" },
    { t: "text", text: " and " },
    { t: "proj", id: "provify", text: "Provify" },
    {
      t: "text",
      text: ". They are not traditional portfolio pieces; they are thinking records, technical sketches, and early systems for seeing how ideas behave when they become usable.",
    },
  ],
];
