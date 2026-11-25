// Build / Playground types — runtime data from Sanity (buildFromSanity.ts).

export type BuildToken =
  | { t: "text"; text: string }
  | { t: "proj"; id: string; text: string };

/** Popup section titles. Fas edits them once on the Build page in Studio
 *  ("Popup section titles", Nov 20: "Am I able to update the titles, or do
 *  those require code?"); an empty Studio field falls back to these. */
export const BUILD_SECTION_TITLE_DEFAULTS = {
  trigger: "Trigger",
  observation: "Observation",
  hypothesis: "Hypothesis",
  value: "Value",
  experiment: "Experiment",
  status: "Status",
  checklist: "Checklist",
  whoFor: "Who it's for",
  howItWorks: "How it works",
  outputVisuals: "Output visuals",
  insights: "Insight grid",
} as const;

export type BuildSectionTitles = Record<keyof typeof BUILD_SECTION_TITLE_DEFAULTS, string>;

export interface BuildCaseStudyDetail {
  titles: BuildSectionTitles;
  statusLabel: string;
  trigger: string;
  observation: string;
  hypothesis: string;
  value?: string;
  experiment: string;
  statusBody: string;
  checklist: { done: boolean; text: string }[];
  whoFor: string;
  howItWorks: string[];
  insights: string[];
}

export interface BuildProject {
  id: string;
  title: string;
  tech: string[];
  span: "sm" | "md" | "lg";
  tint: string;
  lightArt?: boolean;
  images?: string[];
  /** Popup left-panel art (Studio "Popup image (left panel)"); fills the panel
   *  edge to edge. undefined = the card image (images[0]) with the colour /
   *  size below. */
  popupImage?: string;
  outputVisual?: string;
  conceptPreview?: string;
  /** Popup image panel background (CSS colour); undefined = the #133034 teal. */
  panelColor?: string;
  /** Popup image size: "fill" = the card image covers the panel edge to edge;
   *  undefined / "padded" = centred with padding (as before). */
  panelImageFit?: "padded" | "fill";
  kicker: string;
  subtitle: string;
  blurb: string;
  caseStudyDetail?: BuildCaseStudyDetail;
}
