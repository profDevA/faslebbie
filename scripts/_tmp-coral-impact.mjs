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

const s = await client.fetch(`*[_id=="cs-coral-health"][0].sections[_type=="statsSection"][0]{
  sectionTitle, body, appearance{backgroundColor{hex,alpha}},
  items[]{ _key, value, suffix, label, note }
}`);

console.log(JSON.stringify(s, null, 2));
