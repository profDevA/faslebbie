/**
 * QA Aug 18 comment `g`: drop the trailing " →" after the in-bio
 * "what people are saying" popup trigger. Popup triggers are red underline,
 * not arrows (Figma component system 823:70182).
 *
 * Targeted patch of that one span — does not rewrite bio, expansions, or links.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-about-drop-testimonial-arrow.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

type Span = { _key: string; text?: string | null };
type Block = { _key: string; children?: Span[] };

async function run() {
  const doc = await client.fetch<{ bio?: Block[] } | null>(
    `*[_id == "aboutPage"][0]{ bio[]{ _key, children[]{ _key, text } } }`,
  );

  if (!doc?.bio) {
    console.error("aboutPage.bio not found.");
    process.exit(1);
  }

  let blockKey: string | null = null;
  let spanKey: string | null = null;
  let before = "";

  for (const block of doc.bio) {
    const hasTrigger = block.children?.some(
      (s) => s.text === "what people are saying",
    );
    const arrow = block.children?.find((s) => (s.text ?? "").trim() === "→");
    if (hasTrigger && arrow) {
      blockKey = block._key;
      spanKey = arrow._key;
      before = arrow.text ?? "";
      break;
    }
  }

  if (!blockKey || !spanKey) {
    console.log("No trailing → after “what people are saying” — nothing to patch.");
    return;
  }

  console.log(`Before: ${JSON.stringify(before)} (bio[_key==${blockKey}].children[_key==${spanKey}])`);

  await client
    .patch("aboutPage")
    .set({ [`bio[_key=="${blockKey}"].children[_key=="${spanKey}"].text`]: "." })
    .commit();

  const after = await client.fetch<string | null>(
    `*[_id == "aboutPage"][0]{ "text": bio[_key==$bk].children[_key==$sk][0].text }`,
    { bk: blockKey, sk: spanKey },
  );

  console.log(`After:  ${JSON.stringify(after)}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
