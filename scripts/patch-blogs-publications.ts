/**
 * Seed blogsPage Words tab: currentProjects, books, journals (Figma 3315:4124).
 * Patches published AND draft. Does not touch posts/media.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-blogs-publications.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import {
  seedBooks,
  seedCurrentProjects,
  seedJournals,
  type SeedPublication,
} from "./seed/publications-seed";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PUBLISHED_ID = "blogsPage";
const DRAFT_ID = `drafts.${PUBLISHED_ID}`;
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function toPublicationItems(items: SeedPublication[]) {
  return items.map((item) => ({
    _type: "publicationItem" as const,
    _key: key(),
    title: item.title,
    year: item.year,
    ...(item.tag ? { tag: item.tag } : {}),
    ...(item.href ? { href: item.href } : {}),
  }));
}

async function main() {
  const published = await client.fetch<{
    _id: string;
    currentProjects?: unknown[];
    books?: unknown[];
    journals?: unknown[];
  } | null>(
    `*[_type == "blogsPage" && _id == $id][0]{ _id, currentProjects, books, journals }`,
    { id: PUBLISHED_ID },
  );
  if (!published?._id) throw new Error("No published blogsPage document");

  const draft = await client.getDocument(DRAFT_ID);

  console.log(
    `before published: ${published.currentProjects?.length ?? 0} projects, ${published.books?.length ?? 0} books, ${published.journals?.length ?? 0} journals`,
  );
  if (draft) {
    console.log(
      `before draft: ${(draft.currentProjects as unknown[] | undefined)?.length ?? 0} projects, ${(draft.books as unknown[] | undefined)?.length ?? 0} books, ${(draft.journals as unknown[] | undefined)?.length ?? 0} journals`,
    );
  }

  const currentProjects = toPublicationItems(seedCurrentProjects);
  const books = toPublicationItems(seedBooks);
  const journals = toPublicationItems(seedJournals);
  const set = { currentProjects, books, journals };

  for (const id of draft ? [PUBLISHED_ID, DRAFT_ID] : [PUBLISHED_ID]) {
    await client.patch(id).set(set).commit();
    console.log(`✓ patched ${id}`);
  }

  console.log(
    `after: ${currentProjects.length} projects, ${books.length} books, ${journals.length} journals${draft ? " (published + draft)" : ""}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
