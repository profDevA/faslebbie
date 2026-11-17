/**
 * Galderma — the motion band becomes Israel's "Key Product Experiences"
 * staggered pair (Nov 16 call: Fas, "there's two here, you only did one";
 * Figma Final Cleanup, XIAN page, frame `62:58416`, section `1015:23688`,
 * 1440×1876, bg #a8a9d1):
 *
 *   heading "Key Product Experiences" (Reckless Bold 20, centred)
 *   left  — "Sign up 1 Empty state" screen (`1015:23692`, 555 wide, white
 *            plate) + caption "Join and learn AART: A practitioner registers
 *            in four short steps, enters GAIN Connect and opens the AART
 *            course from Education & Training."
 *   right — "AART assessment" screen (`1015:23800`, 551 wide) + caption
 *            "Certify and go further with HIT: The practitioner takes the
 *            AART test, reviews their answers, and passes."
 *
 * Rewrites band `027be1d38455` (the single-screen band from Nov 13) to
 * `layoutVariant: "staggeredPair"` with two carousels — the same shape as
 * Circle's KPE. The sign-up screen is Israel's 4× export (bezel cropped,
 * ../exports/figma-2026-11-16/galderma/); the assessment screen reuses
 * Ade's Nov 13 upload (same design). Sakib's motions go into each
 * carousel's slide in Studio later.
 *
 * Dry by default; `-- --apply` uploads the sign-up screen (sha1 reuse),
 * backs the document up, sets the band's fields by `_key` under
 * ifRevisionId (published + draft) and unsets the single-layout fields.
 * Refuses once the band is already a staggered pair.
 *
 *   npx sanity exec scripts/patch-galderma-kpe-pair-nov16.ts --with-user-token [-- --apply]
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, type Doc, type Section, appearance, assetRef, client, fetchDocs, image, key, uploadedCount } from "./lib/structure-nov11";

const DOC_ID = "cs-galderma";
const BAND_KEY = "027be1d38455";
const SIGNUP = join(process.cwd(), "..", "exports", "figma-2026-11-16", "galderma", "kpe-signup-1015-23692@4x.png");
/** Ade's AART assessment screen, uploaded Nov 13 (patch-galderma-motion-ade-nov13.ts). */
const ASSESSMENT_ASSET = "image-de0cdc0e149178f69a18d099e2b11fbec2a8657c-1854x1356-png";

function caption(lead: string, rest: string) {
  return [
    {
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [
        { _type: "span", _key: key(), marks: ["strong"], text: lead },
        { _type: "span", _key: key(), marks: [], text: rest },
      ],
    },
  ];
}

function band(doc: Doc): Section {
  const s = doc.sections.find((x) => x._key === BAND_KEY);
  if (!s) throw new Error(`${doc._id}: band ${BAND_KEY} not found`);
  if (s._type !== "desktopMotionShowcase") throw new Error(`${doc._id}: ${BAND_KEY} is ${s._type}`);
  return s;
}

async function main() {
  console.log(`patch-galderma-kpe-pair-nov16 (${APPLY ? "APPLY" : "dry"})`);
  if (!existsSync(SIGNUP)) throw new Error(`missing ${SIGNUP}`);
  const plans: { doc: Doc; sets: Record<string, unknown>; unsets: string[] }[] = [];
  for (const doc of await fetchDocs(DOC_ID)) {
    const b = band(doc);
    console.log(`\n${doc._id} (rev ${doc._rev}) band ${BAND_KEY}: layout=${String(b.layoutVariant)} title="${String(b.sectionTitle ?? "")}" slides=${((b.slides as unknown[]) ?? []).length} carousels=${((b.carousels as unknown[]) ?? []).length}`);
    if (b.layoutVariant === "staggeredPair") throw new Error("band is already a staggered pair — nothing to do");
    const signup = await image(SIGNUP);
    const p = `sections[_key=="${BAND_KEY}"]`;
    const sets: Record<string, unknown> = {
      [`${p}.layoutVariant`]: "staggeredPair",
      [`${p}.sectionTitle`]: "Key Product Experiences",
      [`${p}.carousels`]: [
        {
          _type: "desktopMotionCarousel",
          _key: key(),
          body: caption(
            "Join and learn AART:",
            " A practitioner registers in four short steps, enters GAIN Connect and opens the AART course from Education & Training.",
          ),
          slides: [{ _type: "desktopMotionSlide", _key: key(), alt: "GAIN Connect — sign-up, step 1 of 4", image: signup }],
        },
        {
          _type: "desktopMotionCarousel",
          _key: key(),
          body: caption("Certify and go further with HIT:", " The practitioner takes the AART test, reviews their answers, and passes."),
          slides: [{ _type: "desktopMotionSlide", _key: key(), alt: "GAIN Connect — AART assessment", image: assetRef(ASSESSMENT_ASSET) }],
        },
      ],
      [`${p}.appearance`]: appearance("#a8a9d1", "#171717"),
    };
    const unsets = [`${p}.slides`, `${p}.caption`, `${p}.body`, `${p}.posterImage`];
    console.log(`  after: staggeredPair "Key Product Experiences", 2 carousels (sign-up 4× export + Ade's assessment asset), captions with bold leads, bg #a8a9d1; unset slides / caption / body / posterImage`);
    plans.push({ doc, sets, unsets });
  }
  if (!APPLY) {
    console.log(`\ndry run — nothing uploaded or written (re-run with -- --apply)`);
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `galderma-kpe-pair-nov16-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => p.doc), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const { doc, sets, unsets } of plans) {
    const res = await client.patch(doc._id).ifRevisionId(doc._rev).set(sets).unset(unsets).commit<Doc>();
    console.log(`✓ ${doc._id}: band rewritten as a staggered pair (rev ${res._rev})`);
  }
  console.log(`uploaded ${uploadedCount()} image asset(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
