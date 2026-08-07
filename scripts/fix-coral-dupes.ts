/**
 * List + sync all coral-health caseStudy docs (draft + published duplicates).
 *   sanity exec scripts/fix-coral-dupes.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

async function main() {
  const docs = await client.fetch(
    `*[_type=="caseStudy" && slug.current=="coral-health"]{
      _id, _updatedAt,
      "overview": sections[_type=="overviewSection"][0]{
        "body0": body[0].children[0].text,
        "sideImage": sideImage.asset->_id,
        "bg": sideImageBackgroundColor.hex,
        "fit": sideImageFit
      }
    }`,
  );
  console.log(JSON.stringify(docs, null, 2));

  const good = docs.find((d: any) =>
    String(d.overview?.body0 ?? "").startsWith("Coral Health transforms"),
  );
  if (!good) {
    console.error("no good coral doc found");
    return;
  }
  console.log("\nsource of truth:", good._id);

  for (const d of docs) {
    if (d._id === good._id) continue;
    const full = await client.getDocument(good._id);
    if (!full?.sections) continue;
    await client.patch(d._id).set({ sections: full.sections }).commit();
    console.log("synced sections →", d._id);
  }
}

main();
