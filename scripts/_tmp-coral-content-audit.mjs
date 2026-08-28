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
    title,
    fullCaseStudyLabel,
    "pdf": fullCaseStudyPdf.asset->url,
    from, to, tagline,
    "sections": sections[]{
      _key, _type, sectionTitle, reflectionHeading,
      "hasAppearance": defined(appearance),
      "bg": appearance.backgroundColor.hex,
      "padT": appearance.paddingTop,
      "padB": appearance.paddingBottom,
      "img": coalesce(image.asset->url, sideImage.asset->url, posterImage.asset->url),
      "previewScreens": count(previewScreens),
      "popupTabs": count(popupTabs),
      "items": count(items),
      "cells": count(cells),
      "rows": count(rows),
      "hasVideo": defined(videoFile.asset) || defined(videoUrl),
      "hasBody": defined(body) || defined(problemBody) || defined(introBody) || defined(reflectionBody)
    }
  }`,
);

console.log(JSON.stringify(doc, null, 2));
