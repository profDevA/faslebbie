/**
 * Evening QA 2026-08-25: `teach` and `monthly` in About bio become ordinary
 * sentence text (drop pill / link marks). Does not rewrite the rest of bio.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-about-plain-tokens.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PLAIN = new Set(["teach", "monthly"]);

type Span = { _key: string; text?: string | null; marks?: string[] | null };
type Block = {
  _key: string;
  children?: Span[];
  markDefs?: { _key: string; _type?: string }[];
};

function markedPlainSpans(bio: Block[]) {
  const hits: { blockKey: string; spanKey: string; text: string; marks: string[] }[] =
    [];
  for (const block of bio) {
    for (const child of block.children ?? []) {
      const text = child.text ?? "";
      if (!PLAIN.has(text)) continue;
      const marks = child.marks ?? [];
      if (marks.length) {
        hits.push({
          blockKey: block._key,
          spanKey: child._key,
          text,
          marks,
        });
      }
    }
  }
  return hits;
}

async function run() {
  const docs = await client.fetch<{ _id: string; bio?: Block[] }[]>(
    `*[_type == "aboutPage"]{ _id, bio[]{ _key, markDefs, children[]{ _key, text, marks } } }`,
  );

  if (!docs.length) {
    console.error("No aboutPage document.");
    process.exit(1);
  }

  for (const doc of docs) {
    const before = markedPlainSpans(doc.bio ?? []);
    console.log(`${doc._id}: marked teach/monthly before = ${before.length}`);
    for (const h of before) {
      console.log(`  ${JSON.stringify(h.text)} marks=${JSON.stringify(h.marks)}`);
    }
    if (!before.length) continue;

    let patch = client.patch(doc._id);
    for (const h of before) {
      patch = patch.set({
        [`bio[_key=="${h.blockKey}"].children[_key=="${h.spanKey}"].marks`]: [],
      });
    }
    await patch.commit();

    const afterDoc = await client.fetch<Block[] | null>(
      `*[_id == $id][0].bio[]{ _key, children[]{ _key, text, marks } }`,
      { id: doc._id },
    );
    const after = markedPlainSpans(afterDoc ?? []);
    console.log(`${doc._id}: marked teach/monthly after = ${after.length}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
