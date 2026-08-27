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

const doc = await client.fetch(`{
  "pub": *[_id=="cs-coral-health"][0]{
    sections[]{
      _type, _key,
      _type=="statsSection"=>{ items[]{ _key, value, suffix, label } },
      _type=="accordionSection"=>{ items[]{ _key, title } }
    }
  },
  "draft": *[_id=="drafts.cs-coral-health"][0]{
    sections[]{
      _type,
      _type=="statsSection"=>{ items[]{ _key, value, suffix, label } },
      _type=="accordionSection"=>{ items[]{ _key, title } }
    }
  }
}`);

console.log(JSON.stringify(doc, null, 2));
