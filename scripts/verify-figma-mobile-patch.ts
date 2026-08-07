/**
 * sanity exec scripts/verify-figma-mobile-patch.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

async function main() {
  const docs = await client.fetch(
    `*[_type=="caseStudy" && slug.current in [
      "coral-health","memory-tubes","2020-us-census-benefit-calculator",
      "diamond-valuation-ai","oc-links","forever-a-surfer","snapback-lifestyle"
    ]] | order(slug.current asc) {
      "slug": slug.current,
      "types": sections[]._type,
      "overview": sections[_type=="overviewSection"][0]{
        "body0": body[0].children[0].text,
        "sideImage": sideImage.asset->url,
        "bg": sideImageBackgroundColor.hex,
        "fit": sideImageFit,
        "hasVideo": defined(sideVideo.asset)
      }
    }`,
  );
  console.log(JSON.stringify(docs, null, 2));
}

main();
