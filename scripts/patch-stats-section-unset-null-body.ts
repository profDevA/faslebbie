/** Unset statsSection.body where stored as null — breaks Studio portableText input. */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

type Row = { _id: string; sections: { _type: string; body?: unknown }[] };

async function main() {
  const docs = await client.fetch<Row[]>(
    `*[_type == "caseStudy"]{ _id, sections[]{ _type, body } }`,
  );

  let n = 0;
  for (const doc of docs) {
    const i = doc.sections.findIndex((s) => s._type === "statsSection");
    if (i < 0) continue;
    if (doc.sections[i].body !== null) continue;

    await client.patch(doc._id).unset([`sections[${i}].body`]).commit();
    console.log(`✓ unset body on ${doc._id} sections[${i}]`);
    n++;
  }

  console.log(`done — ${n} doc(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
