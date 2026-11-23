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

/**
 * Phones: two columns that end level (mobile QA M16, Nov 23 — desktop columns
 * 1+3 / 2+4 left the right one ~1½ cards short). Cards keep desktop reading
 * order (row by row across the four columns); each goes left or right so the
 * column heights come out as equal as possible, order kept within a column.
 */
export function studentWorkMobileColumns(
  columns: StudentProject[][],
): StudentProject[][] {
  const order: StudentProject[] = [];
  const rows = Math.max(0, ...columns.map((c) => c.length));
  for (let r = 0; r < rows; r++) for (const c of columns) if (c[r]) order.push(c[r]);
  // Card height in hundredths of a column width: cover box, then the title
  // (~22 characters a line at 14px) and the gap to the next card.
  const h = order.map((s) => {
    const box = STUDENT_COVER_BOX[s.id];
    const lines = Math.max(1, Math.ceil(s.title.length / 22));
    return Math.round(((box ? box.h / box.w : 1) + 0.27 + 0.12 * lines) * 100);
  });
  const total = h.reduce((a, b) => a + b, 0);
  const can: Uint8Array[] = [new Uint8Array(total + 1)];
  can[0][0] = 1;
  h.forEach((hi, i) => {
    const next = can[i].slice();
    for (let s = 0; s + hi <= total; s++) if (can[i][s]) next[s + hi] = 1;
    can.push(next);
  });
  let best = 0;
  for (let s = 0; s <= total; s++)
    if (can[h.length][s] && Math.abs(total - 2 * s) < Math.abs(total - 2 * best)) best = s;
  const left = new Set<number>();
  for (let i = h.length, s = best; i > 0; i--)
    if (!can[i - 1][s]) {
      left.add(i - 1);
      s -= h[i - 1];
    }
  const firstLeft = left.has(0); // the first card stays top left
  return [
    order.filter((_, i) => left.has(i) === firstLeft),
    order.filter((_, i) => left.has(i) !== firstLeft),
  ];
}

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
