/**
 * Test the new-case-study process for Fas (Nov 25 evening call, item 9 — "If I
 * want to add a case study… do I just duplicate it?"). Xian's "go", Nov 25.
 *
 * Reproduces Studio's Duplicate + Publish on the PRODUCTION dataset with a
 * clearly named, password-protected test study, checks the live site, and
 * deletes the study again — all in ONE run (try / finally: the delete always
 * runs once the study exists).
 *
 *   1. Duplicate (= Studio ⋯ next to Publish → Duplicate; sanity 6.9 `duplicate`
 *      operation): `drafts.<new uuid>` = a copy of the source study's draft (or
 *      published doc when there's no draft), every field except _id / _rev /
 *      _createdAt / _updatedAt / _system.
 *   2. Edit the draft the way Fas would before publishing: Project name
 *      "ZZ Xian test case study", Slug `zz-xian-test`, Password protected on,
 *      Own password "zz-test", orderRank after the last published study
 *      (= dragged to the end of the list; a LexoRank string).
 *   3. Publish (= Studio Publish: Actions API `sanity.action.document.publish`).
 *   4. Checks on the live site (plain GETs like a visitor; times are seconds
 *      after the write):
 *      (a) the card on /work, /work/zz-xian-test → 200, sitemap (password-
 *          protected studies are left out of it on purpose);
 *      (b) POST /api/access (what the password box calls) with the own
 *          password, the site password (read from Site Settings, never
 *          printed) and a wrong one;
 *      (c) one text field (the hero caption line: the hero's Caption if the
 *          study has one, else Tagline) → "ZZ Xian test edit";
 *      (d) the hero image → another study's existing hero asset (no upload).
 *   5. Delete (= Studio Delete: `sanity.action.document.delete`, published +
 *      draft), read back that nothing is left, then time: card gone from
 *      /work, /work/zz-xian-test → 404, not in the sitemap.
 *
 * Dry by default: reads only, prints what a duplicate copies and the plan.
 *   -- --apply           run 1–5
 *   -- --control=<dir>   pause after (b), (c) and (d) until `<dir>/go-c`,
 *                        `go-d`, `go-e` exist (browser checks in between; each
 *                        pause max 10 min, whole test max 30 min after Publish;
 *                        `<dir>/stop` = delete now). Writes `<dir>/state.json`.
 *   -- --cleanup         only delete leftovers: caseStudy docs whose slug is
 *                        `zz-xian-test` or whose title starts "ZZ Xian test"
 *                        (published + drafts) — for a run that was killed.
 *   -- --source=<slug>   source study (default coral-health)
 *   -- --site=<url>      default https://faslebbie.com
 *
 *   npx sanity exec scripts/test-duplicate-case-study-nov25.ts --with-user-token [-- --apply --control=<dir>]
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { LexoRank } from "lexorank";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" }).withConfig({ perspective: "raw", useCdn: false });

const argv = process.argv.slice(2);
const APPLY = argv.includes("--apply");
const CLEANUP = argv.includes("--cleanup");
const opt = (name: string) => argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const SOURCE_SLUG = opt("source") ?? "coral-health";
const CONTROL = opt("control");
const SITE = (opt("site") ?? "https://faslebbie.com").replace(/\/$/, "");

const TITLE = "ZZ Xian test case study";
const SLUG = "zz-xian-test";
const OWN_PASSWORD = "zz-test";
const TEXT_EDIT = "ZZ Xian test edit";
/** What Studio's duplicate operation leaves out (sanity 6.9 `omitProps` + the new _id / _rev). */
const OMIT = new Set(["_id", "_rev", "_createdAt", "_updatedAt", "_system"]);

const PAUSE_MAX_MS = 10 * 60_000;
const TEST_MAX_MS = 30 * 60_000;

type Doc = Record<string, unknown> & { _id: string; _rev: string; _type: string };
type Section = Record<string, unknown> & { _key: string; _type: string };

const now = () => new Date().toISOString();
const secs = (from: number) => Math.round((Date.now() - from) / 1000);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ref = (v: unknown) => (v as { asset?: { _ref?: string } } | undefined)?.asset?._ref ?? null;

// ---------------------------------------------------------------- state / control
const state: Record<string, unknown> = { script: "test-duplicate-case-study-nov25", site: SITE };
function saveState(patch: Record<string, unknown>) {
  Object.assign(state, patch, { updatedAt: now() });
  if (!CONTROL) return;
  mkdirSync(CONTROL, { recursive: true });
  writeFileSync(join(CONTROL, "state.json"), JSON.stringify(state, null, 2));
}

class StopTest extends Error {}
let stopRequested = false;
let testDeadline = Infinity;
for (const sig of ["SIGINT", "SIGTERM", "SIGBREAK", "SIGHUP"] as const) {
  process.on(sig, () => {
    console.log(`\n${sig} — stopping; the delete still runs`);
    stopRequested = true;
  });
}
/** Set once the delete has run: the after-delete polls ignore the stop file / time limit. */
let inCleanup = false;
function checkStop() {
  if (stopRequested) throw new StopTest("stop requested (signal)");
  if (inCleanup) return;
  if (CONTROL && existsSync(join(CONTROL, "stop"))) throw new StopTest("stop file");
  if (Date.now() > testDeadline) throw new StopTest("30-minute limit reached");
}
async function pause(name: string) {
  if (!CONTROL) return;
  console.log(`[${now()}] waiting for ${join(CONTROL, name)} (max 10 min)`);
  saveState({ waitingFor: name });
  const until = Date.now() + PAUSE_MAX_MS;
  while (!existsSync(join(CONTROL, name))) {
    checkStop();
    if (Date.now() > until) throw new StopTest(`no ${name} within 10 min`);
    await sleep(1000);
  }
  saveState({ waitingFor: null });
}

// ---------------------------------------------------------------- live-site helpers
async function get(path: string) {
  const res = await fetch(SITE + path, {
    redirect: "manual",
    headers: { "user-agent": "Mozilla/5.0 (cs-duplicate-test)", "cache-control": "no-cache" },
  });
  return { status: res.status, text: await res.text() };
}

/** Poll `test` every `every` ms until true; returns seconds after `from`, or null after `max`. */
async function pollUntil(label: string, from: number, test: () => Promise<boolean>, every = 5000, max = 300_000) {
  const end = Date.now() + max;
  for (let i = 1; ; i++) {
    checkStop();
    let ok = false;
    try {
      ok = await test();
    } catch (err) {
      console.log(`  ${label}: request failed (${(err as Error).message})`);
    }
    if (ok) {
      const s = secs(from);
      console.log(`  ✓ ${label}: ${s} s after the write (check #${i})`);
      return s;
    }
    if (Date.now() > end) {
      console.log(`  ✗ ${label}: not within ${Math.round(max / 1000)} s`);
      return null;
    }
    await sleep(every);
  }
}

// ---------------------------------------------------------------- Sanity helpers
async function leftovers() {
  const rows = await client.fetch<{ _id: string; title?: string; slug?: string }[]>(
    `*[_type == "caseStudy" && (slug.current == $slug || title match "ZZ*")]{ _id, title, "slug": slug.current }`,
    { slug: SLUG },
  );
  // Only what carries the ZZ test name / slug (global rule: delete only ZZ items).
  return rows.filter((r) => r.slug === SLUG || (r.title ?? "").startsWith("ZZ Xian test"));
}

async function deleteDocs(publishedId: string) {
  const draftId = `drafts.${publishedId}`;
  const existing = await client.fetch<string[]>(`*[_id in [$p, $d]]._id`, { p: publishedId, d: draftId });
  if (!existing.length) return console.log(`  ${publishedId}: nothing to delete`);
  const hasPublished = existing.includes(publishedId);
  const hasDraft = existing.includes(draftId);
  try {
    if (hasPublished) {
      // Studio's Delete (sanity 6.9 `del`): published + its draft in one action.
      await client.action({
        actionType: "sanity.action.document.delete",
        publishedId,
        includeDrafts: hasDraft ? [draftId] : [],
      });
    } else {
      await client.action({ actionType: "sanity.action.document.discard", draftId });
    }
  } catch (err) {
    console.log(`  delete action failed (${(err as Error).message}) — falling back to a delete transaction`);
    await client.transaction().delete(publishedId).delete(draftId).commit();
  }
  console.log(`  deleted ${existing.join(" + ")}`);
}

async function deleteWithRetry(publishedId: string) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await deleteDocs(publishedId);
      const left = await client.fetch<string[]>(`*[_id in [$p, "drafts." + $p]]._id`, { p: publishedId });
      const byName = await leftovers();
      if (!left.length && !byName.length) return true;
      console.log(`  still there after attempt ${attempt}: ${[...left, ...byName.map((r) => r._id)].join(", ")}`);
      for (const r of byName) await deleteDocs(r._id.replace(/^drafts\./, ""));
    } catch (err) {
      console.log(`  delete attempt ${attempt} failed: ${(err as Error).message}`);
    }
    await sleep(2000 * attempt);
  }
  return false;
}

// ---------------------------------------------------------------- report what a duplicate copies
async function describe(source: Doc) {
  const sections = (source.sections as Section[] | undefined) ?? [];
  const hero = sections.find((s) => s._type === "heroSection");
  const cats = await client.fetch<string[]>(`*[_id in $ids].title`, {
    ids: ((source.categories as { _ref: string }[] | undefined) ?? []).map((c) => c._ref),
  });
  const seo = (source.seo as Record<string, unknown> | undefined) ?? {};
  const own = typeof source.accessPassword === "string" ? source.accessPassword.trim() : "";
  console.log(`\nWhat Duplicate copies from ${source._id} (all ${Object.keys(source).filter((k) => !OMIT.has(k)).length} fields except ${[...OMIT].join(", ")}):`);
  console.log(`  title              ${JSON.stringify(source.title)}   ← must change`);
  console.log(`  slug               ${JSON.stringify((source.slug as { current?: string })?.current)}   ← must change (same slug = Studio blocks Publish: "Slug is already in use")`);
  console.log(`  orderRank          ${source.orderRank}   ← same as the source: the copy sits next to it (drag to place)`);
  console.log(`  passwordProtected  ${source.passwordProtected ?? "(empty = off)"}`);
  console.log(`  accessPassword     ${own ? `(set, ${own.length} chars — copied too)` : "(empty = the shared Site Settings password)"}`);
  console.log(`  tagline            ${JSON.stringify(source.tagline ?? null)}`);
  console.log(`  categories         ${cats.join(", ") || "(none)"}`);
  console.log(`  cardThumbnail      ${ref(source.cardThumbnail) ?? "(none)"}`);
  console.log(`  cardThumbnailMotion ${ref(source.cardThumbnailMotion) ?? "(none)"}`);
  console.log(`  cardCreditNames    ${JSON.stringify(source.cardCreditNames ?? [])}`);
  console.log(`  cardTags           ${JSON.stringify(source.cardTags ?? [])}`);
  console.log(`  accent / span      ${(source.accent as { hex?: string } | undefined)?.hex ?? "(none)"} / ${source.span ?? "(none)"}`);
  console.log(`  seo                ${Object.keys(seo).filter((k) => !k.startsWith("_")).map((k) => `${k}${k === "ogImage" ? "=" + ref(seo[k]) : "=" + JSON.stringify(seo[k])}`).join(", ") || "(empty)"}`);
  console.log(`  designRefs         ${((source.designRefs as unknown[]) ?? []).length} item(s)`);
  console.log(`  sections           ${sections.length}: ${sections.map((s) => s._type).join(", ")}`);
  if (hero) {
    console.log(`  hero               image ${ref(hero.image)}, imageMobile ${ref(hero.imageMobile)}, headingOverride ${JSON.stringify(hero.headingOverride ?? null)}, caption ${JSON.stringify(hero.caption ?? null)}`);
  }
  console.log(`  other fields       ${Object.keys(source).filter((k) => !OMIT.has(k) && !["_type", "title", "slug", "orderRank", "passwordProtected", "accessPassword", "tagline", "categories", "cardThumbnail", "cardThumbnailMotion", "cardCreditNames", "cardTags", "accent", "span", "seo", "designRefs", "sections"].includes(k)).join(", ") || "(none)"}`);
}

// ---------------------------------------------------------------- main
async function main() {
  console.log(`test-duplicate-case-study-nov25 (${CLEANUP ? "CLEANUP" : APPLY ? "APPLY" : "dry"}) — ${now()}`);

  const before = await leftovers();
  if (CLEANUP) {
    if (!before.length) return console.log("nothing left over — no ZZ Xian test case study in the dataset");
    console.log(`leftovers: ${before.map((r) => `${r._id} (${r.title} / ${r.slug})`).join(", ")}`);
    const ids = [...new Set(before.map((r) => r._id.replace(/^drafts\./, "")))];
    let ok = true;
    for (const id of ids) ok = (await deleteWithRetry(id)) && ok;
    console.log(ok ? "✓ cleanup done — nothing left" : "✗ cleanup incomplete — see above");
    if (!ok) process.exitCode = 1;
    return;
  }
  if (before.length) throw new Error(`a test study already exists (${before.map((r) => r._id).join(", ")}) — run -- --cleanup first`);

  // Source: what Studio's Duplicate would copy (draft if there is one, else published).
  const docs = await client.fetch<Doc[]>(`*[_type == "caseStudy" && slug.current == $slug]`, { slug: SOURCE_SLUG });
  const published = docs.find((d) => !d._id.startsWith("drafts.") && !d._id.startsWith("versions."));
  if (!published) throw new Error(`published ${SOURCE_SLUG} not found`);
  const draft = docs.find((d) => d._id === `drafts.${published._id}`);
  const source = draft ?? published;
  console.log(`source: ${source._id} (${draft ? "its unpublished DRAFT — Studio duplicates the draft when there is one" : "published, no draft"}), rev ${source._rev}, updated ${source._updatedAt}`);
  await describe(source);

  // Order: after the last published study.
  const order = await client.fetch<{ _id: string; title: string; orderRank?: string }[]>(
    `*[_type == "caseStudy" && !(_id in path("drafts.**"))] | order(orderRank asc){ _id, title, orderRank }`,
  );
  const bad = order.filter((d) => !d.orderRank || !/^\d\|[0-9a-z]+:[0-9a-z]*$/.test(d.orderRank));
  if (bad.length) throw new Error(`non-LexoRank orderRank on ${bad.map((d) => d._id).join(", ")} — run patch-order-ranks.ts first`);
  const last = order[order.length - 1];
  const newRank = LexoRank.parse(last.orderRank!).genNext().toString();
  if (!(newRank > last.orderRank!)) throw new Error(`rank ${newRank} is not after ${last.orderRank}`);
  console.log(`\nWork order: ${order.length} published studies, last = ${last.title} (${last.orderRank}) → test study ${newRank}`);

  const sections = (source.sections as Section[] | undefined) ?? [];
  const hero = sections.find((s) => s._type === "heroSection");
  if (!hero) throw new Error("source has no hero section");
  const textPath = typeof hero.caption === "string" ? `sections[_key=="${hero._key}"].caption` : "tagline";
  const textBefore = typeof hero.caption === "string" ? hero.caption : source.tagline;
  // (d) candidates: other studies' existing hero images (no upload). The one used
  // must not be in the test page's HTML yet (prev / next studies ride along in it).
  const heroCandidates = (
    await client.fetch<(string | null)[]>(
      `*[_type == "caseStudy" && !(_id in path("drafts.**")) && slug.current != $slug] | order(orderRank asc).sections[_type == "heroSection"][0].image.asset._ref`,
      { slug: SOURCE_SLUG },
    )
  ).filter((a): a is string => Boolean(a) && a !== ref(hero.image));
  if (!heroCandidates.length) throw new Error("no other hero asset found for check (d)");
  const otherHero = heroCandidates[Math.floor(heroCandidates.length / 2)];

  console.log(`\nPlan:
  1. create drafts.<new uuid> = copy of ${source._id}
  2. patch the draft: title → "${TITLE}", slug → ${SLUG}, passwordProtected → true, accessPassword → "${OWN_PASSWORD}", orderRank → ${newRank}
  3. publish (sanity.action.document.publish)
  4. (a) ${SITE}/work card + /work/${SLUG} 200 + sitemap; (b) /api/access own / site / wrong password;
     (c) ${textPath}: ${JSON.stringify(textBefore)} → "${TEXT_EDIT}"; (d) hero image ${ref(hero.image)} → ${otherHero}
  5. delete published + draft (sanity.action.document.delete), read back, time the card / 404 / sitemap`);

  if (!APPLY) return console.log("\ndry run — nothing written (re-run with -- --apply)");

  // ------------------------------------------------------------ APPLY
  const siteSettings = await client.fetch<{ accessPassword?: string } | null>(
    `*[_type == "siteSettings" && !(_id in path("drafts.**"))][0]{ accessPassword }`,
  );
  const sitePassword = (siteSettings?.accessPassword ?? "").trim(); // never printed

  const id = randomUUID();
  const draftId = `drafts.${id}`;
  let createdAt = 0;
  const results: Record<string, unknown> = {};
  saveState({ phase: "starting", id, draftId });

  try {
    // 1. Duplicate
    const copy = Object.fromEntries(Object.entries(source).filter(([k]) => !OMIT.has(k)));
    createdAt = Date.now();
    await client.create({ ...copy, _id: draftId, _type: source._type });
    console.log(`\n[${now()}] 1. duplicated → ${draftId}`);
    saveState({ phase: "duplicated" });

    // 2. Fas's edits before Publish
    await client
      .patch(draftId)
      .set({
        title: TITLE,
        slug: { _type: "slug", current: SLUG },
        passwordProtected: true,
        accessPassword: OWN_PASSWORD,
        orderRank: newRank,
      })
      .commit();
    console.log(`[${now()}] 2. draft edited (title, slug, password on + own password, orderRank last)`);

    // 3. Publish
    await client.action({ actionType: "sanity.action.document.publish", draftId, publishedId: id });
    const publishedAt = Date.now();
    testDeadline = publishedAt + TEST_MAX_MS;
    const pub = await client.fetch<Doc | null>(`*[_id == $id][0]`, { id });
    const draftLeft = await client.fetch<number>(`count(*[_id == $d])`, { d: draftId });
    if (!pub) throw new Error("publish did not create the published document");
    console.log(`[${now()}] 3. published ${id} (rev ${pub._rev}); draft left after publish: ${draftLeft}`);
    saveState({ phase: "published", publishedAt: new Date(publishedAt).toISOString(), rev: pub._rev });

    // (a) card on Work, page 200, sitemap
    console.log(`\n(a) live after Publish`);
    const [cardS, pageS] = await Promise.all([
      pollUntil("card on /work", publishedAt, async () => (await get("/work")).text.includes(SLUG), 10_000),
      pollUntil(`/work/${SLUG} → 200`, publishedAt, async () => (await get(`/work/${SLUG}`)).status === 200, 10_000),
    ]);
    const sitemapHas = (await get("/sitemap.xml")).text.includes(`/work/${SLUG}<`);
    console.log(`  sitemap lists /work/${SLUG}: ${sitemapHas} (password-protected studies are left out on purpose)`);
    const page = await get(`/work/${SLUG}`);
    console.log(`  page payload: title ${page.text.includes(TITLE)}, own password in HTML ${page.text.includes(OWN_PASSWORD)}`);
    results.a = { cardSeconds: cardS, pageSeconds: pageS, sitemapListsIt: sitemapHas, passwordInHtml: page.text.includes(OWN_PASSWORD) };
    saveState({ phase: "a-done", results });

    // (b) password check — the same route the password box calls
    console.log(`\n(b) /api/access for /work/${SLUG}`);
    const tryPw = async (label: string, password: string) => {
      const res = await fetch(`${SITE}/api/access`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, slug: SLUG }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; scope?: string; error?: string };
      console.log(`  ${label}: HTTP ${res.status} ${body.ok ? `ok (scope ${body.scope})` : body.error ?? ""}`);
      return { status: res.status, ok: Boolean(body.ok), scope: body.scope ?? null };
    };
    results.b = {
      ownPassword: await tryPw(`own password "${OWN_PASSWORD}"`, OWN_PASSWORD),
      sitePassword: sitePassword ? await tryPw("the site password", sitePassword) : "site password empty",
      wrongPassword: await tryPw('wrong "zz-wrong"', "zz-wrong"),
    };
    saveState({ phase: "b-done", results });
    await pause("go-c");

    // (c) one text field
    console.log(`\n(c) ${textPath}: ${JSON.stringify(textBefore)} → "${TEXT_EDIT}"`);
    const revC = await client.fetch<string>(`*[_id == $id][0]._rev`, { id });
    await client.patch(id).ifRevisionId(revC).set({ [textPath]: TEXT_EDIT }).commit();
    const editAt = Date.now();
    saveState({ phase: "c-written", editAt: new Date(editAt).toISOString() });
    const textS = await pollUntil(`"${TEXT_EDIT}" on /work/${SLUG}`, editAt, async () => (await get(`/work/${SLUG}`)).text.includes(TEXT_EDIT));
    results.c = { field: textPath, seconds: textS };
    saveState({ phase: "c-done", results });
    await pause("go-d");

    // (d) one image field → another existing asset (no upload)
    const heroPath = `sections[_key=="${hero._key}"].image.asset._ref`;
    const htmlD = (await get(`/work/${SLUG}`)).text;
    const newHero = [otherHero, ...heroCandidates].find((a) => !htmlD.includes(a.split("-")[1]));
    if (!newHero) throw new Error("(d) every candidate hero asset is already in the page HTML");
    console.log(`\n(d) ${heroPath}: ${ref(hero.image)} → ${newHero}`);
    const revD = await client.fetch<string>(`*[_id == $id][0]._rev`, { id });
    await client.patch(id).ifRevisionId(revD).set({ [heroPath]: newHero }).commit();
    const imageAt = Date.now();
    saveState({ phase: "d-written", imageAt: new Date(imageAt).toISOString() });
    const hash = newHero.split("-")[1];
    const imgS = await pollUntil(`new hero image on /work/${SLUG}`, imageAt, async () => (await get(`/work/${SLUG}`)).text.includes(hash));
    results.d = { field: heroPath, newAsset: newHero, seconds: imgS };
    saveState({ phase: "d-done", results });
    await pause("go-e");
  } catch (err) {
    console.log(`\n${err instanceof StopTest ? "stopped" : "ERROR"}: ${(err as Error).message}`);
    if (!(err instanceof StopTest)) process.exitCode = 1;
  } finally {
    if (createdAt) {
      // 5. Delete — always, once anything was created.
      console.log(`\n(e) delete ${id} (+ ${draftId})`);
      inCleanup = true;
      const ok = await deleteWithRetry(id);
      const deletedAt = Date.now();
      const left = await leftovers().catch(() => null);
      console.log(ok && left && !left.length ? `  ✓ read back: nothing left in Sanity` : `  ✗ LEFT IN SANITY: ${JSON.stringify(left)}`);
      saveState({ phase: "deleted", deletedAt: new Date(deletedAt).toISOString(), leftInSanity: left });
      if (!ok) process.exitCode = 1;
      if (ok && !stopRequested) {
        const goneCard = await pollUntil("card gone from /work", deletedAt, async () => !(await get("/work")).text.includes(SLUG), 10_000).catch(() => null);
        const gone404 = await pollUntil(`/work/${SLUG} → 404`, deletedAt, async () => (await get(`/work/${SLUG}`)).status === 404, 10_000).catch(() => null);
        const goneSitemap = await get("/sitemap.xml").then((r) => !r.text.includes(`/work/${SLUG}<`)).catch(() => null);
        console.log(`  not in the sitemap: ${goneSitemap}`);
        results.e = { cardGoneSeconds: goneCard, page404Seconds: gone404, notInSitemap: goneSitemap, leftInSanity: left };
      }
      saveState({ phase: "done", results });
    }
  }
  console.log(`\nresults: ${JSON.stringify(results)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
