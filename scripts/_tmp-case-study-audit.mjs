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

const CORAL_TYPES = [
  "heroSection",
  "overviewSection",
  "problemContextSection",
  "coreExperience",
  "accordionSection",
  "showcaseGallery",
  "motionShowcase",
  "desktopMotionShowcase",
  "statsSection",
  "highlightReel",
  "reflectionSection",
];

const rows = await client.fetch(
  `*[_type == "caseStudy" && !(_id in path("drafts.**"))] | order(orderRank asc){
    "slug": slug.current,
    "types": sections[]._type
  }`,
);

for (const r of rows) {
  const types = r.types ?? [];
  const coralLike = CORAL_TYPES.filter((t) => types.includes(t)).length;
  const legacy = types.filter(
    (t) =>
      ["proseSection", "bulletSection", "mediaSection", "gallerySection"].includes(t),
  );
  console.log(
    `${r.slug}: ${types.length} sections, coral-types=${coralLike}/${CORAL_TYPES.length}, legacy=${legacy.join(",") || "none"}`,
  );
}
