/**
 * Rename Work `.img` card + case study title: Mosaic → Circle (slug unchanged).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-design-assist-title.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

console.log("patch-design-assist-title starting");

const client = getCliClient({ apiVersion: "2025-01-01" });
const SLUG = "design-assist-ai";
const TITLE = "Circle";

async function main() {
  const docs: { _id: string; title?: string }[] = await client.fetch(
    `*[_type == "caseStudy" && slug.current == $slug]{ _id, title }`,
    { slug: SLUG },
  );

  if (!docs.length) throw new Error(`No caseStudy found for slug ${SLUG}`);

  console.log("before:");
  docs.forEach((d) => console.log(`  ${d._id}: ${d.title ?? "(no title)"}`));

  let tx = client.transaction();
  for (const doc of docs) {
    tx = tx.patch(doc._id, (p) => p.set({ title: TITLE }));
  }
  await tx.commit();

  const after: { _id: string; title?: string }[] = await client.fetch(
    `*[_type == "caseStudy" && slug.current == $slug]{ _id, title }`,
    { slug: SLUG },
  );
  console.log("after:");
  after.forEach((d) => console.log(`  ${d._id}: ${d.title ?? "(no title)"}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
