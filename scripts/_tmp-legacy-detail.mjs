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

const docs = await client.fetch(`*[_type=="caseStudy" && !(_id in path("drafts.**"))]{
  "slug": slug.current,
  sections[]{ _type, sectionTitle, problemHeading, reflectionHeading }
}`);

for (const d of docs) {
  const legacy = d.sections.filter((s) =>
    ["proseSection", "bulletSection", "gallerySection", "mediaSection"].includes(s._type),
  );
  if (!legacy.length) continue;
  console.log(
    d.slug,
    legacy.map((s) => `${s._type}${s.sectionTitle ? `:${s.sectionTitle}` : ""}`).join(" | "),
  );
}
