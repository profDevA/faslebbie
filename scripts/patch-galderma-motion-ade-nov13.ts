/**
 * Galderma — restyle the Full Page Motion band to Ade's design (Nov 13 call
 * 3, "add this section to the live site"; Figma Final Cleanup, page Galderma,
 * band `1042:107494` inside the "1440w default" frame `1034:47614`):
 *
 *   - band background #a8a9d1 (lavender), text #171717
 *   - one screen, Ade's "AART assessment" page (`1042:107501`, 927×678 incl.
 *     its 10px #cecece bezel; exported at 2× and cropped to the screen so the
 *     site's own device frame wraps it) — replaces the three old-site laptop
 *     screens; Sakib's motion goes into videoFile later
 *   - caption: Ade's "Certify and go further with HIT: …" (bottom-right, as
 *     the layout already does); no section title
 *   - container 927 (Ade's device width) instead of 1176
 *
 * Targets the band Xian added at 20:25 UTC (`027be1d38455`). Dry by default;
 * `-- --apply` uploads the screen (sha1 reuse), backs the document up and
 * sets the band's fields by `_key` under ifRevisionId (published + draft).
 * Refuses if the band is missing or already carries Ade's caption.
 *
 *   npx sanity exec scripts/patch-galderma-motion-ade-nov13.ts --with-user-token [-- --apply]
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, type Doc, type Section, appearance, client, fetchDocs, image, key, uploadedCount } from "./lib/structure-nov11";

const DOC_ID = "cs-galderma";
const BAND_KEY = "027be1d38455";
const SCREEN = join(process.cwd(), "..", "exports", "figma-2026-11-13", "galderma", "motion-aart-assessment-1042-107501@2x.png");
const CAPTION =
  "Certify and go further with HIT: The practitioner takes the AART test, reviews their answers, and passes. That pass opens the next step: they explore Premium, subscribe, and launch the HIT programme, picking up a Shape Up lesson from the HIT hub.";

function band(doc: Doc): Section {
  const s = doc.sections.find((x) => x._key === BAND_KEY);
  if (!s) throw new Error(`${doc._id}: band ${BAND_KEY} not found`);
  if (s._type !== "desktopMotionShowcase") throw new Error(`${doc._id}: ${BAND_KEY} is ${s._type}`);
  return s;
}

async function main() {
  console.log(`patch-galderma-motion-ade-nov13 (${APPLY ? "APPLY" : "dry"})`);
  if (!existsSync(SCREEN)) throw new Error(`missing ${SCREEN}`);
  const plans: { doc: Doc; sets: Record<string, unknown> }[] = [];
  for (const doc of await fetchDocs(DOC_ID)) {
    const b = band(doc);
    const slides = (b.slides as { _key: string }[] | undefined) ?? [];
    const app = (b.appearance ?? {}) as Record<string, unknown>;
    console.log(`\n${doc._id} (rev ${doc._rev}) band ${BAND_KEY}: layout=${String(b.layoutVariant)} slides=${slides.length} bg=${String(app.backgroundColor ?? app.bg ?? "?")} container=${String(app.containerMaxWidth ?? "?")}`);
    console.log(`  caption now: "${String(b.caption ?? "").slice(0, 60)}…"`);
    if (String(b.caption ?? "").startsWith("Certify and go further")) throw new Error("band already carries Ade's caption — nothing to do");
    const screen = await image(SCREEN);
    const p = `sections[_key=="${BAND_KEY}"]`;
    const sets: Record<string, unknown> = {
      [`${p}.slides`]: [{ _type: "desktopMotionSlide", _key: key(), alt: "GAIN Connect — AART assessment", image: screen }],
      [`${p}.caption`]: CAPTION,
      [`${p}.appearance`]: appearance("#a8a9d1", "#171717", { tileBorderRadius: 10, containerMaxWidth: 927 }),
    };
    console.log(`  after: 1 slide (Ade's AART assessment screen), bg #a8a9d1, container 927, radius 10, Ade's caption`);
    plans.push({ doc, sets });
  }
  if (!APPLY) {
    console.log(`\ndry run — nothing uploaded or written (re-run with -- --apply)`);
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `galderma-motion-ade-nov13-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => p.doc), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const { doc, sets } of plans) {
    const res = await client.patch(doc._id).ifRevisionId(doc._rev).set(sets).commit<Doc>();
    console.log(`✓ ${doc._id}: band restyled (rev ${res._rev})`);
  }
  console.log(`uploaded ${uploadedCount()} image asset(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
