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

const s = await client.fetch(
  `*[_id=="cs-coral-health"][0].sections[_type=="statsSection"][0]`,
);
console.log(JSON.stringify(s, null, 2));
console.log("has body key:", Object.prototype.hasOwnProperty.call(s, "body"));
