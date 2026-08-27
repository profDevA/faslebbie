/** Unset §08 CTA fields on Coral — not in Figma 2110:40096. */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

async function main() {
  const doc = await client.fetch<{ sections: { _key: string; _type: string }[] }>(
    `*[_id == "cs-coral-health"][0]{ sections[]{ _key, _type } }`,
  );
  const i = doc.sections.findIndex((s) => s._type === "desktopMotionShowcase");
  if (i < 0) throw new Error("no desktopMotionShowcase");

  for (const id of ["cs-coral-health", "drafts.cs-coral-health"]) {
    const exists = await client.getDocument(id);
    if (!exists) continue;
    await client
      .patch(id)
      .unset([`sections[${i}].ctaLabel`, `sections[${i}].ctaUrl`])
      .commit();
    console.log(`✓ unset cta on ${id}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
