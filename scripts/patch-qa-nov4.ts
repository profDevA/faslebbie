/**
 * Israel's "Final QA" doc (Nov 4; docs/meetings/2026-11-04-qa-actions.md).
 *
 *   1. Acme Core Experience Flow: "make the texts here black not white" —
 *      band text #FAFAFA → #171717 (Figma 239:26743 captions / title).
 *   2. Acme Key Product Experiences: "match this section with Figma" — Band
 *      layout → "Large device, caption below" (Figma 239:27598: 873 mockup,
 *      title + text under it, right of centre). Same video, same copy. Older
 *      deployed code ignores the value (keeps the Coral KPE band), so the order
 *      vs the deploy doesn't matter.
 *
 * One revision-guarded patch on cs-acme-lending (+ draft if any). Dry by
 * default; --apply backs the doc up to ../exports/sanity-backups/ first.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-qa-nov4.ts --with-user-token
 *   npx sanity exec scripts/patch-qa-nov4.ts --with-user-token -- --apply
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");
const BACKUPS = join(process.cwd(), "..", "exports", "sanity-backups");
const DOC = "cs-acme-lending";

const SETS: { sectionKey: string; type: string; field: string; value: unknown; note: string }[] = [
  { sectionKey: "18ede85944f6", type: "coreExperience", field: "appearance.textColor", value: { _type: "color", alpha: 1, hex: "#171717" }, note: "CE text black" },
  { sectionKey: "fe7249e5f0c6", type: "desktopMotionShowcase", field: "layoutVariant", value: "captionBelow", note: "KPE large device, caption below" },
];

type Section = { _key: string; _type: string } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; sections: Section[] };

const get = (o: unknown, path: string) =>
  path.split(".").reduce<unknown>((v, k) => (v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined), o);
const show = (v: unknown) => (v && typeof v === "object" && "hex" in (v as object) ? String(get(v, "hex")) : JSON.stringify(v) ?? "∅");

async function main() {
  console.log(`patch-qa-nov4 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]`, { ids: [DOC, `drafts.${DOC}`] });
  if (!docs.some((d) => d._id === DOC)) throw new Error(`${DOC} not found`);
  for (const d of docs) for (const s of SETS) {
    const sec = d.sections.find((x) => x._key === s.sectionKey);
    if (!sec || sec._type !== s.type) throw new Error(`${d._id}: ${s.type} ${s.sectionKey} not found`);
  }
  if (APPLY) {
    mkdirSync(BACKUPS, { recursive: true });
    const file = join(BACKUPS, `qa-nov4-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    writeFileSync(file, JSON.stringify(docs, null, 1));
    console.log(`backup → ${file}`);
  }
  for (const d of docs) {
    let patch = client.patch(d._id).ifRevisionId(d._rev);
    for (const s of SETS) {
      const sec = d.sections.find((x) => x._key === s.sectionKey)!;
      console.log(`• ${d._id} — ${s.note}: ${s.field} ${show(get(sec, s.field))} → ${show(s.value)}`);
      patch = patch.set({ [`sections[_key=="${s.sectionKey}"].${s.field}`]: s.value });
    }
    if (APPLY) await patch.commit();
  }
  console.log(APPLY ? "✓ patched" : "would patch");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
