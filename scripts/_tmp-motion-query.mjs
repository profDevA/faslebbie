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

const img = `{ crop, hotspot, asset->{ _id, url, metadata { dimensions } } }`;
const q = `*[_type == "caseStudy" && slug.current == "coral-health" && !(_id in path("drafts.**"))][0]{
  sections[_type=="motionShowcase"][0]{
    sectionTitle, appearance,
    rows[]{
      _key, device, caption,
      items[]{ _key, mediaType, videoUrl, "videoFile": videoFile.asset->url, "image": image${img} }
    }
  }
}`;

console.log(JSON.stringify(await client.fetch(q), null, 2));
