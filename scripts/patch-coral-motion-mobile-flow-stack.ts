/**
 * Coral §07 Key Product Experiences — set motionShowcase layoutVariant to
 * `mobileFlowStack` (Figma Holistic 3928:39758).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-coral-motion-mobile-flow-stack.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");

async function patchDoc(id: string) {
  const doc: { sections?: { _type: string; _key?: string }[] } | null =
    await client.fetch(`*[_id == $id][0]{ sections[]{ _type, _key } }`, {
      id,
    });
  if (!doc?.sections?.length) {
    console.log(`skip ${id}: no sections`);
    return;
  }
  const idx = doc.sections.findIndex((s) => s._type === "motionShowcase");
  if (idx < 0) {
    console.log(`skip ${id}: no motionShowcase`);
    return;
  }
  console.log(`${DRY ? "(dry) " : ""}${id}: sections[${idx}].layoutVariant → mobileFlowStack`);
  if (DRY) return;
  await client
    .patch(id)
    .set({ [`sections[${idx}].layoutVariant`]: "mobileFlowStack" })
    .commit();
}

async function main() {
  for (const id of ["cs-coral-health", "drafts.cs-coral-health"]) {
    await patchDoc(id);
  }
  if (!DRY) console.log("✓ Coral motionShowcase → mobileFlowStack");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
