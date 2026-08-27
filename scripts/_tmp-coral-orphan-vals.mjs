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

const ORPHANS = ["body", "caption", "ctaLabel", "ctaUrl", "items", "sectionTitle", "videoFile", "videoUrl"];

const sections = await client.fetch(`*[_id=="cs-coral-health"][0].sections[]`);
for (const s of sections) {
  const bad = ORPHANS.filter((k) => k in s);
  if (!bad.length) continue;
  const vals = Object.fromEntries(bad.map((k) => [k, s[k]]));
  console.log(s._type, vals);
}
