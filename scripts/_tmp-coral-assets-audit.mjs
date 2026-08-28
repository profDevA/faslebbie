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

const doc = await client.fetch(
  `*[_type=="caseStudy" && slug.current=="coral-health" && !(_id in path("drafts.**"))][0]{
    "corePopupBody": length(string(sections[_type=="coreExperience"][0].popupBody)),
    "corePopupTabImages": sections[_type=="coreExperience"][0].popupTabs[]{ label, "n": count(items) },
    "motionRows": sections[_type=="motionShowcase"][0].rows[]{
      title,
      "hasVideo": defined(videoFile.asset) || defined(videoUrl),
      "hasPoster": defined(posterImage.asset),
      "hasImage": defined(image.asset)
    },
    "highlightCells": sections[_type=="highlightReel"][0].cells[]{
      caption,
      "frames": count(frames),
      "hasFrameImg": count(frames[defined(asset)])
    },
    "showcaseItems": sections[_type=="showcaseGallery"][0].items[]{
      title,
      "hasImg": defined(image.asset)
    },
    "reflectionNext": count(sections[_type=="reflectionSection"][0].nextStepsItems)
  }`,
);

console.log(JSON.stringify(doc, null, 2));
