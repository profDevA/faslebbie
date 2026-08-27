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

const doc = await client.fetch(`*[_id=="cs-coral-health"][0]{
  sections[]{
    _type, _key, sectionTitle,
    _type=="problemContextSection"=>{
      problemHeading, broughtHeading,
      "problemBodyOk": defined(problemBody) && count(problemBody) > 0,
      "problemBodySample": problemBody[0],
      "broughtBodyOk": defined(broughtBody) && count(broughtBody) > 0,
      "broughtBodySample": broughtBody[0]
    },
    _type=="coreExperience"=>{
      "hasImage": defined(image.asset),
      sectionTitle
    },
    _type=="accordionSection"=>{
      variant,
      "items": items[]{
        _key, title,
        "bodyOk": defined(body) && count(body) > 0,
        "bodySample": body[0]
      }
    },
    _type=="desktopMotionShowcase"=>{
      videoUrl,
      "hasVideoFile": defined(videoFile.asset),
      ctaUrl, ctaLabel
    }
  }
}`);

console.log(JSON.stringify(doc, null, 2));
