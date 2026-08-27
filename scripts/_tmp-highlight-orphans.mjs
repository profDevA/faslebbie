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

const ORPHANS = ["body", "caption", "ctaLabel", "ctaUrl", "items", "videoFile", "videoUrl"];

const docs = await client.fetch(`*[_type=="caseStudy"]{
  _id,
  sections[]{ _type, layout, body, caption, ctaLabel, ctaUrl, items, videoFile, videoUrl, "cellCount": count(cells) }
}`);

for (const d of docs) {
  const s = d.sections?.find((x) => x._type === "highlightReel");
  if (!s) continue;
  const bad = ORPHANS.filter((k) => k in s);
  console.log(d._id, `cells=${s.cellCount}`, `layout=${s.layout ?? "—"}`, bad.length ? `orphans: ${bad.join(",")}` : "clean");
}
