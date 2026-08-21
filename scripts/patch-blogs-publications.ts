/**
 * Seed blogsPage.books + blogsPage.journals for the `.words` tab.
 * Patches only those two fields — does not touch posts, media, or images.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-blogs-publications.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { seedBooks, seedJournals } from "./seed/publications-seed";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function toPublicationItems(
  items: { title: string; year: string; href?: string }[],
) {
  return items.map((item) => ({
    _type: "publicationItem" as const,
    _key: key(),
    title: item.title,
    year: item.year,
    ...(item.href ? { href: item.href } : {}),
  }));
}

async function main() {
  const doc = await client.fetch<{
    _id: string;
    books?: unknown[];
    journals?: unknown[];
  } | null>(`*[_type == "blogsPage"][0]{ _id, books, journals }`);

  if (!doc?._id) throw new Error("No blogsPage document");

  const beforeBooks = doc.books?.length ?? 0;
  const beforeJournals = doc.journals?.length ?? 0;
  console.log(`before: ${beforeBooks} books, ${beforeJournals} journals`);

  const books = toPublicationItems(seedBooks);
  const journals = toPublicationItems(seedJournals);

  await client.patch(doc._id).set({ books, journals }).commit();

  console.log(
    `after: ${books.length} books, ${journals.length} journals (posts/media unchanged)`,
  );
  books.forEach((b, i) => console.log(`  book ${i + 1}. ${b.title}`));
  journals.forEach((j, i) => console.log(`  journal ${i + 1}. ${j.title}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
