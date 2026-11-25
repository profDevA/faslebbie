/**
 * Fas's Nov 24 late call: four Studio changes Xian okayed on Nov 25 ("can't
 * you do this??? why? we can"). Items 5, 6, 1b + the podcast art in
 * docs/meetings/2026-11-24-evening-actions.md.
 *
 *  1. Menu order (item 5): Site Settings → Navigation → "Desktop nav"
 *     (`navItems`) and "Mobile nav" (`mobileNavItems`) → Home · About ·
 *     Approach · Work · Build · Research · Teaching · Words + Media (Approach
 *     moves from after Build to after About). Contact is not in these lists
 *     (Nav.tsx draws it from `contactDrawerTitle`), so it stays where it is.
 *  2. Research areas (item 6): Research Page → Research areas (`areas`) →
 *     Minerals → Design Leadership: The Scalar Framework → AI as a Design
 *     Material. The closing paragraph is its own field (`closing`), always last.
 *  3. Build projects (item 1b, Figma 1394:17869): Build Page → Projects
 *     (`projects`; the site follows the array order, there is no orderRank) →
 *     Pebble, Gradstudio, Leoney, DeepSoCal Agent, Mineral Pulse, Rookieball.
 *     Hidden projects (SenseSpace AI, "Hide on site") go last, in their
 *     current relative order.
 *  4. Podcast art: Blogs & Media Page → Design Again (featured) → Hero image
 *     (`mediaFeatured.heroImage`, read by MediaBody — desktop panel and phone
 *     card — and MediaPopup) → Ade's clean art (Figma "Group 31" 1392:17047
 *     @3x, 2166 × 2616, no mic / credit line / avatars). Only the asset
 *     reference changes; crop / hotspot are unset so the logo stays centred;
 *     any other key on the image object (alt) is kept. The site's alt text is
 *     the podcast title, unchanged.
 *
 * Moves are `_key`-based, in one transaction: per move an `unset` of the item
 * by `_key`, then an `insert` of the same item (as just read) before / after
 * its new neighbour by `_key`; `ifRevisionId` on each document's first
 * mutation. Each list must hold exactly the expected `_key`s (with their
 * expected href / kicker / id) and the hero image must still be the old asset
 * (or already the new one), else it refuses (a Studio edit since). Published
 * documents only: a draft is reported and left alone. Re-reads right before
 * writing (refuses if anything moved), backs the four fields up to
 * ../exports/sanity-backups/, then reads back and checks every item is
 * unchanged apart from its position.
 *
 * Applies by default; `-- --dry` plans only and uploads nothing (it looks the
 * art up by sha1 to say whether an upload would happen). The upload reuses an
 * asset with the same sha1 and retries a dropped connection. Re-run after
 * apply = "already in order" / "already set". Art: `-- --art=<file>`
 * (default ../exports/podcast-art-2026-11-25/ade-podcast-art-2166x2616.png,
 * a copy of the Nov 25 scratchpad export). Undo: drag back in Studio / pick
 * the old image (`image-8aa320708719f81d1a5338e3b16ed976eeeede04-2109x2022-png`).
 *
 *   npx sanity exec scripts/patch-nav-research-build-media-nov25.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-nav-research-build-media-nov25.ts --with-user-token
 */
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";

import { BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });
const DRY = process.argv.includes("--dry");
const ART =
  process.argv.find((a) => a.startsWith("--art="))?.slice("--art=".length) ??
  join(process.cwd(), "..", "exports", "podcast-art-2026-11-25", "ade-podcast-art-2166x2616.png");
const ART_W = 2166;
const ART_H = 2616;
const OLD_ART = "image-8aa320708719f81d1a5338e3b16ed976eeeede04-2109x2022-png";

type Item = { _key: string } & Record<string, unknown>;
type Pin = { key: string; field: string; value: string };

/** Nav: target order; each item pinned by `_key` + href. */
const NAV: Pin[] = [
  { key: "home", field: "href", value: "/" },
  { key: "about", field: "href", value: "/about" },
  { key: "approach", field: "href", value: "/approach" },
  { key: "case-studies", field: "href", value: "/work" },
  { key: "build", field: "href", value: "/build" },
  { key: "research", field: "href", value: "/research" },
  { key: "teaching", field: "href", value: "/teaching" },
  { key: "words", field: "href", value: "/blogs" },
];
const AREAS: Pin[] = [
  { key: "a35bd835414d", field: "kicker", value: "Minerals, Material & Post-Extractive Design" },
  { key: "8cc5b2b28285", field: "kicker", value: "Design Leadership: The Scalar Framework" },
  { key: "da8f16e08967", field: "kicker", value: "AI as a Design Material" },
];
/** Visible projects in Figma order; hidden ones are appended after them. */
const PROJECTS: Pin[] = [
  { key: "9b357b42ba9d", field: "id", value: "pebble" },
  { key: "44363ee47db5", field: "id", value: "gradstudio" },
  { key: "503a3aad2d82", field: "id", value: "leoney" },
  { key: "d864e31b64db", field: "id", value: "deepsocal-agent" },
  { key: "d60fc0809510", field: "id", value: "mineral-pulse" },
  { key: "f71622e79345", field: "id", value: "rookieball" },
];
const HIDDEN_PROJECTS: Pin[] = [{ key: "6d86d23d4110", field: "id", value: "sensespace-ai" }];

type ListSpec = { docId: string; field: string; label: string; pins: Pin[]; hidden?: Pin[] };
const LISTS: ListSpec[] = [
  { docId: "siteSettings", field: "navItems", label: "Site Settings → Desktop nav", pins: NAV },
  { docId: "siteSettings", field: "mobileNavItems", label: "Site Settings → Mobile nav", pins: NAV },
  { docId: "researchPage", field: "areas", label: "Research Page → Research areas", pins: AREAS },
  { docId: "buildPage", field: "projects", label: "Build Page → Projects", pins: PROJECTS, hidden: HIDDEN_PROJECTS },
];
const DOC_IDS = ["siteSettings", "researchPage", "buildPage", "blogsPage"];

type Move = { key: string; where: "before" | "after"; anchor: string };
type ListPlan = { spec: ListSpec; before: Item[]; target: Item[]; moves: Move[] };
type Image = { _type?: string; asset?: { _ref?: string }; crop?: unknown; hotspot?: unknown } & Record<string, unknown>;
type HeroPlan = { before: Image | null; set: boolean; unset: string[] };
type Plan = { revs: Record<string, string>; lists: ListPlan[]; hero: HeroPlan; closing: string };
type Doc = { _id: string; _rev: string } & Record<string, unknown>;

const name = (spec: ListSpec, it: Item) => {
  const v = it[spec.pins[0].field];
  const label = typeof it.label === "string" ? it.label : typeof it.title === "string" ? it.title : v;
  return `${label}${it.hidden ? " (hidden)" : ""}`;
};

/** Moves that turn `from` into `to` (same keys), simulated on a copy. */
function movesFor(from: string[], to: string[]): Move[] {
  const cur = [...from];
  const moves: Move[] = [];
  for (let i = 0; i < to.length; i++) {
    if (cur[i] === to[i]) continue;
    const k = to[i];
    cur.splice(cur.indexOf(k), 1);
    const m: Move = i === 0 ? { key: k, where: "before", anchor: cur[0] } : { key: k, where: "after", anchor: to[i - 1] };
    cur.splice(i, 0, k);
    moves.push(m);
  }
  if (!isDeepStrictEqual(cur, to)) throw new Error(`internal: moves don't reach the target (${cur.join(",")})`);
  return moves;
}

function planList(spec: ListSpec, doc: Doc): ListPlan {
  const before = (doc[spec.field] as Item[] | null) ?? [];
  const byKey = new Map(before.map((it) => [it._key, it]));
  const all = [...spec.pins, ...(spec.hidden ?? [])];
  if (before.length !== all.length || byKey.size !== all.length)
    throw new Error(`refusing: ${spec.label} has ${before.length} items, expected ${all.length} (Studio edit?)`);
  for (const p of all) {
    const it = byKey.get(p.key);
    if (!it) throw new Error(`refusing: ${spec.label} has no _key ${p.key} (${p.value})`);
    if (it[p.field] !== p.value)
      throw new Error(`refusing: ${spec.label} _key ${p.key} ${p.field} is ${JSON.stringify(it[p.field])}, expected "${p.value}"`);
    if ("orderRank" in it) throw new Error(`refusing: ${spec.label} items carry orderRank — order is not the array order`);
  }
  for (const p of spec.pins)
    if (byKey.get(p.key)!.hidden) throw new Error(`refusing: ${spec.label} "${p.value}" is hidden now (Studio edit?)`);
  for (const p of spec.hidden ?? [])
    if (!byKey.get(p.key)!.hidden) throw new Error(`refusing: ${spec.label} "${p.value}" is no longer hidden (Studio edit?)`);
  // Hidden items keep their current relative order, after the visible ones.
  const hiddenKeys = before.filter((it) => (spec.hidden ?? []).some((h) => h.key === it._key)).map((it) => it._key);
  const targetKeys = [...spec.pins.map((p) => p.key), ...hiddenKeys];
  const target = targetKeys.map((k) => byKey.get(k)!);
  return { spec, before, target, moves: movesFor(before.map((it) => it._key), targetKeys) };
}

function planHero(doc: Doc, newAsset: string | null): HeroPlan {
  const mf = doc.mediaFeatured as { heroImage?: Image | null } | undefined;
  if (!mf) throw new Error("refusing: blogsPage.mediaFeatured missing");
  const img = mf.heroImage ?? null;
  const ref = img?.asset?._ref;
  if (ref !== OLD_ART && !(newAsset && ref === newAsset))
    throw new Error(`refusing: podcast hero image is ${ref ?? "(empty)"}, expected the old art ${OLD_ART} (Studio upload since?)`);
  const unset = ["crop", "hotspot"].filter((k) => img && k in img);
  return { before: img, set: ref !== newAsset, unset };
}

async function readDocs(): Promise<Map<string, Doc>> {
  const ids = DOC_IDS.flatMap((id) => [id, `drafts.${id}`]);
  const docs = await client.fetch<Doc[]>(
    `*[_id in $ids]{ _id, _rev, navItems, mobileNavItems, areas, "closing": pt::text(closing), projects, mediaFeatured{ heroImage } }`,
    { ids },
  );
  return new Map(docs.map((d) => [d._id, d]));
}

async function plan(newAsset: string | null, log: boolean): Promise<Plan> {
  const say = (s: string) => log && console.log(s);
  const docs = await readDocs();
  const revs: Record<string, string> = {};
  for (const id of DOC_IDS) {
    const d = docs.get(id);
    if (!d) throw new Error(`${id} not found`);
    revs[id] = d._rev;
    const draft = docs.get(`drafts.${id}`);
    say(`  ${id} rev ${d._rev}; draft: ${draft ? `YES (drafts.${id} rev ${draft._rev}) — left alone, report it` : "none"}`);
  }

  const lists: ListPlan[] = [];
  for (const spec of LISTS) {
    const lp = planList(spec, docs.get(spec.docId)!);
    lists.push(lp);
    say(`\n  ${spec.label} (${spec.docId}.${spec.field})`);
    say(`    before: ${lp.before.map((it) => name(spec, it)).join(" · ")}`);
    say(`    after:  ${lp.target.map((it) => name(spec, it)).join(" · ")}`);
    say(
      lp.moves.length
        ? lp.moves
            .map((m) => `    move ${m.key} ${m.where} ${m.anchor}`)
            .join("\n")
        : "    already in order — nothing to do",
    );
  }
  const closing = String(docs.get("researchPage")!.closing ?? "");
  say(`\n  Research closing (own field, stays last): "${closing.slice(0, 70)}…"`);

  const hero = planHero(docs.get("blogsPage")!, newAsset);
  const extra = Object.keys(hero.before ?? {}).filter((k) => !["_type", "asset", "crop", "hotspot"].includes(k));
  say(`\n  Blogs & Media Page → Design Again (featured) → Hero image (blogsPage.mediaFeatured.heroImage)`);
  say(`    before: ${hero.before?.asset?._ref ?? "(empty)"}; crop ${hero.before?.crop ? "set" : "none"}, hotspot ${hero.before?.hotspot ? "set" : "none"}; other keys: ${extra.length ? extra.join(", ") + " (kept)" : "none (alt on the site = the title)"}`);
  say(
    hero.set || hero.unset.length
      ? `    after:  ${newAsset ?? `(new upload of ${basename(ART)})`}${hero.unset.length ? `; unset ${hero.unset.join(", ")}` : "; no crop / hotspot to reset"}`
      : "    already set — nothing to do",
  );
  return { revs, lists, hero, closing };
}

// ---- art upload (sha1 reuse + retry, as in lib/structure-nov11) -------------

const TRANSIENT = /ECONNRESET|ETIMEDOUT|EPIPE|ECONNABORTED|EAI_AGAIN|socket hang up|HTTP 408|Request Timeout/i;

function checkArt(): string {
  const abs = resolve(ART);
  if (!existsSync(abs)) throw new Error(`missing art: ${abs}`);
  const buf = readFileSync(abs);
  const isPng = buf.subarray(1, 4).toString("ascii") === "PNG";
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  if (!isPng || w !== ART_W || h !== ART_H) throw new Error(`refusing: ${abs} is ${isPng ? `${w} × ${h}` : "not a PNG"}, expected ${ART_W} × ${ART_H} PNG`);
  return createHash("sha1").update(buf).digest("hex");
}

async function findAsset(sha1: string) {
  return client.fetch<string | null>(`*[_type == "sanity.imageAsset" && sha1hash == $sha1][0]._id`, { sha1 });
}

async function uploadArt(sha1: string): Promise<string> {
  const existing = await findAsset(sha1);
  if (existing) {
    console.log(`  = ${basename(ART)} → ${existing} (already in Sanity, no upload)`);
    return existing;
  }
  for (let i = 1; ; i++) {
    try {
      const asset = await client.assets.upload("image", createReadStream(resolve(ART)), { filename: basename(ART) });
      console.log(`  ↑ ${basename(ART)} → ${asset._id}`);
      return asset._id;
    } catch (err) {
      const msg = err instanceof Error ? `${(err as NodeJS.ErrnoException).code ?? ""} ${err.message}` : String(err);
      if (i >= 6 || !TRANSIENT.test(msg)) throw err;
      console.log(`  ↻ ${basename(ART)}: ${msg.trim().slice(0, 120)} — retry ${i}/5`);
      await new Promise((r) => setTimeout(r, 3000 * i));
    }
  }
}

// ---- write -----------------------------------------------------------------

type Mutation = { patch: Record<string, unknown> };

function mutations(p: Plan, newAsset: string): Mutation[] {
  const out: Mutation[] = [];
  const first = new Set<string>();
  const add = (id: string, body: Record<string, unknown>) => {
    const guard = first.has(id) ? {} : { ifRevisionID: p.revs[id] };
    first.add(id);
    out.push({ patch: { id, ...guard, ...body } });
  };
  for (const lp of p.lists) {
    const { field } = lp.spec;
    const byKey = new Map(lp.before.map((it) => [it._key, it]));
    for (const m of lp.moves) {
      add(lp.spec.docId, { unset: [`${field}[_key=="${m.key}"]`] });
      add(lp.spec.docId, { insert: { [m.where]: `${field}[_key=="${m.anchor}"]`, items: [byKey.get(m.key)] } });
    }
  }
  if (p.hero.set || p.hero.unset.length) {
    const body: Record<string, unknown> = {};
    if (p.hero.set) body.set = { "mediaFeatured.heroImage.asset": { _type: "reference", _ref: newAsset } };
    if (p.hero.unset.length) body.unset = p.hero.unset.map((k) => `mediaFeatured.heroImage.${k}`);
    add("blogsPage", body);
  }
  return out;
}

async function main() {
  console.log(`patch-nav-research-build-media-nov25 (${DRY ? "DRY — nothing uploaded or written" : "APPLY"})`);
  const sha1 = checkArt();
  const existing = await findAsset(sha1);
  console.log(`  art: ${resolve(ART)} (${ART_W} × ${ART_H}, sha1 ${sha1}) — ${existing ? `already in Sanity as ${existing}, no upload` : "not in Sanity yet, would upload once"}`);

  const first = await plan(existing, true);
  const n = first.lists.reduce((s, l) => s + l.moves.length, 0);
  const heroChange = first.hero.set || first.hero.unset.length > 0;
  console.log(`\n${n} move(s) in ${first.lists.filter((l) => l.moves.length).length} list(s); podcast art: ${heroChange ? "change" : "already set"}`);
  if (!n && !heroChange) return console.log("nothing to do");
  if (DRY) return console.log(`\ndry run — nothing uploaded or written (re-run without -- --dry to apply)`);

  const asset = heroChange ? await uploadArt(sha1) : existing!;

  // Re-read right before writing; refuse if anything moved since the plan above.
  const p = await plan(asset, false);
  const sig = (x: Plan) => JSON.stringify([x.revs, x.lists.map((l) => [l.before, l.moves]), x.hero.before, x.hero.unset]);
  if (sig(p) !== sig(first)) throw new Error("refusing: the documents changed while planning — run again");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `nav-research-build-media-nov25-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    file,
    JSON.stringify(
      {
        revs: p.revs,
        lists: p.lists.map((l) => ({ _id: l.spec.docId, field: l.spec.field, before: l.before })),
        heroImage: { _id: "blogsPage", path: "mediaFeatured.heroImage", before: p.hero.before },
      },
      null,
      1,
    ),
  );
  console.log(`\nbackup → ${file}`);

  const muts = mutations(p, asset);
  const res = await client.mutate(muts as never, { visibility: "sync" });
  console.log(`✓ committed ${muts.length} mutation(s) in one transaction ${(res as { transactionId?: string }).transactionId ?? ""} at ${new Date().toISOString()}`);

  // Read back: orders match the target, items unchanged apart from position.
  console.log(`\nread back:`);
  const docs = await readDocs();
  let ok = true;
  for (const lp of p.lists) {
    const now = (docs.get(lp.spec.docId)![lp.spec.field] as Item[]) ?? [];
    const orderOk = isDeepStrictEqual(now.map((it) => it._key), lp.target.map((it) => it._key));
    const itemsOk = isDeepStrictEqual(now, lp.target);
    ok &&= orderOk && itemsOk;
    console.log(`  ${lp.spec.label}: ${now.map((it) => name(lp.spec, it)).join(" · ")} — order ${orderOk ? "OK" : "WRONG"}, items ${itemsOk ? "unchanged" : "CHANGED"}`);
  }
  const hero = (docs.get("blogsPage")!.mediaFeatured as { heroImage?: Image }).heroImage;
  const heroOk = hero?.asset?._ref === asset && !hero?.crop && !hero?.hotspot;
  ok &&= heroOk;
  console.log(`  podcast hero image: ${hero?.asset?._ref} — ${heroOk ? "OK" : "WRONG"}; ${JSON.stringify(hero)}`);
  for (const id of DOC_IDS) console.log(`  ${id} rev ${docs.get(id)!._rev}${docs.get(`drafts.${id}`) ? ` (draft drafts.${id} untouched)` : ""}`);
  if (!ok) throw new Error("read-back check failed — see above; restore from the backup");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
