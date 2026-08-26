/**
 * Merge paired proseSection blocks ("Problem Context" + "What I Brought") into
 * one problemContextSection per Figma 2019:104708 / Sanity backend spec.
 *
 * Does NOT re-run migrate scripts — loads full documents via getDocument so
 * image/video refs and nested arrays are preserved.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-problem-context-sections.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const PROBLEM_TITLES = new Set(["problem context"]);
const BROUGHT_TITLES = new Set(["what i brought", "my role"]);

type Section = {
  _key: string;
  _type: string;
  sectionTitle?: string;
  body?: unknown;
  appearance?: unknown;
  problemHeading?: string;
  problemBody?: unknown;
  broughtHeading?: string;
  broughtBody?: unknown;
  supportingCopy?: unknown;
};

function norm(title?: string) {
  return title?.trim().toLowerCase() ?? "";
}

function isProblemContextPair(a: Section, b: Section) {
  return (
    a._type === "proseSection" &&
    b._type === "proseSection" &&
    PROBLEM_TITLES.has(norm(a.sectionTitle)) &&
    BROUGHT_TITLES.has(norm(b.sectionTitle))
  );
}

function mergePair(problem: Section, brought: Section): Section {
  return {
    _key: problem._key,
    _type: "problemContextSection",
    problemHeading: problem.sectionTitle?.trim() || "Problem Context",
    problemBody: problem.body,
    broughtHeading: brought.sectionTitle?.trim() || "What I Brought",
    broughtBody: brought.body,
    appearance: problem.appearance ?? brought.appearance,
  };
}

function mergeSections(sections: Section[]) {
  const out: Section[] = [];
  let merged = 0;
  for (let i = 0; i < sections.length; i++) {
    const cur = sections[i];
    const next = sections[i + 1];
    if (next && isProblemContextPair(cur, next)) {
      out.push(mergePair(cur, next));
      merged++;
      i++;
      continue;
    }
    if (cur._type === "problemContextSection") {
      out.push(cur);
      continue;
    }
    out.push(cur);
  }
  return { sections: out, merged };
}

async function main() {
  const ids: { _id: string; title?: string; slug?: string }[] = await client.fetch(
    `*[_type == "caseStudy" && !(_id in path("drafts.**")) && defined(sections)]{
      _id,
      title,
      "slug": slug.current
    }`,
  );

  console.log(`found ${ids.length} published case studies`);

  let patched = 0;
  let totalMerged = 0;

  for (const { _id, title, slug } of ids) {
    const full = await client.getDocument(_id);
    const before = (full?.sections ?? []) as Section[];
    if (!before.length) continue;

    const prosePairs = before.filter(
      (s, i) => i < before.length - 1 && isProblemContextPair(before[i], before[i + 1]),
    ).length;
    const already = before.filter((s) => s._type === "problemContextSection").length;

    if (prosePairs === 0) {
      console.log(
        `  skip ${slug ?? _id}: prose pairs=${prosePairs}, problemContextSection=${already}`,
      );
      continue;
    }

    const { sections: after, merged } = mergeSections(before);
    console.log(
      `→ ${slug ?? title ?? _id}: sections ${before.length} → ${after.length} (merged ${merged} pair(s))`,
    );

    await client.patch(_id).set({ sections: after }).commit();
    patched++;
    totalMerged += merged;
  }

  console.log(`✓ patched ${patched} doc(s), merged ${totalMerged} Problem Context + What I Brought pair(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
