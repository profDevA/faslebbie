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

const coral = await client.fetch(`*[_id=="cs-coral-health"][0]{
  sections[]{ _type, sectionTitle }
}`);

const all = await client.fetch(`*[_type=="caseStudy" && !(_id in path("drafts.**"))]{
  "slug": slug.current,
  "types": sections[]._type
}`);

const summary = all.map((d) => ({
  slug: d.slug,
  problemContextSection: d.types.includes("problemContextSection"),
  desktopMotionShowcase: d.types.includes("desktopMotionShowcase"),
  motionShowcase: d.types.includes("motionShowcase"),
  legacyProsePair:
    d.types.filter((t) => t === "proseSection").length >= 2 &&
    !d.types.includes("problemContextSection"),
}));

console.log(JSON.stringify({ coral, summary }, null, 2));
