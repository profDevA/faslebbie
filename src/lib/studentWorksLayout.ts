import type { StudentProject } from "@/lib/teaching";

/** Figma 2930:212170 collapsed set. */
export const INITIAL_STUDENT_COUNT = 14;

/**
 * Figma crop boxes (width × height) from 2930:212170 / 3105:5780.
 * Applied as aspect-ratio so cards stay staggered at any column width.
 */
export const STUDENT_COVER_BOX: Record<string, { w: number; h: number }> = {
  "new-transport": { w: 332, h: 341 },
  "the-little-home": { w: 332, h: 409 },
  "welcome-to-walkatopia": { w: 332, h: 266 },
  phoneless: { w: 333, h: 313 },
  emobox: { w: 325, h: 407 },
  "solace-aid": { w: 333, h: 313 },
  ephemeral: { w: 330, h: 403 },
  "compare-n-go": { w: 330, h: 329 },
  origin: { w: 330, h: 447 },
  zeno: { w: 326, h: 320 },
  reallity: { w: 330, h: 447 },
  "trash-to-treasure": { w: 326, h: 348 },
  "pads-tampons-cups": { w: 326, h: 367 },
  ecolivery: { w: 326, h: 299 },
  nudge: { w: 326, h: 320 },
  pattle: { w: 326, h: 320 },
  rhyzone: { w: 326, h: 320 },
  "honey-honey": { w: 325, h: 398 },
  uum: { w: 325, h: 338 },
  "spinning-out": { w: 325, h: 453 },
  "tremors-x": { w: 326, h: 320 },
  feelnodes: { w: 325, h: 453 },
};

/** Column-major order from Figma. First 14 are the collapsed set. */
export const STUDENT_WORK_COLUMNS: string[][] = [
  [
    "new-transport",
    "the-little-home",
    "welcome-to-walkatopia",
    "phoneless",
    "emobox",
    "solace-aid",
  ],
  ["ephemeral", "compare-n-go", "origin", "zeno", "reallity"],
  [
    "trash-to-treasure",
    "pads-tampons-cups",
    "ecolivery",
    "nudge",
    "pattle",
    "rhyzone",
  ],
  ["honey-honey", "uum", "spinning-out", "tremors-x", "feelnodes"],
];

const INITIAL_IDS = new Set([
  "new-transport",
  "the-little-home",
  "welcome-to-walkatopia",
  "phoneless",
  "ephemeral",
  "compare-n-go",
  "origin",
  "trash-to-treasure",
  "pads-tampons-cups",
  "ecolivery",
  "nudge",
  "honey-honey",
  "uum",
  "spinning-out",
]);

/** Expanded-set ids (Figma 3105:5780) — open with ?all=1 on the works grid. */
export const EXTRA_STUDENT_IDS = new Set([
  "emobox",
  "solace-aid",
  "zeno",
  "reallity",
  "pattle",
  "rhyzone",
  "tremors-x",
  "feelnodes",
]);

export function studentWorkColumns(
  students: StudentProject[],
  expanded: boolean,
): StudentProject[][] {
  const byId = new Map(students.map((s) => [s.id, s]));
  return STUDENT_WORK_COLUMNS.map((ids) =>
    ids
      .filter((id) => expanded || INITIAL_IDS.has(id))
      .map((id) => byId.get(id))
      .filter((s): s is StudentProject => Boolean(s)),
  );
}
