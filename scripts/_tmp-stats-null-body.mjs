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

const rows = await client.fetch(`*[_type=="caseStudy"]{
  _id,
  "slug": slug.current,
  "statsIdx": sections[_type=="statsSection"][0]._key,
  "body": sections[_type=="statsSection"][0].body
}`);

for (const r of rows) {
  if (r.statsIdx == null) continue;
  const t = r.body === null ? "null" : r.body === undefined ? "missing" : Array.isArray(r.body) ? `array(${r.body.length})` : typeof r.body;
  if (t === "null") console.log(r._id, r.slug, t);
}
