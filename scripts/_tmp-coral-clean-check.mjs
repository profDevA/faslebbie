import { config } from "dotenv";
import { createClient } from "@sanity/client";

config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-01-01",
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
});

const LEGACY = new Set(["proseSection", "bulletSection", "mediaSection", "gallerySection"]);

for (const id of ["cs-coral-health", "drafts.cs-coral-health"]) {
  const doc = await client.fetch(
    `*[_id == $id][0]{
      _id,
      "slug": slug.current,
      sections[]{ _key, _type, sectionTitle, problemHeading, reflectionHeading }
    }`,
    { id },
  );
  if (!doc) {
    console.log(`${id}: not found\n`);
    continue;
  }

  console.log(`=== ${doc._id} (${doc.slug}) ===`);
  doc.sections.forEach((s, i) => {
    const tag = LEGACY.has(s._type) ? " ⚠ LEGACY" : "";
    const title =
      s.sectionTitle || s.problemHeading || s.reflectionHeading || "";
    console.log(`  ${i + 1}. ${s._type}${title ? ` — ${title}` : ""}${tag}`);
  });

  const legacy = doc.sections.filter((s) => LEGACY.has(s._type));
  console.log(
    legacy.length
      ? `\n  LEGACY COUNT: ${legacy.length} → ${legacy.map((s) => s._type).join(", ")}\n`
      : "\n  No legacy section types.\n",
  );
}
