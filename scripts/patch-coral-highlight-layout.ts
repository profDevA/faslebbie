/**
 * Coral §10 Project Highlights — mint plate + Figma inset (`4551:32037` / `4556:38244`).
 * Does not touch cell assets (GIF/MP4 stay as uploaded).
 */
import { getCliClient } from "sanity/cli";

import { HIGHLIGHT_REEL_GRID_DEFAULTS } from "../src/lib/caseStudyDefaults";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });

const DRY = process.argv.includes("--dry");

async function main() {
  const doc = await client.fetch<{
    sections: {
      _type: string;
      gridCellInsetVerticalPercent?: number;
      gridCellInsetHorizontalPercent?: number;
    }[];
  }>(`*[_id == "cs-coral-health"][0]{ sections[]{ _type, gridCellInsetVerticalPercent, gridCellInsetHorizontalPercent } }`);
  const i = doc.sections.findIndex((s) => s._type === "highlightReel");
  if (i < 0) throw new Error("no highlightReel");

  const before = doc.sections[i];
  console.log(
    `before inset V/H: ${before.gridCellInsetVerticalPercent ?? "(unset)"} / ${before.gridCellInsetHorizontalPercent ?? "(unset)"}`,
  );

  const patch = {
    [`sections[${i}].layout`]: "grid",
    [`sections[${i}].gridCellMatteColor`]: sanityColor(
      HIGHLIGHT_REEL_GRID_DEFAULTS.cellMatteColor,
    ),
    [`sections[${i}].gridCellInsetVerticalPercent`]:
      HIGHLIGHT_REEL_GRID_DEFAULTS.cellInsetVerticalPercent,
    [`sections[${i}].gridCellInsetHorizontalPercent`]:
      HIGHLIGHT_REEL_GRID_DEFAULTS.cellInsetHorizontalPercent,
  };

  for (const id of ["cs-coral-health", "drafts.cs-coral-health"]) {
    const exists = await client.getDocument(id);
    if (!exists) continue;
    console.log(`${DRY ? "(dry) " : ""}${id}: highlight insets → ${HIGHLIGHT_REEL_GRID_DEFAULTS.cellInsetVerticalPercent}/${HIGHLIGHT_REEL_GRID_DEFAULTS.cellInsetHorizontalPercent} mint ${HIGHLIGHT_REEL_GRID_DEFAULTS.cellMatteColor}`);
    if (!DRY) {
      await client.patch(id).set(patch).commit();
      console.log(`✓ ${id}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
