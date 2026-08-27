/**
 * Selectively restore Coral Health published sections from Sanity History
 * (2026-08-26T07:59:00Z — before media-stripping patches).
 *
 * Keeps current motionShowcase rows, desktopMotionShowcase, showcaseGallery,
 * hero, highlight, accordion, stats. Restores overview media/meta,
 * problemContext copy, reflection, and next steps.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-coral-restore-from-history.ts --with-user-token -- --dry
 *   sanity exec scripts/patch-coral-restore-from-history.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DOC_ID = "cs-coral-health";
const HISTORY_TIME = "2026-08-26T07:59:00Z";
const DRY = process.argv.includes("--dry");

type Section = {
  _key: string;
  _type: string;
  sectionTitle?: string;
  body?: unknown;
  appearance?: unknown;
  sideImage?: unknown;
  sideVideo?: unknown;
  duration?: string;
  team?: string;
  serviceList?: string;
  serviceCategoryLabel?: string;
  problemHeading?: string;
  problemBody?: unknown;
  broughtHeading?: string;
  broughtBody?: unknown;
  items?: unknown;
};

function norm(title?: string) {
  return title?.trim().toLowerCase() ?? "";
}

async function historySections(): Promise<Section[]> {
  const resp = await client.request<{ documents?: { sections?: Section[] }[] }>({
    uri: `/data/history/production/documents/${DOC_ID}?time=${encodeURIComponent(HISTORY_TIME)}`,
    withCredentials: true,
  });
  const sections = resp.documents?.[0]?.sections;
  if (!sections?.length) throw new Error(`No history at ${HISTORY_TIME}`);
  return sections;
}

function idx(sections: Section[], type: string) {
  return sections.findIndex((s) => s._type === type);
}

async function main() {
  const [hist, pub] = await Promise.all([
    historySections(),
    client.fetch<{ sections: Section[] }>(
      `*[_id == $id][0]{ sections[]{ _key, _type, sectionTitle } }`,
      { id: DOC_ID },
    ),
  ]);

  if (!pub?.sections?.length) {
    console.error(`No published doc ${DOC_ID}`);
    process.exit(1);
  }

  const histOverview = hist.find((s) => s._type === "overviewSection");
  const histProblem = hist.find(
    (s) => s._type === "proseSection" && norm(s.sectionTitle) === "problem context",
  );
  const histBrought = hist.find(
    (s) => s._type === "proseSection" && norm(s.sectionTitle) === "what i brought",
  );
  const histReflection = hist.find(
    (s) => s._type === "proseSection" && norm(s.sectionTitle) === "reflection",
  );
  const histBullet = hist.find((s) => s._type === "bulletSection");

  const patch = client.patch(DOC_ID);
  let n = 0;

  const overviewIdx = idx(pub.sections, "overviewSection");
  if (overviewIdx >= 0 && histOverview) {
    console.log("overview: sideImage, sideVideo, duration, team, services");
    if (!DRY) {
      for (const field of [
        "sideImage",
        "sideVideo",
        "duration",
        "team",
        "serviceList",
        "serviceCategoryLabel",
      ] as const) {
        if (histOverview[field] != null) {
          patch.set({ [`sections[${overviewIdx}].${field}`]: histOverview[field] });
        }
      }
    }
    n++;
  }

  const problemIdx = idx(pub.sections, "problemContextSection");
  if (problemIdx >= 0 && histProblem && histBrought) {
    console.log("problemContext: headings + body from history prose pair");
    if (!DRY) {
      patch.set({
        [`sections[${problemIdx}].problemHeading`]:
          histProblem.sectionTitle?.trim() || "Problem Context",
        [`sections[${problemIdx}].problemBody`]: histProblem.body,
        [`sections[${problemIdx}].broughtHeading`]:
          histBrought.sectionTitle?.trim() || "What I Brought",
        [`sections[${problemIdx}].broughtBody`]: histBrought.body,
        [`sections[${problemIdx}].appearance`]:
          histProblem.appearance ?? histBrought.appearance,
      });
    }
    n++;
  }

  const reflectionIdx = pub.sections.findIndex(
    (s) => s._type === "proseSection" && norm(s.sectionTitle) === "reflection",
  );
  if (reflectionIdx >= 0 && histReflection?.body) {
    console.log("reflection: body");
    if (!DRY) patch.set({ [`sections[${reflectionIdx}].body`]: histReflection.body });
    n++;
  }

  const bulletIdx = idx(pub.sections, "bulletSection");
  if (bulletIdx >= 0 && histBullet?.items?.length) {
    console.log(`next steps: ${histBullet.items.length} item(s)`);
    if (!DRY) patch.set({ [`sections[${bulletIdx}].items`]: histBullet.items });
    n++;
  }

  if (!n) {
    console.log("Nothing to restore.");
    return;
  }
  if (DRY) {
    console.log("(dry run — nothing written)");
    return;
  }
  await patch.commit();
  console.log(`✓ restored ${n} section group(s) on ${DOC_ID}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
