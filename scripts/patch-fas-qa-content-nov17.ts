/**
 * Fas's Final QA notes in the collaboration doc (tab "Rules / Questions",
 * items added around the Nov 16 evening call) — the content edits:
 *
 *  #17 Research, first area: drop "that center local knowledge and agency over
 *      extraction and profit"; remove the numbering on the area titles
 *      ("01 — Minerals…", "02 —", "03 —": "the other pages, like Approach,
 *      don't have this numbering system").
 *  #16 Approach: keep "let's talk" at the end, remove the red "Get in touch"
 *      at the end of the "I engage through…" paragraph.
 *  #11 Build: "we're missing SenseSpace, or it's not highlighted" — the intro
 *      names "SenseSpace AI" as plain text; it becomes a red link to the
 *      project like Pebble / Leoney / Gradstudio / DeepSoCal / Mineral Pulse.
 *  (#18 Teaching wording is NOT in this patch — waiting for Fas's wording.)
 *
 * Each edit refuses if the live text isn't what this was written against.
 * Dry by default; `-- --apply` backs up and patches the published documents
 * under ifRevisionId (no drafts exist for these documents on Nov 17).
 *
 *   npx sanity exec scripts/patch-fas-qa-content-nov17.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client, key } from "./lib/structure-nov11";

type Span = { _key: string; _type: string; marks?: string[]; text?: string };
type MarkDef = { _key: string; _type: string } & Record<string, unknown>;
type Block = { _key: string; _type: string; children: Span[]; markDefs?: MarkDef[] } & Record<string, unknown>;
type Doc = { _id: string; _rev: string } & Record<string, unknown>;

const show = (b: Block) => b.children.map((c) => (c.marks?.length ? `[${c.text}]` : c.text)).join("");

function must<T>(v: T | undefined | null, what: string): T {
  if (v == null) throw new Error(`${what} not found — the live content changed; re-check before applying`);
  return v;
}

async function main() {
  console.log(`patch-fas-qa-content-nov17 (${APPLY ? "APPLY" : "dry"})`);
  const plans: { doc: Doc; sets: Record<string, unknown>; label: string }[] = [];

  // --- #17 Research ---
  const research = must(
    await client.fetch<Doc & { areas: { _key: string; kicker: string; body: Block[] }[] }>(
      `*[_type == "researchPage" && !(_id in path("drafts.**"))][0]{ _id, _rev, areas }`,
    ),
    "researchPage",
  );
  {
    const sets: Record<string, unknown> = {};
    for (const a of research.areas) {
      const next = a.kicker.replace(/^\s*\d+\s*[—–-]\s*/, "");
      if (next !== a.kicker) {
        sets[`areas[_key=="${a._key}"].kicker`] = next;
        console.log(`\nresearch kicker: "${a.kicker}" → "${next}"`);
      }
    }
    const first = research.areas[0];
    const PHRASE = " that center local knowledge and agency over extraction and profit";
    const bi = first.body.findIndex((b) => b._type === "block" && b.children.some((c) => c.text?.includes(PHRASE)));
    const blk = must(first.body[bi] as Block | undefined, `research phrase "${PHRASE.trim()}"`);
    const ci = blk.children.findIndex((c) => c.text?.includes(PHRASE));
    const before = show(blk);
    const child = { ...blk.children[ci], text: blk.children[ci].text!.replace(PHRASE, "") };
    sets[`areas[_key=="${first._key}"].body[_key=="${blk._key}"].children[_key=="${child._key}"].text`] = child.text;
    console.log(`research area 1:\n  before: ${before}\n  after:  ${show({ ...blk, children: blk.children.map((c, i) => (i === ci ? child : c)) })}`);
    plans.push({ doc: research, sets, label: "Research numbers + phrase" });
  }

  // --- #16 Approach ---
  const approach = must(await client.fetch<Doc & { sections: unknown[] }>(`*[_type == "leadershipPage" && !(_id in path("drafts.**"))][0]`), "leadershipPage");
  {
    let found: { path: string; blk: Block } | null = null;
    const walk = (o: unknown, p: string) => {
      if (found) return;
      if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${p}[${x && typeof x === "object" && "_key" in x ? `_key=="${(x as { _key: string })._key}"` : i}]`));
      else if (o && typeof o === "object") {
        const b = o as Block;
        if (b._type === "block" && b.children?.some((c) => c.text === "Get in touch")) found = { path: p, blk: b };
        else for (const [k, v] of Object.entries(o)) if (v && typeof v === "object") walk(v, p ? `${p}.${k}` : k);
      }
    };
    walk(approach.sections, "sections");
    const f = must(found as { path: string; blk: Block } | null, `Approach "Get in touch"`);
    const gi = f.blk.children.findIndex((c) => c.text === "Get in touch");
    const markKey = f.blk.children[gi].marks?.[0];
    const children = f.blk.children.filter((_, i) => i !== gi);
    const prev = children[gi - 1];
    if (prev?.text) children[gi - 1] = { ...prev, text: prev.text.replace(/\s+$/, "") };
    const markDefs = (f.blk.markDefs ?? []).filter((m) => m._key !== markKey);
    console.log(`\napproach:\n  before: ${show(f.blk)}\n  after:  ${show({ ...f.blk, children })}`);
    plans.push({ doc: approach, sets: { [`${f.path}.children`]: children, [`${f.path}.markDefs`]: markDefs }, label: "Approach Get in touch" });
  }

  // --- #11 Build: link SenseSpace AI ---
  const build = must(await client.fetch<Doc & { intro: Block[] }>(`*[_type == "buildPage" && !(_id in path("drafts.**"))][0]{ _id, _rev, intro }`), "buildPage");
  {
    const bi = build.intro.findIndex((b) => b.children?.some((c) => !c.marks?.length && c.text?.includes("SenseSpace AI")));
    const blk = must(build.intro[bi] as Block | undefined, "Build intro plain \"SenseSpace AI\"");
    const ci = blk.children.findIndex((c) => !c.marks?.length && c.text?.includes("SenseSpace AI"));
    const t = blk.children[ci].text!;
    const at = t.indexOf("SenseSpace AI");
    const mk = key();
    const children = [
      ...blk.children.slice(0, ci),
      { ...blk.children[ci], text: t.slice(0, at) },
      { _key: key(), _type: "span", marks: [mk], text: "SenseSpace AI" },
      { _key: key(), _type: "span", marks: [], text: t.slice(at + "SenseSpace AI".length) },
      ...blk.children.slice(ci + 1),
    ].filter((c) => c.text !== "");
    const markDefs = [...(blk.markDefs ?? []), { _key: mk, _type: "ref", targetId: "sensespace-ai" }];
    console.log(`\nbuild intro:\n  before: ${show(blk)}\n  after:  ${show({ ...blk, children })}`);
    plans.push({ doc: build, sets: { [`intro[_key=="${blk._key}"].children`]: children, [`intro[_key=="${blk._key}"].markDefs`]: markDefs }, label: "Build SenseSpace link" });
  }

  // #18 Teaching wording ("across China, Africa, and the US") — left out on
  // Nov 17: the proposed "in China, Sierra Leone, and the US" is not confirmed
  // by Fas. Change it in Studio (Teaching → Intro) once he picks the wording.

  if (!APPLY) {
    console.log(`\ndry run — nothing written (re-run with -- --apply)`);
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `fas-qa-content-nov17-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => p.doc), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const { doc, sets, label } of plans) {
    const res = await client.patch(doc._id).ifRevisionId(doc._rev).set(sets).commit();
    console.log(`✓ ${doc._id}: ${label} (rev ${res._rev})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
