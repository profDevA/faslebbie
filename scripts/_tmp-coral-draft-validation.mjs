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

for (const id of ["cs-coral-health", "drafts.cs-coral-health"]) {
  const doc = await client.fetch(`*[_id==$id][0]{
    _id,
    sections[]{
      _type,
      _type=="problemContextSection"=>{ appearance, "pb": count(problemBody), "bb": count(broughtBody) },
      _type=="coreExperience"=>{ "hasImage": defined(image.asset) },
      _type=="accordionSection"=>{ variant },
      _type=="desktopMotionShowcase"=>{ ctaUrl, "hasVideo": defined(videoFile.asset) || defined(videoUrl) }
    }
  }`, { id });
  console.log(JSON.stringify(doc, null, 2));
}
