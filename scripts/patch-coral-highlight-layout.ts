/** Set layout=grid on Coral highlightReel (was missing; defaults in UI only). */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

async function main() {
  const doc = await client.fetch<{ sections: { _type: string }[] }>(
    `*[_id == "cs-coral-health"][0]{ sections[]{ _type } }`,
  );
  const i = doc.sections.findIndex((s) => s._type === "highlightReel");
  if (i < 0) throw new Error("no highlightReel");

  for (const id of ["cs-coral-health", "drafts.cs-coral-health"]) {
    const exists = await client.getDocument(id);
    if (!exists) continue;
    await client.patch(id).set({ [`sections[${i}].layout`]: "grid" }).commit();
    console.log(`✓ layout=grid on ${id}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
