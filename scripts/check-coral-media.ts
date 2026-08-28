import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const query = `*[_type == "caseStudy" && slug.current == "coral-health"][0]{
  title,
  sections[]{
    _type,
    _key,
    sectionTitle,
    problemHeading,
    "heroImage": image.asset->url,
    "heroMobile": imageMobile.asset->url,
    "sideImage": sideImage.asset->url,
    "sideVideo": sideVideo.asset->url,
    "coreImage": image.asset->url,
    layoutVariant,
    viewMoreLabel,
    "previewCount": count(previewScreens),
    "previewImages": previewScreens[].image.asset->url,
    "popupCount": count(popupScreens),
    "popupTabCount": count(popupTabs),
    "itemImages": items[].image.asset->url,
    "itemVideos": items[].videoFile.asset->url,
    "galleryImages": items[].image.asset->url,
    "showcaseImages": items[].image.asset->url,
    "motionVideos": rows[].items[].videoFile.asset->url,
    "highlightFrames": cells[].frames[].asset->url
  }
}`;

async function main() {
  const doc = await client.fetch(query);
  console.log(JSON.stringify(doc, null, 2));
}

main().catch(console.error);
