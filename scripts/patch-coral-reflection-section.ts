/** Coral §11 — merge prose Reflection + bullet Next Steps → reflectionSection. */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const norm = (s?: string) => (s ?? "").trim().toLowerCase();

type LegacySection = {
  _key: string;
  _type: string;
  sectionTitle?: string;
  body?: unknown;
  items?: string[];
  appearance?: unknown;
};

type ReflectionSection = {
  _key: string;
  _type: "reflectionSection";
  reflectionHeading: string;
  reflectionBody?: unknown;
  nextStepsHeading: string;
  nextStepsItems?: string[];
  appearance?: unknown;
};

type CaseStudySection = LegacySection | ReflectionSection;

function mergeSections(sections: LegacySection[]) {
  const rIdx = sections.findIndex(
    (s) => s._type === "proseSection" && norm(s.sectionTitle) === "reflection",
  );
  const bIdx = sections.findIndex((s) => s._type === "bulletSection");
  if (rIdx < 0 || bIdx < 0) {
    throw new Error("missing Reflection proseSection or bulletSection");
  }

  const reflection = sections[rIdx];
  const bullet = sections[bIdx];
  const merged: ReflectionSection = {
    _type: "reflectionSection",
    _key: reflection._key,
    reflectionHeading: reflection.sectionTitle || "Reflection",
    reflectionBody: reflection.body,
    nextStepsHeading: bullet.sectionTitle || "Next Steps",
    nextStepsItems: bullet.items,
    appearance: reflection.appearance ?? bullet.appearance,
  };

  const next: CaseStudySection[] = sections.filter((_, i) => i !== rIdx && i !== bIdx);
  next.splice(Math.min(rIdx, bIdx), 0, merged);
  return next;
}

async function main() {
  for (const id of ["cs-coral-health", "drafts.cs-coral-health"]) {
    const doc = await client.fetch<{ sections: LegacySection[] }>(
      `*[_id == $id][0]{ sections[] }`,
      { id },
    );
    if (!doc) continue;

    const existing = doc.sections.findIndex((s) => s._type === "reflectionSection");
    if (existing >= 0) {
      console.log(`skip ${id} — already has reflectionSection`);
      continue;
    }

    const sections = mergeSections(doc.sections);
    await client.patch(id).set({ sections }).commit();
    console.log(`✓ reflectionSection on ${id} (${sections.length} sections)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
