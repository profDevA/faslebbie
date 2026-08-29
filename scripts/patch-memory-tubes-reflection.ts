/**
 * Memory Tubes — restore Reflection body + Next Steps (Israel QA: band showed
 * only Next Steps). Source: caseStudyCollabCopy.json reflection block.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-memory-tubes-reflection.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-memory-tubes-reflection.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const DOC_IDS = ["cs-memory-tubes", "drafts.cs-memory-tubes"];
const dry = process.argv.includes("--dry");

const REFLECTION_BODY = [
  {
    _type: "block",
    _key: "mt-reflect-1",
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: "mt-reflect-1-span",
        text: "Shifting our prompt from a memory-based question to a present-moment one worked: asking strangers how they felt right now instead of asking them to recall the past tripled participation, revealing that busy urban contexts reward immediate emotional honesty over quiet reflection. Watching each engaged participant inspire two or three others to follow told me that collective joy spreads through visible permission, not private invitation extended one wary stranger at a time. If I could revisit one decision, I'd have made our recording equipment visible from the very first deployment instead of only the second one, since transparency built real trust we spent our whole first phase assuming we had to hide.",
        marks: [],
      },
    ],
  },
];

const NEXT_STEPS = [
  "Next, we're collaborating with NYC Parks and transit authorities to expand Memory Tube installations across more boroughs and high-traffic spaces.",
  "We're partnering with community groups to co-create a simple, open-source toolkit for replicating these urban interventions.",
  "We're launching a digital archive to document and share participant stories, audio clips, and engagement data.",
  "We're working with city planners and public art programs to embed prototyping insights into future public space designs.",
];

type Section = {
  _key: string;
  _type: string;
  reflectionBody?: unknown;
  reflectionHeading?: string;
  nextStepsHeading?: string;
  nextStepsItems?: string[];
};

async function main() {
  for (const id of DOC_IDS) {
    const doc = await client.fetch<{ sections: Section[] }>(
      `*[_id == $id][0]{ sections[] }`,
      { id },
    );
    if (!doc?.sections?.length) {
      console.log(`skip ${id}`);
      continue;
    }

    const idx = doc.sections.findIndex((s) => s._type === "reflectionSection");
    if (idx < 0) {
      console.log(`skip ${id} — no reflectionSection`);
      continue;
    }

    const cur = doc.sections[idx]!;
    const hasBody =
      Array.isArray(cur.reflectionBody) && cur.reflectionBody.length > 0;
    if (hasBody) {
      console.log(`skip ${id} — reflection body already set`);
      continue;
    }

    const next = doc.sections.map((s, i) =>
      i === idx
        ? {
            ...s,
            reflectionHeading: s.reflectionHeading ?? "Reflection",
            reflectionBody: REFLECTION_BODY,
            nextStepsHeading: s.nextStepsHeading ?? "Next Steps",
            nextStepsItems: s.nextStepsItems?.length
              ? s.nextStepsItems
              : NEXT_STEPS,
          }
        : s,
    );

    console.log(`${dry ? "(dry run) " : ""}→ ${id}: patch reflectionSection body`);
    if (!dry) {
      await client.patch(id).set({ sections: next }).commit();
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
