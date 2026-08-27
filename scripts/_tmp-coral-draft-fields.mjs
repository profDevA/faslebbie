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
const q = `*[_id=="drafts.cs-coral-health"][0]{
  sections[]{
    _type,
    _type=="overviewSection"=>{
      duration, team, serviceList, serviceCategoryLabel,
      "sideImage": defined(sideImage.asset), "sideVideo": defined(sideVideo.asset)
    },
    _type=="problemContextSection"=>{
      problemHeading, broughtHeading,
      "problem0": problemBody[0].children[0].text,
      "brought0": broughtBody[0].children[0].text
    },
    _type=="bulletSection"=>{ sectionTitle, items }
  }
}`;

console.log(JSON.stringify(await client.fetch(q), null, 2));
