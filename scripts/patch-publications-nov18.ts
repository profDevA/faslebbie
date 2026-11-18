/**
 * Publications = the GREEN list in the collaboration doc's PUBLICATIONS tab
 * (Fas, Nov 18 call: "the publication page should only have the stuff on the
 * green… only two categories, Articles and Papers and Books… we're getting rid
 * of this journal… we have to put the link somehow, each one"; doc export
 * `faslebbie + Xiang Collaboration SITE FINAL COPY (3).docx`, paras 5–42,
 * highlight #D9EAD3).
 *
 *  - Articles & Papers (Studio list `currentProjects`, shown as "Articles &
 *    Papers" since the Nov 18 code): replaced by the 7 green rows, doc order,
 *    with the doc's tag lines, year / "In Progress", and link text + URL where
 *    the doc has one (CMU award record, Read publication, View magazine issue).
 *  - Books: Fas in the call — "it removed this… let's still put this… put two
 *    of it" — so "Souvenirs of my Awakening, Memoir" stays exactly as it is
 *    (the doc's private notes move it to an archive; Fas's spoken ask wins —
 *    flagged to Xian). "Mineral Choreography: Extraction Sites Vol 1" takes the
 *    green wording: title "…Vol. 1", tag "Book project · Mineral transitions
 *    and extractive systems", status "In Development"; its cover stays.
 *  - Journals: not shown on the site since the Nov 18 code; the Studio list is
 *    left untouched (nothing deleted).
 *
 * Dry by default; `-- --apply` backs up blogsPage and patches it under
 * ifRevisionId (no draft exists on Nov 18). Refuses if the Books list no
 * longer has the two expected rows.
 *
 *   npx sanity exec scripts/patch-publications-nov18.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client, key } from "./lib/structure-nov11";

type Row = { _key: string; _type?: string; title?: string; tag?: string | null; year?: string | null; href?: string | null; linkLabel?: string | null };

const ARTICLES: Omit<Row, "_key">[] = [
  {
    title: "Africa Mineral Pulse: Designing Agency in Africa’s Extractive Economies",
    tag: "Award-winning research paper · #NewMacy Cybernetics Prize, Carnegie Mellon University (joint first place)",
    year: "2025",
    linkLabel: "CMU award record",
    href: "https://www.architecture.cmu.edu/news/f25-awards-recipients",
  },
  {
    title: "Peace, Hope and Prosperity through Diamond Cutting in Sierra Leone",
    tag: "Gems&Jewellery · Volume 32, Issue 2 · Co-authored with Maarten de Witte",
    year: "2023",
    linkLabel: "Read publication",
    href: "https://gem-a.com/wp-content/uploads/2023/08/GJ-Summer-2023.pdf",
  },
  {
    title: "Storied Ontologies: The Power of Storytelling to Shape Culture, Marketplace, and Consumer Behavior",
    tag: "Initiatives in Art and Culture",
    year: "2022",
  },
  {
    title: "Creating Climate Justice",
    tag: "Parsons re:D Magazine · The New School",
    year: "2022",
    linkLabel: "View magazine issue",
    href: "https://issuu.com/newschool/docs/parsons-red-2022",
  },
  {
    title: "Designing Co-Design Infrastructure: From Makerspaces to Community Agency",
    tag: "Proposed research essay · Root Foundation",
    year: "In Progress",
  },
  {
    title: "AI as Raw Materials for Design",
    tag: "Research manuscript · AI as design material",
    year: "In Progress",
  },
  {
    title: "Mineral Choreography: A Post-Extractive Design for Transition",
    tag: "Research manuscript · Post-extractive design and mineral transitions",
    year: "In Progress",
  },
];

const show = (r: Row) => `${r.title} | ${r.tag ?? ""} | ${r.year ?? ""}${r.linkLabel ? ` | [${r.linkLabel}] ${r.href}` : ""}`;

async function main() {
  console.log(`patch-publications-nov18 (${APPLY ? "APPLY" : "dry"})`);
  const doc = await client.fetch<{ _id: string; _rev: string; currentProjects?: Row[]; books?: (Row & { cover?: unknown })[] } | null>(
    `*[_type == "blogsPage" && !(_id in path("drafts.**"))][0]{ _id, _rev, currentProjects, books }`,
  );
  if (!doc) throw new Error("blogsPage not found");
  const draft = await client.fetch<string | null>(`*[_id == "drafts." + $id][0]._id`, { id: doc._id });
  if (draft) throw new Error(`a draft exists (${draft}) — publish or discard it in Studio first`);

  const books = doc.books ?? [];
  const souvenirs = books.find((b) => b.title?.startsWith("Souvenirs of my Awakening"));
  const mineral = books.find((b) => b.title?.startsWith("Mineral Choreography: Extraction Sites"));
  if (!souvenirs || !mineral || books.length !== 2) throw new Error(`expected the two live books, found: ${books.map((b) => b.title).join(" / ")}`);

  const articles = ARTICLES.map((a) => ({ _type: "publicationItem", _key: key(), ...a }));
  const nextBooks = books.map((b) =>
    b._key === mineral._key
      ? { ...b, title: "Mineral Choreography: Extraction Sites Vol. 1", tag: "Book project · Mineral transitions and extractive systems", year: "In Development" }
      : b,
  );

  console.log(`\nblogsPage (rev ${doc._rev})`);
  console.log(`\nArticles & Papers — before (${doc.currentProjects?.length ?? 0}):`);
  for (const r of doc.currentProjects ?? []) console.log(`  - ${show(r)}`);
  console.log(`Articles & Papers — after (${articles.length}):`);
  for (const r of articles) console.log(`  + ${show(r)}`);
  console.log(`\nBooks — before:`);
  for (const r of books) console.log(`  - ${show(r)}`);
  console.log(`Books — after (covers kept):`);
  for (const r of nextBooks) console.log(`  + ${show(r)}`);
  console.log(`\nJournals: untouched in Studio (not shown on the site since the Nov 18 code)`);

  if (!APPLY) {
    console.log(`\ndry run — nothing written (re-run with -- --apply)`);
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `publications-nov18-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(doc, null, 1));
  console.log(`\nbackup → ${file}`);
  const res = await client.patch(doc._id).ifRevisionId(doc._rev).set({ currentProjects: articles, books: nextBooks }).commit();
  console.log(`✓ ${doc._id}: Articles & Papers (${articles.length}) + Books updated (rev ${res._rev})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
