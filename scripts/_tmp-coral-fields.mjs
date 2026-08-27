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

const q = `*[_id=="cs-coral-health"][0]{
  sections[]{
    _type, _key,
    _type=="overviewSection"=>{
      sectionTitle,
      "body0": body[0].children[0].text,
      "sideImage": defined(sideImage.asset),
      "sideVideo": defined(sideVideo.asset),
      serviceList, duration, team
    },
    _type=="problemContextSection"=>{
      problemHeading, "problem0": problemBody[0].children[0].text,
      broughtHeading, "brought0": broughtBody[0].children[0].text
    },
    _type=="motionShowcase"=>{
      sectionTitle, intro,
      rows[]{
        _key, device, caption,
        "itemCount": count(items),
        items[]{ _key, mediaType, "video": defined(videoFile.asset), "img": defined(image.asset) }
      }
    },
    _type=="proseSection"=>{ sectionTitle, "body0": body[0].children[0].text },
    _type=="bulletSection"=>{ sectionTitle, items }
  }
}`;

console.log(JSON.stringify(await client.fetch(q), null, 2));
