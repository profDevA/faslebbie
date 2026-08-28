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

const KNOWN = {
  heroSection: ["caption", "headingOverride", "image", "imageMobile", "appearance"],
  overviewSection: [
    "sectionTitle", "body", "serviceCategoryLabel", "serviceList", "duration", "team",
    "confidentialityNote", "ctaLabel", "ctaUrl", "sideImage", "sideVideo", "sideImageFit",
    "sideImageBackgroundColor", "appearance",
  ],
  problemContextSection: [
    "problemHeading", "problemBody", "broughtHeading", "broughtBody", "supportingCopy", "appearance",
  ],
  coreExperience: [
    "sectionTitle", "body", "layoutVariant", "viewMoreLabel", "previewScreens",
    "popupScreens", "popupBody", "popupTabs", "popupItemsBeforeViewMore", "popupLoadMoreLabel",
    "image", "imageMobile", "appearance",
  ],
  accordionSection: [
    "variant", "sectionTitle", "sideTitle", "sideBody", "accordionBackgroundColor", "items", "appearance",
  ],
  showcaseGallery: ["sectionTitle", "introBody", "expandable", "items", "appearance"],
  motionShowcase: ["sectionTitle", "intro", "rows", "appearance"],
  desktopMotionShowcase: [
    "sectionTitle", "body", "videoUrl", "videoFile", "posterImage", "caption", "appearance",
  ],
  statsSection: ["sectionTitle", "body", "items", "appearance"],
  highlightReel: ["sectionTitle", "layout", "cells", "appearance"],
  reflectionSection: [
    "reflectionHeading", "reflectionBody", "nextStepsHeading", "nextStepsItems", "appearance",
  ],
};

const LEGACY_TYPES = ["proseSection", "bulletSection", "mediaSection", "gallerySection"];

for (const id of ["cs-coral-health", "drafts.cs-coral-health"]) {
  const sections = await client.fetch(`*[_id == $id][0].sections[]`, { id });
  console.log(`\n=== ${id} ===`);

  for (const s of sections) {
    if (LEGACY_TYPES.includes(s._type)) {
      console.log(`LEGACY TYPE: ${s._type} (${s._key})`);
    }
    const allowed = KNOWN[s._type];
    if (!allowed) {
      console.log(`UNKNOWN TYPE: ${s._type}`);
      continue;
    }
    const extras = Object.keys(s).filter(
      (k) => !["_key", "_type", ...allowed].includes(k),
    );
    if (extras.length) {
      console.log(`${s._type}: orphan keys → ${extras.join(", ")}`);
    }
  }
}
