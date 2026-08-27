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

const q = `{
  "all": *[_type=="caseStudy"]{ _id, "slug": slug.current, title, "thumb": cardThumbnail.asset->url } | order(_id),
  "missingThumb": *[_type=="caseStudy" && !(_id in path("drafts.**")) && !defined(cardThumbnail.asset)]{ _id, "slug": slug.current },
  "published": *[_type=="caseStudy" && !(_id in path("drafts.**"))]{ _id, "slug": slug.current },
  "coralPublished": *[_type=="caseStudy" && slug.current=="coral-health" && !(_id in path("drafts.**"))][0]{
    _id,
    "heroImage": sections[_type=="heroSection"][0].image.asset->url,
    "highlight": sections[_type=="highlightReel"][0]{ cells[]{ _key, "frames": count(frames) } }
  },
  "coralDraft": *[_type=="caseStudy" && _id=="drafts.cs-coral-health"][0]{
    _id, "sectionCount": count(sections),
    "heroImage": sections[_type=="heroSection"][0].image.asset->url,
    "motionRows": count(sections[_type=="motionShowcase"][0].rows)
  }
}`;

console.log(JSON.stringify(await client.fetch(q), null, 2));
