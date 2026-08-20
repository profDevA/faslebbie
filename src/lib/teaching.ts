/** Teaching page content model — Sanity is the source of truth (teachingPage). */

export type TeachToken =
  | { t: "text"; text: string }
  | { t: "pill"; text: string; expansion?: string }
  | { t: "term"; text: string }
  | { t: "student"; id: string; text: string }
  | { t: "action"; kind: "students" | "exhibition"; text: string };

export interface StudentProject {
  id: string;
  title: string;
  headline: string;
  description: string;
  span: "sm" | "md" | "lg";
  tint: string;
  lightArt?: boolean;
  images?: string[];
  cover?: string;
}

export interface TeachSection {
  kicker: string;
  paragraphs: TeachToken[][];
  action: { kind: "students" | "exhibition"; text: string };
}

/** Collage placement — one anchor per axis, mirroring the live `.box-N` rules. */
export interface TilePos {
  x: { anchor: "left" | "right"; pct: number };
  y: { anchor: "top" | "center" | "bottom"; pct: number };
}

export interface ExhibitionTile {
  tint: string;
  image?: string;
  label?: string;
  pos: TilePos;
  span: "sm" | "md" | "lg";
}
