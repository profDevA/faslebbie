import type { TilePos } from "../../src/lib/teaching";

/**
 * Live faslebbie.com SFK exhibition collage — the twelve `.box-N` rules from
 * docs/reference/live-exhibition.html, in the page's own image order. The
 * bottom row anchors from the bottom and the middle row centres on its Y, so
 * the scatter fills the band whatever height each photo renders at.
 */
export const LIVE_EXHIBITION_TILES: { file: number; pos: TilePos }[] = [
  { file: 9, pos: { x: { anchor: "left", pct: 1 }, y: { anchor: "top", pct: 10 } } },
  { file: 1, pos: { x: { anchor: "left", pct: 30 }, y: { anchor: "top", pct: 2 } } },
  { file: 2, pos: { x: { anchor: "left", pct: 53 }, y: { anchor: "top", pct: 2 } } },
  { file: 3, pos: { x: { anchor: "right", pct: 5 }, y: { anchor: "top", pct: 2 } } },
  { file: 4, pos: { x: { anchor: "left", pct: 3 }, y: { anchor: "center", pct: 48 } } },
  { file: 11, pos: { x: { anchor: "left", pct: 20 }, y: { anchor: "center", pct: 55 } } },
  { file: 10, pos: { x: { anchor: "right", pct: 20 }, y: { anchor: "center", pct: 60 } } },
  { file: 5, pos: { x: { anchor: "right", pct: 5 }, y: { anchor: "center", pct: 40 } } },
  { file: 6, pos: { x: { anchor: "left", pct: 4 }, y: { anchor: "bottom", pct: 2 } } },
  { file: 12, pos: { x: { anchor: "left", pct: 30 }, y: { anchor: "bottom", pct: 2 } } },
  { file: 7, pos: { x: { anchor: "right", pct: 32 }, y: { anchor: "bottom", pct: 2 } } },
  { file: 8, pos: { x: { anchor: "right", pct: 7 }, y: { anchor: "bottom", pct: 2 } } },
];

/** Flatten a TilePos into the exhibitionTile document fields. */
export function tilePosFields(pos: TilePos) {
  return {
    posX: pos.x.pct,
    posXAnchor: pos.x.anchor,
    posY: pos.y.pct,
    posYAnchor: pos.y.anchor,
  };
}
