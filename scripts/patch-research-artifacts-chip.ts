/**
 * Figma 3393:3429 — one inline book thumb after
 * "The work produced a set of artifacts:" (before paradigms). Not after Carnegie Mellon.
 * Image: Figma 3550:2781 (Mineral Choreography).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-research-artifacts-chip.ts --with-user-token
 *
 * Expects tmp/research-covers/mineral-choreography-book.png
 */
import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

const NEEDLE = "The work produced a set of artifacts:";
const ALT = "Mineral Choreography book cover";
const BOOK_FILE = join(
  process.cwd(),
  "tmp",
  "research-covers",
  "mineral-choreography-book.png",
);

type Child = {
  _type?: string;
  _key?: string;
  text?: string;
  marks?: string[];
  alt?: string;
  image?: unknown;
};

type Block = { children?: Child[]; [k: string]: unknown };

function stripPhotos(body: Block[]) {
  let removed = 0;
  for (const block of body) {
    block.children = (block.children ?? []).filter((child) => {
      if (child._type === "aboutPhoto") {
        removed += 1;
        return false;
      }
      return true;
    });
  }
  return removed;
}

function insertAfterNeedle(body: Block[], needle: string, photo: Child): boolean {
  for (const block of body) {
    const children = block.children;
    if (!children) continue;
    for (let i = 0; i < children.length; i++) {
      const text = children[i].text ?? "";
      const at = text.indexOf(needle);
      if (at === -1) continue;
      const before = text.slice(0, at + needle.length);
      const after = text.slice(at + needle.length);
      const next = [...children];
      next[i] = { ...children[i], text: before };
      const insert: Child[] = [{ ...photo, _key: key() }];
      if (after) {
        insert.push({ ...children[i], _key: key(), text: after });
      }
      next.splice(i + 1, 0, ...insert);
      block.children = next;
      return true;
    }
  }
  return false;
}

async function main() {
  let image: unknown;
  if (existsSync(BOOK_FILE)) {
    const asset = await client.assets.upload(
      "image",
      createReadStream(BOOK_FILE),
      {
        filename: "research-artifacts-inline-book.png",
        contentType: "image/png",
      },
    );
    console.log(`  ↑ mineral-choreography-book.png → ${asset._id}`);
    image = {
      _type: "image" as const,
      asset: { _type: "reference" as const, _ref: asset._id },
    };
  } else {
    const ref = await client.fetch<{ image?: unknown } | null>(
      `*[_id == "researchPage"][0]{ "image": paradigms.image }`,
    );
    if (!ref?.image) throw new Error(`Missing ${BOOK_FILE} and no paradigms.image fallback`);
    image = ref.image;
    console.log("  · reusing paradigms.image asset");
  }

  const doc = await client.fetch<{
    areas?: { kicker?: string; body?: Block[] }[];
  } | null>(`*[_id == "researchPage"][0]{ areas }`);

  if (!doc?.areas?.length) throw new Error("researchPage areas missing");

  const areas = structuredClone(doc.areas);
  const body = areas[0]?.body ?? [];
  const removed = stripPhotos(body);

  const ok = insertAfterNeedle(body, NEEDLE, {
    _type: "aboutPhoto",
    alt: ALT,
    image,
  });
  if (!ok) throw new Error(`Could not find “${NEEDLE}”`);

  areas[0] = { ...areas[0], body };
  await client.patch("researchPage").set({ areas }).commit();
  console.log(
    `✓ artifacts inline book — removed ${removed} stray chip(s), inserted 1 after artifacts sentence`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
