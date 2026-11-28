/**
 * Israel's close-out tracker (Nov 27), "Hero · Remove the heavy black gradient
 * and update desktop and mobile from Figma": rows 63 DVA, 93 OC Navigator,
 * 106 AR Handbook, 125 Vuforia Chalk, 153 Life of a Miner, 216 Vuforia Editor
 * (row numbers shift as Israel edits — match by study + section).
 * Xian, Nov 27: "you have to export correct images, and have to upload".
 *
 * New hero art from Figma "END DESIGN +DEV 2027" (fr2xqA4MUG62WcbVFQ0xG9),
 * desktop @2x and phone @3x, no title / caption baked in (the site draws them),
 * then `heroSection.imageHasGradient: true` (Studio: Hero → "Images already
 * include the dark gradient") so the site's own dark wash is off.
 *
 *  study                           hero _key      desktop (node → file)                   phone (node → file)
 *  diamond-valuation-ai            d6e88774d06a   6:23384 → 2880 × 1523 (1)               6:25282 → 1179 × 2160 (2)
 *  oc-digital-resource-navigator   89f1516b2f6d   keep (live = 6:41548 pixel for pixel)    6:41633 → 1179 × 2160   [phone bottom LIGHT, see below]
 *  the-ar-handbook                 74a5d75b62e5   keep (live = 6:52229 pixel for pixel)    PICK: 6:52556 (phone page art) | 6:52428 (loose frame)
 *  vuforia-chalk                   c64d2c8ef50e   9:41888 → 2880 × 1800                   9:44574 → 1179 × 2421 (first phone hero: whole-frame layout)
 *  life-of-a-miner-vr              212fc64e2d5a   PICK: keep (live = loose 6:76736) | 6:75137 (1440 page framing, not exported)
 *                                                                                         keep (live = 6:76390 pixel for pixel)
 *  vuforia-expert-capture          e3534510519a   6:142043 → 2880 × 1800                  PICK: 6:165465 (new laptop) | keep (live = page 6:154430)
 *
 * "keep" = the live asset already equals the Figma art (Nov 27 check: mean
 * difference ≤ 1.7 / 255 at 1440 / 393 wide), so it is not uploaded again; the
 * fresh export stays in the folder (`--pick=<slug>.<kind>=<node>` uploads it).
 *
 *  (1) cropped to the 1440 page frame's clip (6:21822 shows 1440 of the
 *      1453-wide frame; drops its right 1 px black edge + a half-covered row).
 *  (2) row 0 was a blue 1/3-px sliver at the frame's top; replaced by row 1.
 *  (exports not used by default, in the folder: OC Navigator desktop 6:41548
 *  2900 × 1796 — last row dropped, the 898.14-tall frame's sliver rendered
 *  grey; AR desktop 6:52229 2880 × 1752; Miner phone 6:76390 1179 × 2160 —
 *  last row was a sliver the bottom gradient doesn't cover, replaced by the
 *  row above.)
 *
 * PICK = two Figma candidates differ; the study is skipped until Xian picks
 * (`-- --pick=ar.mobile=6:52556` or `=6:52428`, `editor.mobile=6:165465` or
 * `=keep`, `miner.desktop=keep`). `keep` leaves that image as it is; the
 * wash still goes off.
 * The Miner page framing (1440 page hero 6:75137, art 48 px lower) is not
 * exported — if Xian wants it, re-export first.
 *
 * Dark bottom (white caption on the art, measured in the export):
 * OC Navigator phone is LIGHT (white-text contrast ~1.5:1; the tablet runs to
 * y 665 of 720, so the site's title lands on it) — `-- --keep-wash=<slug>`
 * uploads the art but leaves the wash on. AR phone and Chalk are borderline.
 *
 * Every hero must still hold the assets it had on Nov 27 (pinned below), with
 * no crop / hotspot, and `imageHasGradient` unset/false — else it refuses (a
 * Studio upload since). A field already at the new value is "already set".
 * Published documents only; an open draft is reported (publishing it would
 * undo this) and left alone. Each file is checked (PNG, exact size) and looked
 * up by sha1 (an asset already in Sanity is reused, no upload).
 *
 * DRY BY DEFAULT (`-- --dry` or no flag): reads only — no upload, no write.
 * `-- --apply`: re-reads (refuses if anything moved), uploads (sha1 reuse,
 * retries a dropped connection), re-reads again, backs up the touched
 * `sections` arrays to ../exports/sanity-backups/, writes one transaction
 * (`ifRevisionID` per document), reads back.
 * Options: `-- --only=<slug|alias>,…` (aliases dva, ocnav, ar, chalk, miner,
 * editor), `-- --pick=…`, `-- --keep-wash=…`,
 * `-- --dir=<folder>` (default ../exports/hero-art-2026-11-27/).
 * Undo: restore the old image in Studio (asset ids printed below) and switch
 * the gradient flag off, or restore from the backup.
 *
 *   npx sanity exec scripts/patch-hero-art-nov27.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-hero-art-nov27.ts --with-user-token -- --apply --only=dva,chalk
 */
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";

import { BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });
const APPLY = process.argv.includes("--apply");
const DRY = !APPLY || process.argv.includes("--dry");
if (APPLY && process.argv.includes("--dry")) throw new Error("pass --dry or --apply, not both");
const DIR = resolve(
  process.argv.find((a) => a.startsWith("--dir="))?.slice("--dir=".length) ??
    join(process.cwd(), "..", "exports", "hero-art-2026-11-27"),
);
const listArg = (name: string) =>
  (process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

// ---------------------------------------------------------------------------

type Kind = "desktop" | "mobile";
type Option = ({ node: string; file: string; size: [number, number]; note: string } | { node: "keep"; keep: true; note: string }) & {
  /** Used when Xian hasn't picked (only where the choice changes nothing on screen). */
  default?: true;
};
type Hero = {
  slug: string;
  alias: string;
  study: string;
  row: string;
  docId: string;
  heroKey: string;
  /** Pinned current asset ids (Nov 27, read 16:00 local). null = no image. */
  cur: Record<Kind, string | null>;
  /** One option = settled; more = the `default` one, or Xian picks (`--pick=<slug>.<kind>=<node>`). */
  art: Record<Kind, Option[]>;
  /** Printed with the plan. */
  notes: string[];
};

const HEROES: Hero[] = [
  {
    slug: "diamond-valuation-ai",
    alias: "dva",
    study: "Diamond Valuation AI",
    row: "63",
    docId: "cs-diamond-valuation-ai",
    heroKey: "d6e88774d06a",
    cur: {
      desktop: "image-6be1508da71aedf3ad2afca454f3f98ff3817b94-2878x1752-png",
      mobile: "image-1f6182f216230661b773868ce5f3e435f9291783-1179x2419-png",
    },
    art: {
      desktop: [{ node: "6:23384", file: "diamond-valuation-ai-desktop.png", size: [2880, 1523], note: "Xian's link; cropped to the 1440 page clip" }],
      mobile: [{ node: "6:25282", file: "diamond-valuation-ai-mobile.png", size: [1179, 2160], note: "Xian's link (SLC_MV_Hero.Jpg)" }],
    },
    notes: ["desktop hero 876 → 755 tall at 1440 (new art is 1440 × 761.5)", "phone 393 × 807 → 393 × 720"],
  },
  {
    slug: "oc-digital-resource-navigator",
    alias: "ocnav",
    study: "OC Navigator",
    row: "93",
    docId: "cs-oc-digital-resource-navigator",
    heroKey: "89f1516b2f6d",
    cur: {
      desktop: "image-08d6755e5423fa0aa435e8be7d68bb112d16d197-4350x2695-png",
      mobile: "image-05aa1153e61634f8e44bdbb4056e4dd2bea29ffe-1179x2421-png",
    },
    art: {
      desktop: [
        { node: "keep", keep: true, default: true, note: "live art = Figma 6:41548 / 1440 page hero 6:39880 pixel for pixel (mean diff 1.7 / 255)" },
        { node: "6:41548", file: "oc-digital-resource-navigator-desktop.png", size: [2900, 1796], note: "fresh @2x export of the same art" },
      ],
      mobile: [{ node: "6:41633", file: "oc-digital-resource-navigator-mobile.png", size: [1179, 2160], note: "= phone page hero 6:41731 (tablet higher than live)" }],
    },
    notes: [
      "PHONE BOTTOM IS LIGHT: the site's title + tagline land on the tablet / light rocks (white-text contrast ~1.5:1). The Figma phone page draws no title on the hero. Consider --keep-wash=ocnav or ask Israel.",
    ],
  },
  {
    slug: "the-ar-handbook",
    alias: "ar",
    study: "AR Handbook",
    row: "106",
    docId: "cs-remote-assistant-object-detection",
    heroKey: "74a5d75b62e5",
    cur: {
      desktop: "image-235df4c232618d6976e93c1e1209f9444991e8e5-4320x2628-png",
      mobile: "image-ab97e4cff94ae42783e4ebadfbc86a4baa063a67-1179x2421-png",
    },
    art: {
      desktop: [
        { node: "keep", keep: true, default: true, note: "live art = Figma 6:52229 / 1440 page hero 6:49961 pixel for pixel (mean diff 0.6 / 255)" },
        { node: "6:52229", file: "the-ar-handbook-desktop.png", size: [2880, 1752], note: "fresh @2x export of the same art" },
      ],
      mobile: [
        { node: "6:52556", file: "the-ar-handbook-mobile.png", size: [1179, 2160], note: "art layer of the phone page hero 6:52555 (devices at y 343, title fits below) — RECOMMENDED" },
        { node: "6:52428", file: "the-ar-handbook-mobile-alt-6-52428.png", size: [1179, 2160], note: "loose SLC_MV_Hero.Jpg (devices at y 404 = live; the site's title overlaps the tablet)" },
      ],
    },
    notes: ["phone bottom borderline for white text (contrast ~4.6:1 mean)"],
  },
  {
    slug: "vuforia-chalk",
    alias: "chalk",
    study: "Vuforia Chalk",
    row: "125",
    docId: "cs-vuforia-chalk",
    heroKey: "c64d2c8ef50e",
    cur: {
      desktop: "image-0c7e2ebfe9f35e2513467f0f18e7cc89a3671c57-4320x2700-png",
      mobile: null,
    },
    art: {
      desktop: [{ node: "9:41888", file: "vuforia-chalk-desktop.png", size: [2880, 1800], note: "loose frame; the 1440 page hero 9:39524 is the same art 8 px higher with an 8 px light strip at its bottom" }],
      mobile: [{ node: "9:44574", file: "vuforia-chalk-mobile.png", size: [1179, 2421], note: "= phone page hero 9:42069 minus its title (new stacked layout)" }],
    },
    notes: [
      "first phone hero: 393 × 807 → the site switches to the whole-frame phone layout (src/lib/mobileHeroLayout.ts) and shows the desktop art from 768 instead of 1024",
      "caption bottom borderline for white text (contrast ~4.8:1 mean desktop / ~4.9:1 phone)",
    ],
  },
  {
    slug: "life-of-a-miner-vr",
    alias: "miner",
    study: "Life of a Miner",
    row: "153",
    docId: "cs-life-of-a-miner-vr",
    heroKey: "212fc64e2d5a",
    cur: {
      desktop: "image-ea221bd67e200f80601a1c882f026acfc07684f2-4320x2628-png",
      mobile: "image-90ea676a3717e1515c45f717947ed8558c7b5660-1179x2160-png",
    },
    art: {
      desktop: [
        { node: "keep", keep: true, note: "live art = loose frame 6:76736 pixel for pixel (mean diff 0.7 / 255); the 1440 page hero 6:75137 shows the same art 48 px lower" },
        { node: "6:76736", file: "life-of-a-miner-vr-desktop.png", size: [2880, 1752], note: "fresh @2x export of the loose frame (= live)" },
        { node: "6:75137", file: "", size: [0, 0], note: "1440 page framing — NOT EXPORTED (re-export first if Xian picks it)" },
      ],
      mobile: [
        { node: "keep", keep: true, default: true, note: "live art = Figma 6:76390 / phone page hero 6:75811 pixel for pixel (mean diff 0.7 / 255)" },
        { node: "6:76390", file: "life-of-a-miner-vr-mobile.png", size: [1179, 2160], note: "fresh @3x export of the same art" },
      ],
    },
    notes: ["desktop and phone art already = Figma; this row is the wash (and the desktop framing question)"],
  },
  {
    slug: "vuforia-expert-capture",
    alias: "editor",
    study: "Vuforia Editor",
    row: "216",
    docId: "cs-vuforia-expert-capture",
    heroKey: "e3534510519a",
    cur: {
      desktop: "image-eae2bba5b65d572b69bc92b7564d48f60814de63-4320x2700-png",
      mobile: "image-63c2b31d6a46603828fc7c38e17aac8e687e39c5-1179x2160-png",
    },
    art: {
      desktop: [{ node: "6:142043", file: "vuforia-expert-capture-desktop.png", size: [2880, 1800], note: "= 1440 page hero 8:27479 minus its title (new laptop screen UI)" }],
      mobile: [
        { node: "6:165465", file: "vuforia-expert-capture-mobile.png", size: [1179, 2160], note: "loose frame: the new editable laptop, matches the desktop UI — RECOMMENDED" },
        { node: "keep", keep: true, note: "keep the live phone art (= phone page hero 6:154430: older laptop image)" },
      ],
    },
    notes: [],
  },
];

const ALIASES = new Map(HEROES.flatMap((h) => [[h.slug, h.slug], [h.alias, h.slug]] as [string, string][]));
const toSlug = (s: string) => {
  const slug = ALIASES.get(s);
  if (!slug) throw new Error(`unknown study "${s}" (use ${HEROES.map((h) => h.alias).join(", ")} or the slug)`);
  return slug;
};
const ONLY = new Set(listArg("only").map(toSlug));
const KEEP_WASH = new Set(listArg("keep-wash").map(toSlug));
const PICKS = new Map<string, string>();
for (const p of listArg("pick")) {
  const m = p.match(/^([\w-]+)\.(desktop|mobile)=(.+)$/);
  if (!m) throw new Error(`--pick: "${p}" — use <slug|alias>.<desktop|mobile>=<node|keep>`);
  const hero = HEROES.find((h) => h.slug === toSlug(m[1]))!;
  const opts = hero.art[m[2] as Kind];
  if (!opts.some((o) => o.node === m[3]))
    throw new Error(`--pick: ${hero.slug}.${m[2]} has no option ${m[3]} (${opts.map((o) => o.node).join(" | ")})`);
  PICKS.set(`${hero.slug}.${m[2]}`, m[3]);
}
const selected = HEROES.filter((h) => ONLY.size === 0 || ONLY.has(h.slug));

// ---------------------------------------------------------------------------

type ImageField = { _type?: string; asset?: { _ref?: string }; crop?: unknown; hotspot?: unknown } & Record<string, unknown>;
type Section = { _key: string; _type: string; image?: ImageField | null; imageMobile?: ImageField | null; imageHasGradient?: boolean | null } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; slug?: string; sections?: Section[] | null };
type FileInfo = { file: string; abs: string; w: number; h: number; bytes: number; sha1: string };
type Step = {
  hero: Hero;
  kind: Kind | "flag";
  path: string;
  before: unknown;
  /** asset sha1 file for images; boolean for the flag */
  file?: FileInfo;
  after?: unknown;
  label: string;
};
type Plan = { steps: Step[]; already: string[]; problems: string[]; waiting: string[]; revs: Record<string, string>; sections: Record<string, Section[]> };

const mb = (n: number) => `${(n / 1e6).toFixed(1)} MB`;
const refOf = (img: ImageField | null | undefined) => img?.asset?._ref ?? null;
const FIELD: Record<Kind, "image" | "imageMobile"> = { desktop: "image", mobile: "imageMobile" };
const STUDIO: Record<Kind | "flag", string> = {
  desktop: "Hero → Hero image",
  mobile: "Hero → Hero image (mobile)",
  flag: "Hero → Images already include the dark gradient",
};

const fileCache = new Map<string, FileInfo>();
function readFile(file: string, [W, H]: [number, number]): FileInfo {
  const hit = fileCache.get(file);
  if (hit) return hit;
  const abs = join(DIR, file);
  if (!existsSync(abs)) throw new Error(`missing file: ${abs}`);
  const buf = readFileSync(abs);
  const isPng = buf.subarray(1, 4).toString("ascii") === "PNG";
  const w = isPng ? buf.readUInt32BE(16) : 0;
  const h = isPng ? buf.readUInt32BE(20) : 0;
  if (!isPng || w !== W || h !== H) throw new Error(`refusing: ${abs} is ${isPng ? `${w} × ${h}` : "not a PNG"}, expected ${W} × ${H} PNG`);
  const info = { file, abs, w, h, bytes: statSync(abs).size, sha1: createHash("sha1").update(buf).digest("hex") };
  fileCache.set(file, info);
  return info;
}

async function findAsset(sha1: string) {
  return client.fetch<string | null>(`*[_type == "sanity.imageAsset" && sha1hash == $sha1][0]._id`, { sha1 });
}

const TRANSIENT = /ECONNRESET|ETIMEDOUT|EPIPE|ECONNABORTED|EAI_AGAIN|socket hang up|HTTP 408|Request Timeout/i;

/** APPLY ONLY. Reuses an asset with the same sha1; retries a dropped connection. */
async function upload(f: FileInfo): Promise<string> {
  if (!APPLY || DRY) throw new Error("internal: upload called outside --apply");
  const existing = await findAsset(f.sha1);
  if (existing) {
    console.log(`  = ${f.file} → ${existing} (already in Sanity, no upload)`);
    return existing;
  }
  for (let i = 1; ; i++) {
    try {
      const asset = await client.assets.upload("image", createReadStream(f.abs), { filename: f.file });
      console.log(`  ↑ ${f.file} (${mb(f.bytes)}) → ${asset._id}`);
      return asset._id;
    } catch (err) {
      const msg = err instanceof Error ? `${(err as NodeJS.ErrnoException).code ?? ""} ${err.message}` : String(err);
      if (i >= 6 || !TRANSIENT.test(msg)) throw err;
      console.log(`  ↻ ${f.file}: ${msg.trim().slice(0, 120)} — retry ${i}/5`);
      await new Promise((r) => setTimeout(r, 3000 * i));
    }
  }
}

async function readDocs(): Promise<Doc[]> {
  const ids = HEROES.flatMap((h) => [h.docId, `drafts.${h.docId}`]);
  return client.fetch<Doc[]>(`*[_id in $ids]{ _id, _rev, "slug": slug.current, sections }`, { ids });
}

/** The option to use for one image, or null while Xian hasn't picked. */
function chosen(h: Hero, kind: Kind): Option | null {
  const opts = h.art[kind];
  if (opts.length === 1) return opts[0];
  const pick = PICKS.get(`${h.slug}.${kind}`);
  return pick ? opts.find((o) => o.node === pick)! : (opts.find((o) => o.default) ?? null);
}

async function plan(log: boolean, sha: Map<string, string | null>): Promise<Plan> {
  const say = (s: string) => log && console.log(s);
  const all = await readDocs();
  const steps: Step[] = [];
  const already: string[] = [];
  const problems: string[] = [];
  const waiting: string[] = [];
  const revs: Record<string, string> = {};
  const sections: Record<string, Section[]> = {};
  const refuse = (id: string, msg: string) => {
    problems.push(`[${id}] ${msg}`);
    say(`    REFUSED: ${msg}`);
  };

  for (const h of HEROES) {
    const on = selected.includes(h);
    say(`\n— ${h.study} (${h.slug}) · row ${h.row}${on ? "" : "  (not selected by --only)"}`);
    if (!on) continue;
    const doc = all.find((d) => d._id === h.docId);
    const draft = all.find((d) => d._id === `drafts.${h.docId}`);
    if (!doc) {
      refuse(h.slug, `${h.docId} not found`);
      continue;
    }
    if (doc.slug !== h.slug) {
      refuse(h.slug, `${h.docId} has slug ${doc.slug}, expected ${h.slug}`);
      continue;
    }
    const heroes = (doc.sections ?? []).filter((s) => s._key === h.heroKey);
    if (heroes.length !== 1 || heroes[0]._type !== "heroSection") {
      refuse(h.slug, `${heroes.length} section(s) with _key ${h.heroKey}${heroes[0] ? ` (${heroes[0]._type})` : ""}, expected one heroSection`);
      continue;
    }
    const sec = heroes[0];
    say(`    ${doc._id} rev ${doc._rev} · heroSection ${h.heroKey}${draft ? ` · DRAFT drafts.${h.docId} rev ${draft._rev}` : ""}`);
    for (const n of h.notes) say(`    note: ${n}`);

    // pending picks: the whole study waits (the wash flag covers both images)
    const pending = (["desktop", "mobile"] as Kind[]).filter((k) => !chosen(h, k));
    if (pending.length) {
      for (const k of pending) {
        say(`    ${k}: WAITING FOR XIAN'S PICK — options:`);
        for (const o of h.art[k]) say(`      --pick=${h.alias}.${k}=${o.node}   ${o.note}`);
      }
      waiting.push(`${h.slug}: ${pending.map((k) => `${k} (${h.art[k].map((o) => o.node).join(" | ")})`).join(", ")}`);
    }
    const local: Step[] = [];
    let bad = false;
    for (const kind of ["desktop", "mobile"] as Kind[]) {
      const field = FIELD[kind];
      const img = sec[field] ?? null;
      const cur = refOf(img);
      const opt = chosen(h, kind);
      const path = `sections[_key=="${h.heroKey}"].${field}`;
      if (!opt) {
        say(`    ${kind}: now ${cur ?? "(none)"} — waiting`);
        continue;
      }
      if ("keep" in opt) {
        if (cur !== h.cur[kind]) {
          refuse(h.slug, `${path} is ${cur ?? "(none)"}, expected ${h.cur[kind] ?? "(none)"} (Studio edit since Nov 27?)`);
          bad = true;
        } else say(`    ${kind}: keep ${cur ?? "(none)"} — ${opt.note}`);
        continue;
      }
      if (!opt.file) {
        refuse(h.slug, `${kind} option ${opt.node} has no exported file yet`);
        bad = true;
        continue;
      }
      const f = readFile(opt.file, opt.size);
      if (!sha.has(f.sha1)) sha.set(f.sha1, await findAsset(f.sha1));
      const existing = sha.get(f.sha1) ?? null;
      if (existing && cur === existing) {
        say(`    ${kind}: already set (${cur})`);
        already.push(`${h.slug}.${kind}`);
        continue;
      }
      if (cur !== h.cur[kind]) {
        refuse(h.slug, `${path} is ${cur ?? "(none)"}, expected ${h.cur[kind] ?? "(none)"} (Studio edit since Nov 27?)`);
        bad = true;
        continue;
      }
      if (img && (img.crop || img.hotspot)) {
        refuse(h.slug, `${path} has a crop / hotspot now — check in Studio first`);
        bad = true;
        continue;
      }
      say(`    ${kind}: ${STUDIO[kind]}`);
      say(`      now   ${cur ?? "(none)"}`);
      say(`      new   Figma ${opt.node} → ${f.file} ${f.w} × ${f.h}, ${mb(f.bytes)}, sha1 ${f.sha1.slice(0, 12)}… — ${existing ? `already in Sanity as ${existing} (reuse, no upload)` : "would UPLOAD (new asset)"}`);
      say(`      (${opt.note})`);
      local.push({ hero: h, kind, path, before: img, file: f, label: `${h.heroKey}.${field}` });
    }
    // the wash flag
    const flagPath = `sections[_key=="${h.heroKey}"].imageHasGradient`;
    const flagNow = sec.imageHasGradient ?? null;
    if (KEEP_WASH.has(h.slug)) {
      say(`    flag: imageHasGradient stays ${String(flagNow)} (--keep-wash: the site keeps its dark wash)`);
    } else if (flagNow === true) {
      say(`    flag: already set (imageHasGradient true)`);
      already.push(`${h.slug}.flag`);
    } else if (flagNow !== null && flagNow !== false) {
      refuse(h.slug, `${flagPath} is ${JSON.stringify(flagNow)}, expected unset / false`);
      bad = true;
    } else if (!pending.length) {
      say(`    flag: ${STUDIO.flag}: ${String(flagNow)} → true (our dark wash off, desktop + phone)`);
      local.push({ hero: h, kind: "flag", path: flagPath, before: flagNow, after: true, label: `${h.heroKey}.imageHasGradient` });
    }
    if (draft) {
      const dsec = (draft.sections ?? []).find((s) => s._key === h.heroKey);
      say(`    DRAFT: drafts.${h.docId} exists — left alone; publishing it later would ${dsec ? "put back its hero values (undo this)" : "drop the hero section"}`);
    }
    if (pending.length || bad || !local.length) continue;
    steps.push(...local);
    revs[doc._id] = doc._rev;
    sections[doc._id] = doc.sections ?? [];
  }
  return { steps, already, problems, waiting, revs, sections };
}

const sig = (p: Plan) => JSON.stringify([p.revs, p.steps.map((s) => [s.hero.docId, s.path, s.before, s.file?.sha1 ?? s.after])]);

async function main() {
  console.log(
    `patch-hero-art-nov27 (${DRY ? "DRY — no upload, nothing written" : "APPLY"}) · dir ${DIR}` +
      `${ONLY.size ? ` · only ${[...ONLY].join(", ")}` : ""}${PICKS.size ? ` · pick ${[...PICKS].map(([k, v]) => `${k}=${v}`).join(", ")}` : ""}` +
      `${KEEP_WASH.size ? ` · keep wash ${[...KEEP_WASH].join(", ")}` : ""}`,
  );
  const sha = new Map<string, string | null>();
  const first = await plan(true, sha);

  const docs = new Set(first.steps.map((s) => s.hero.docId));
  const files = [...new Map(first.steps.filter((s) => s.file).map((s) => [s.file!.sha1, s.file!])).values()];
  const toUpload = files.filter((f) => !sha.get(f.sha1));
  console.log(`\n— Summary: ${first.steps.length} field(s) in ${docs.size} document(s); already set: ${first.already.length}`);
  for (const s of first.steps)
    console.log(
      `  ${s.hero.study.padEnd(21)} ${s.label.padEnd(32)} ${s.kind === "flag" ? `${String(s.before)} → true` : `${refOf(s.before as ImageField) ?? "(none)"} → ${s.file!.file} (${s.file!.w} × ${s.file!.h})`}`,
    );
  console.log(`  files: ${files.length} (${toUpload.length} new upload(s), ${mb(toUpload.reduce((n, f) => n + f.bytes, 0))}; ${files.length - toUpload.length} reused by sha1)`);
  if (first.waiting.length) {
    console.log(`\n— Waiting for Xian's pick (skipped): ${first.waiting.length}`);
    for (const w of first.waiting) console.log(`  - ${w}`);
  }
  if (first.problems.length) {
    console.log(`\n— REFUSED (${first.problems.length}) — nothing is written until each is resolved or left out with --only`);
    for (const m of first.problems) console.log(`  - ${m}`);
    if (!DRY) throw new Error(`refusing: ${first.problems.length} item(s) not as expected (see above)`);
  }
  if (!first.steps.length) return console.log("\nnothing to do");
  if (DRY) return console.log(`\ndry run — no upload, nothing written (re-run with -- --apply to upload + write; production)`);

  // Re-read before uploading; refuse if anything moved.
  if (sig(await plan(false, sha)) !== sig(first)) throw new Error("refusing: the documents changed while planning — run again");

  console.log(`\nuploads:`);
  const assetBySha = new Map<string, string>();
  for (const f of files) assetBySha.set(f.sha1, await upload(f));

  // Re-read again right before writing.
  const p = await plan(false, sha);
  if (sig(p) !== sig(first)) throw new Error("refusing: the documents changed during the uploads — nothing written; run again (uploads are reused by sha1)");

  mkdirSync(BACKUPS, { recursive: true });
  const backup = join(BACKUPS, `hero-art-nov27-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    backup,
    JSON.stringify(
      {
        revs: p.revs,
        changes: p.steps.map((s) => ({ _id: s.hero.docId, path: s.path, before: s.before ?? null, after: s.kind === "flag" ? true : assetBySha.get(s.file!.sha1) })),
        sectionsBefore: p.sections,
      },
      null,
      1,
    ),
  );
  console.log(`\nbackup (whole sections arrays) → ${backup}`);

  const valueOf = (s: Step) =>
    s.kind === "flag" ? true : { _type: "image", asset: { _type: "reference", _ref: assetBySha.get(s.file!.sha1)! } };
  const muts = [...docs].map((id) => ({
    patch: { id, ifRevisionID: p.revs[id], set: Object.fromEntries(p.steps.filter((s) => s.hero.docId === id).map((s) => [s.path, valueOf(s)])) },
  }));
  const res = await client.mutate(muts as never, { visibility: "sync" });
  console.log(`✓ committed ${p.steps.length} field(s) in ${docs.size} document(s), transaction ${(res as { transactionId?: string }).transactionId ?? ""} at ${new Date().toISOString()}`);

  console.log(`\nread back:`);
  const now = new Map((await readDocs()).map((d) => [d._id, d]));
  let ok = true;
  for (const s of p.steps) {
    const sec = (now.get(s.hero.docId)?.sections ?? []).find((x) => x._key === s.hero.heroKey);
    const v = s.kind === "flag" ? sec?.imageHasGradient : sec?.[FIELD[s.kind]];
    const good = isDeepStrictEqual(v, valueOf(s));
    ok &&= good;
    console.log(`  ${good ? "OK   " : "WRONG"} ${s.hero.docId} ${s.label}: ${JSON.stringify(v)?.slice(0, 110)}`);
  }
  for (const id of docs) console.log(`  ${id} rev ${now.get(id)!._rev}${now.get(`drafts.${id}`) ? ` (draft drafts.${id} untouched)` : ""}`);
  if (!ok) throw new Error("read-back check failed — see above; restore from the backup");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
