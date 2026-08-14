/**
 * Repoint the Teaching exhibition collage at the live faslebbie.com `.box-N`
 * positions. Rewrites each tile's placement fields in order and keeps its
 * existing image reference, key, tint and span.
 *
 * A patch rather than a re-seed for the usual reason: migrate-pages.ts
 * rebuilds these tiles from public/teaching/exhibition/, which is not in the
 * working tree, so seeding here would drop all 12 photos.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-exhibition-tiles.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

import { LIVE_EXHIBITION_TILES, tilePosFields } from "./seed/exhibition-live";

const client = getCliClient({ apiVersion: "2025-01-01" });

interface RawTile {
  _key: string;
  _type: string;
  image?: unknown;
  [field: string]: unknown;
}

async function run() {
  const tiles = await client.fetch<RawTile[] | null>(
    `*[_id == "teachingPage"][0].exhibitionTiles`,
  );

  if (!tiles?.length) {
    console.error("No exhibitionTiles on teachingPage — nothing to patch.");
    process.exit(1);
  }

  if (tiles.length !== LIVE_EXHIBITION_TILES.length) {
    console.error(
      `Expected ${LIVE_EXHIBITION_TILES.length} tiles, found ${tiles.length}. Aborting rather than guessing which tile is which.`,
    );
    process.exit(1);
  }

  const withImages = tiles.filter((t) => t.image).length;
  console.log(`Found ${tiles.length} tiles, ${withImages} with images.`);

  const next = tiles.map((tile, i) => {
    // posTop/posLeft/posW are the superseded Figma-canvas fields.
    const { posTop, posLeft, posW, ...keep } = tile;
    void posTop;
    void posLeft;
    void posW;
    return { ...keep, ...tilePosFields(LIVE_EXHIBITION_TILES[i].pos) };
  });

  await client.patch("teachingPage").set({ exhibitionTiles: next }).commit();

  const after = await client.fetch<RawTile[]>(
    `*[_id == "teachingPage"][0].exhibitionTiles`,
  );
  console.log(
    `✓ patched — ${after.length} tiles, ${after.filter((t) => t.image).length} still with images`,
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
