/** Remove legacy orphan keys on highlightReel (body, cta*, video*, items). */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const ORPHANS = ["body", "caption", "ctaLabel", "ctaUrl", "items", "videoFile", "videoUrl"] as const;

type Row = { _id: string; sections: Record<string, unknown>[] };

async function main() {
  const docs = await client.fetch<Row[]>(
    `*[_type == "caseStudy"]{ _id, sections[]{ _type, body, caption, ctaLabel, ctaUrl, items, videoFile, videoUrl } }`,
  );

  let n = 0;
  for (const doc of docs) {
    const i = doc.sections.findIndex((s) => s._type === "highlightReel");
    if (i < 0) continue;

    const sec = doc.sections[i];
    const paths = ORPHANS.filter((k) => k in sec).map((k) => `sections[${i}].${k}`);
    if (!paths.length) continue;

    await client.patch(doc._id).unset(paths).commit();
    console.log(`✓ ${doc._id}: unset ${paths.join(", ")}`);
    n++;
  }

  console.log(`done — ${n} doc(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
