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

const about = await client.fetch(
  `*[_type=="aboutPage"][0]{ bio[]{ children[]{ text, marks } } }`,
);
const hits = [];
for (const b of about?.bio ?? []) {
  for (const ch of b.children ?? []) {
    if (["teach", "monthly"].includes(ch.text)) {
      hits.push({ text: ch.text, marks: ch.marks ?? [] });
    }
  }
}

const research = await client.fetch(
  `*[_type=="researchPage"][0]{
    paradigms{ "img": image.asset->url },
    principles{ "img": image.asset->url }
  }`,
);

const coral = await client.fetch(
  `*[_type=="caseStudy" && slug.current=="coral-health" && !(_id in path("drafts.**"))][0]{
    fullCaseStudyLabel,
    "core": sections[_type=="coreExperience"][0]{
      "previewCount": count(previewScreens),
      "tabCount": count(popupTabs)
    }
  }`,
);

console.log(JSON.stringify({ aboutTeachMonthly: hits, researchCovers: research, coral }, null, 2));
