/**
 * Make Studio's Draft view match the live site (Fas, Nov 19 evening call:
 * "there's no one source of truth… draft vs publish"; Xian Nov 20: "apply, A
 * for now"). With no draft, Studio's Draft view shows the published version.
 *
 * - teachingPage: discard the Aug 13 draft (old page: 1 intro paragraph,
 *   14 students, no exhibition heading). Published is current.
 * - cs-design-assist-ai: discard the Nov 5 draft (only adds a blue #24a3e3
 *   Overview text colour that was never published).
 * - buildPage: publish the draft's one change. Live Leoney's tech stack ends
 *   with the test text "I can do" (typed on the call); the draft removed it.
 * - cs-2020-us-census-benefit-calculator: discard the draft. Its only change
 *   is the card thumbnail "Thumbnail (1).mp4", a duplicate of the live
 *   "Thumbnail.mp4" (same video, re-uploaded 3 min later on Nov 14).
 *
 * Each document is re-read first and skipped if its draft changed since
 * Nov 20 (different _updatedAt or different differences). Dry by default;
 * `-- --apply` backs up both versions, then writes.
 *
 *   npx sanity exec scripts/sync-drafts-nov20.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });

type Doc = Record<string, unknown> & { _id: string; _rev: string; _updatedAt: string };

type Plan = {
  id: string;
  action: "discard draft" | "publish draft field";
  /** The draft's _updatedAt when checked on Nov 20; anything else = skip. */
  draftUpdatedAt: string;
  /** Every path where draft and published differ, exactly. */
  expectedDiff: string[];
  /** For "publish draft field": the path to copy from the draft. */
  field?: { path: string; get: (d: Doc) => unknown };
};

const LEONEY = "503a3aad2d82";

const PLANS: Plan[] = [
  {
    id: "teachingPage",
    action: "discard draft",
    draftUpdatedAt: "2026-08-13T07:59:46Z",
    expectedDiff: [], // the old page differs everywhere; the date guard is the check
  },
  {
    id: "cs-design-assist-ai",
    action: "discard draft",
    draftUpdatedAt: "2026-11-05T06:24:27Z",
    expectedDiff: [".sections[1ebafafec97d].appearance.textColor"],
  },
  {
    // Added after the first run: "Thumbnail (1).mp4" (draft) is the same video
    // as the live "Thumbnail.mp4" (both h264 1080×1318 60fps 17.5 s, SSIM
    // 0.9997 over all 1050 frames), i.e. a duplicate upload 3 min later.
    id: "cs-2020-us-census-benefit-calculator",
    action: "discard draft",
    draftUpdatedAt: "2026-11-19T16:28:28Z",
    expectedDiff: [".cardThumbnailMotion.asset._ref"],
  },
  {
    id: "buildPage",
    action: "publish draft field",
    draftUpdatedAt: "2026-11-20T05:23:34Z",
    expectedDiff: [`.projects[${LEONEY}].tech.2`],
    field: {
      path: `projects[_key=="${LEONEY}"].tech`,
      get: (d) =>
        ((d.projects as { _key: string; tech?: string[] }[]) ?? []).find((p) => p._key === LEONEY)?.tech,
    },
  },
];

const SYSTEM = new Set(["_id", "_rev", "_updatedAt", "_createdAt", "_originalId", "_system"]);

/** Paths where a and b differ; arrays of keyed objects are matched by _key. */
function diff(a: unknown, b: unknown, path = "", out: string[] = []): string[] {
  if (JSON.stringify(a) === JSON.stringify(b)) return out;
  if (a && b && typeof a === "object" && typeof b === "object") {
    const keyed = (x: unknown) =>
      Array.isArray(x) && x.every((i) => i && typeof i === "object" && "_key" in i);
    if (keyed(a) && keyed(b)) {
      const A = a as { _key: string }[];
      const B = b as { _key: string }[];
      for (const k of new Set([...A.map((i) => i._key), ...B.map((i) => i._key)]))
        diff(A.find((i) => i._key === k), B.find((i) => i._key === k), `${path}[${k}]`, out);
      if (A.map((i) => i._key).join() !== B.map((i) => i._key).join()) out.push(`${path} (order)`);
      return out;
    }
    const ao = a as Record<string, unknown>;
    const bo = b as Record<string, unknown>;
    for (const k of new Set([...Object.keys(ao), ...Object.keys(bo)]))
      if (!(path === "" && SYSTEM.has(k))) diff(ao[k], bo[k], `${path}.${k}`, out);
    return out;
  }
  out.push(path);
  return out;
}

async function main() {
  console.log(`sync-drafts-nov20 (${APPLY ? "APPLY" : "dry"})`);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  let skipped = 0;

  for (const plan of PLANS) {
    const [pub, draft] = await Promise.all([
      client.fetch<Doc | null>(`*[_id == $id][0]`, { id: plan.id }),
      client.fetch<Doc | null>(`*[_id == $id][0]`, { id: `drafts.${plan.id}` }),
    ]);
    console.log(`\n== ${plan.id}: ${plan.action}`);
    if (!pub) throw new Error(`${plan.id}: published document not found`);
    if (!draft) {
      console.log(`   no draft any more: already identical, nothing to do`);
      continue;
    }
    const found = diff(draft, pub);
    console.log(`   draft ${draft._updatedAt} · published ${pub._updatedAt} (rev ${pub._rev})`);
    console.log(`   differences: ${found.length}${found.length <= 3 ? ` ${found.join(", ")}` : ""}`);
    if (draft._updatedAt !== plan.draftUpdatedAt) {
      console.log(`   SKIP: draft was edited since the check (expected ${plan.draftUpdatedAt})`);
      skipped++;
      continue;
    }
    if (plan.expectedDiff.length && found.join("|") !== plan.expectedDiff.join("|")) {
      console.log(`   SKIP: differences aren't the expected ${plan.expectedDiff.join(", ")}`);
      skipped++;
      continue;
    }
    if (plan.field) {
      console.log(`   published ${plan.field.path}: ${JSON.stringify(plan.field.get(pub))}`);
      console.log(`   → draft's value:  ${JSON.stringify(plan.field.get(draft))}`);
    }
    if (!APPLY) continue;

    mkdirSync(BACKUPS, { recursive: true });
    const file = join(BACKUPS, `sync-drafts-nov20-${plan.id}-${stamp}.json`);
    writeFileSync(file, JSON.stringify({ published: pub, draft }, null, 1));
    console.log(`   backup → ${file}`);

    const tx = client.transaction();
    if (plan.field) tx.patch(pub._id, (p) => p.ifRevisionId(pub._rev).set({ [plan.field!.path]: plan.field!.get(draft) }));
    tx.delete(draft._id);
    const res = await tx.commit();
    console.log(`   ✓ done (transaction ${res.transactionId})`);
  }

  // After: list remaining drafts.
  const left = await client.fetch<{ _id: string; _updatedAt: string }[]>(
    `*[_id in path("drafts.**")]{ _id, _updatedAt } | order(_updatedAt desc)`,
  );
  console.log(`\ndrafts ${APPLY ? "now" : "today"}: ${left.length}`);
  for (const d of left) console.log(`   ${d._id} (${d._updatedAt})`);
  if (skipped) console.log(`\n${skipped} skipped — see above`);
  if (!APPLY) console.log(`\ndry run — nothing written (re-run with -- --apply)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
