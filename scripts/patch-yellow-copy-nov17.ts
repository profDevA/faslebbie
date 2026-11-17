/**
 * "Yellow Needs Update" (Fas, collab doc → Rules / Questions → Final QA; Nov 16
 * evening call) — the yellow passages that differ from the live site:
 *
 *  1. Home hero (doc HOME tab "Home Page — Final Copy"): "…leadership systems
 *     that enable them. I teach, write, prototype, and advise on design-led
 *     research. These orientations and practices build a feedback loop that
 *     shapes my approach, treating design and research as a risk-reduction
 *     mechanism for product innovation and system transitions." Only the three
 *     plain-text spans change; the seven keyword links stay as they are.
 *     (Not patch-home-final-copy.ts — that one is a whole-document replace.)
 *  2. Teaching intro (doc Teaching tab, "Visible", three paragraphs). The
 *     existing reveal pills stay on Carnegie Mellon, MIT GOV/LAB, SFK
 *     International, Njala University, "learn it, teach it, practice it" and
 *     the PhD one (now on "PhD advisor at InGenius Prep"), and the red
 *     projects / exhibitions actions — same markDefs, same reveal text.
 *     Needs the Nov 17 TeachingContent tweak (reveal before a full stop).
 *
 * Already live (no change): About cycles + family photo, Build tool lists,
 * Research paradigms, students 15–24 that exist. Not here: four students with
 * no images (16, 17, 19, 22), Build descriptions (Fas still rewriting), the
 * Work .txt Galderma draft line, the case-study tabs (old-site source text).
 *
 * Dry by default; `-- --apply` backs up and patches the published documents
 * under ifRevisionId. Refuses if the live text is not the text this was
 * written against. The stale Aug 13 Teaching draft is left alone.
 *
 *   npx sanity exec scripts/patch-yellow-copy-nov17.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client, key } from "./lib/structure-nov11";

type Span = { _key: string; _type: string; marks?: string[]; text?: string };
type Block = { _key: string; _type: string; style?: string; children: Span[]; markDefs: { _key: string; _type: string; kind?: string; expansion?: string }[] };

const HOME_SWAPS: [string, string][] = [
  [
    " the material (minerals), immaterial (AI), and leadership systems that support them. I ",
    " the material (minerals), immaterial (AI), and leadership systems that enable them. I ",
  ],
  [
    ", and advise on design and research. This feedback loop shapes my ",
    ", and advise on design-led research. These orientations and practices build a feedback loop that shapes my ",
  ],
  [
    ", treating design and research as tools to reduce risk in product innovation and long-term system transitions. ",
    ", treating design and research as a risk-reduction mechanism for product innovation and system transitions. ",
  ],
];

const plain = (text: string): Span => ({ _key: key(), _type: "span", marks: [], text });
const marked = (text: string, mark: string): Span => ({ _key: key(), _type: "span", marks: [mark], text });

/** Mark key on the live span with this exact text. */
function markOf(block: Block, text: string): string {
  const s = block.children.find((c) => c.text === text && c.marks?.length === 1);
  if (!s) throw new Error(`teaching intro: no marked span "${text}" — the live copy changed, re-check before applying`);
  return s.marks![0];
}

async function main() {
  console.log(`patch-yellow-copy-nov17 (${APPLY ? "APPLY" : "dry"})`);

  // --- Home ---
  const home = await client.fetch<{ _id: string; _rev: string; hero: Block[] }>(
    `*[_type == "homePage" && !(_id in path("drafts.**"))][0]{ _id, _rev, hero }`,
  );
  if (!home?.hero?.length) throw new Error("homePage.hero not found");
  const hero = structuredClone(home.hero);
  for (const [from, to] of HOME_SWAPS) {
    const span = hero[0].children.find((c) => c.text === from);
    if (!span) throw new Error(`home: span not found "${from.trim()}" — re-check before applying`);
    span.text = to;
  }
  const before = home.hero[0].children.map((c) => c.text).join("");
  const after = hero[0].children.map((c) => c.text).join("");
  console.log(`\n${home._id} (rev ${home._rev}) hero\n  before: ${before}\n  after:  ${after}`);

  // --- Teaching ---
  const teach = await client.fetch<{ _id: string; _rev: string; intro: Block[] }>(
    `*[_type == "teachingPage" && !(_id in path("drafts.**"))][0]{ _id, _rev, intro }`,
  );
  if (teach?.intro?.length !== 3) throw new Error(`teachingPage.intro: expected 3 paragraphs, found ${teach?.intro?.length}`);
  const [p1, p2, p3] = teach.intro;
  const k = {
    cmu: markOf(p1, "Carnegie Mellon"),
    mit: markOf(p1, "MIT GOV/LAB"),
    sfk: markOf(p1, "SFK International"),
    njala: markOf(p1, "Njala University"),
    phd: markOf(p1, "PhD students at InGenius Prep"),
    ltp: markOf(p2, "learn it, teach it, practice it"),
    projects: markOf(p3, "projects"),
    exhibitions: markOf(p3, "exhibitions"),
  };
  const intro: Block[] = [
    {
      ...p1,
      children: [
        plain("I teach design, social innovation, and sustainable transitions in the extractive sector across "),
        marked("Carnegie Mellon", k.cmu),
        plain(", "),
        marked("MIT GOV/LAB", k.mit),
        plain(", "),
        marked("SFK International", k.sfk),
        plain(", and "),
        marked("Njala University", k.njala),
        plain(", and as a "),
        marked("PhD advisor at InGenius Prep", k.phd),
        plain("."),
      ],
    },
    {
      ...p2,
      children: [
        plain(
          "I bring a teaching philosophy rooted in entrepreneurial practice, critique, prototyping, and systems thinking. Knowledge is co-created, not delivered, through active learning, reflective assessment, learning portfolios, and studio-like approaches. I practice a pedagogical structure I call the LTP cycle: ",
        ),
        marked("learn it, teach it, practice it", k.ltp),
        plain(
          ". The work students make should never end with a submission. It should travel into portfolios, exhibitions, communities, and public conversations. Across these settings, students move from ideas into systems, translating research into artifacts, services, and speculative futures.",
        ),
      ],
    },
    {
      ...p3,
      children: [
        plain("Their "),
        marked("projects", k.projects),
        plain(
          " demonstrate how students learn to frame problems, build interventions, and communicate ideas through design. Many of my students have gone on to Google, Apple, and top design firms, entered graduate programs at leading universities, and shown work in ",
        ),
        marked("exhibitions", k.exhibitions),
        plain(" across China, Africa, and the US."),
      ],
    },
  ];
  console.log(`\n${teach._id} (rev ${teach._rev}) intro`);
  teach.intro.forEach((b, i) => {
    console.log(`  before ¶${i + 1}: ${b.children.map((c) => (c.marks?.length ? `[${c.text}]` : c.text)).join("")}`);
    console.log(`  after  ¶${i + 1}: ${intro[i].children.map((c) => (c.marks?.length ? `[${c.text}]` : c.text)).join("")}`);
  });

  if (!APPLY) {
    console.log(`\ndry run — nothing written (re-run with -- --apply)`);
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `yellow-copy-nov17-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify({ home, teach }, null, 1));
  console.log(`\nbackup → ${file}`);
  const r1 = await client.patch(home._id).ifRevisionId(home._rev).set({ hero }).commit();
  console.log(`✓ ${home._id}: hero copy (rev ${r1._rev})`);
  const r2 = await client.patch(teach._id).ifRevisionId(teach._rev).set({ intro }).commit();
  console.log(`✓ ${teach._id}: intro copy (rev ${r2._rev})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
