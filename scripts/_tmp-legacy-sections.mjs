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

const LEGACY = [
  "proseSection",
  "bulletSection",
  "gallerySection",
  "mediaSection",
];

const docs = await client.fetch(`*[_type=="caseStudy" && !(_id in path("drafts.**"))]{
  _id,
  "slug": slug.current,
  "types": sections[]._type
}`);

const counts = Object.fromEntries(LEGACY.map((t) => [t, []]));
for (const d of docs) {
  for (const t of LEGACY) {
    if (d.types.includes(t)) counts[t].push(d.slug);
  }
}

console.log("Legacy section usage (published case studies):\n");
for (const [t, slugs] of Object.entries(counts)) {
  console.log(`${t}: ${slugs.length} studies`);
  if (slugs.length) console.log(`  ${slugs.join(", ")}\n`);
}

const coral = docs.find((d) => d.slug === "coral-health");
console.log("Coral section types:", coral?.types.join(" → "));
