// Build / Playground types — runtime data from Sanity (buildFromSanity.ts).

export type BuildToken =
  | { t: "text"; text: string }
  | { t: "proj"; id: string; text: string };

export interface BuildCaseStudyDetail {
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
  outputVisual?: string;
  conceptPreview?: string;
  kicker: string;
  subtitle: string;
  blurb: string;
  caseStudyDetail?: BuildCaseStudyDetail;
}
