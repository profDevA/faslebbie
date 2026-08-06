/**
 * Restore case-study copy dropped by the redesign migrations.
 *
 * Found 08/06 by diffing every string in `case-studies.generated.ts` against
 * what each page renders. Two separate holes:
 *
 *   · `migrate-eb-mt-redesign.ts` built Research Artifacts with
 *     `introBody: pt(cs.designInterventions?.body)` only, so the copy attached
 *     to the other galleries — Toolkit/Methods/Frameworks on both, plus the
 *     Speak Here Prompt note on Memory Tubes — never made it across.
 *     `migrate-remaining-redesign.ts` does carry those, prefixed with the
 *     gallery's own name, which is the convention followed here.
 *
 *   · `migrate-remaining-redesign.ts` only emits Research Artifacts when the
 *     study has gallery images (`if (items.length)`), and the intro copy rides
 *     along inside it. Life of a Miner VR has the copy but no artifact images,
 *     so its Design Interventions paragraph was dropped on the floor. It comes
 *     back as its own prose band in the same slot; retitle or move it in the
 *     Studio if it belongs somewhere else.
 *
 * Idempotent: each paragraph is matched on its text before being added.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-lost-copy.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { generatedCaseStudies } from "../src/lib/case-studies.generated";

const client = getCliClient({ apiVersion: "2025-01-01" });

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

const block = (text: string) => ({
  _type: "block",
  _key: key(),
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

/** The template's black narrative band. `textColor` is what the renderer reads
 *  to lift the copy off the background — without it the prose stays black. */
const BLACK_BAND = {
  _type: "appearance",
  backgroundColor: { _type: "color", hex: "#000000", alpha: 1 },
  textColor: { _type: "color", hex: "#FFFFFF", alpha: 1 },
};

type Blk = { _type: string; children?: { text?: string }[] };
const plain = (b: Blk) => (b.children ?? []).map((c) => c.text ?? "").join("");
const has = (blocks: Blk[] | undefined, text: string) =>
  (blocks ?? []).some((b) => plain(b).includes(text.slice(0, 60)));

/** Copy that belongs in an existing Research Artifacts intro, by slug. */
function introAdditions(slug: string) {
  const g = generatedCaseStudies[slug as keyof typeof generatedCaseStudies] as any;
  const out: string[] = [];
  const ro = g?.researchOutputs;
  if (ro?.body) out.push(ro.heading ? `${ro.heading} — ${ro.body}` : ro.body);
  for (const gal of g?.extraGalleries ?? [])
    if (gal?.body) out.push(gal.heading ? `${gal.heading} — ${gal.body}` : gal.body);
  return out;
}

async function main() {
  const docs: {
    _id: string;
    slug: string;
    sections: {
      _key: string;
      _type: string;
      sectionTitle?: string;
      introBody?: Blk[];
      appearance?: { textColor?: unknown };
    }[];
  }[] = await client.fetch(
    `*[_type == "caseStudy" && slug.current in $slugs]{
      _id, "slug": slug.current,
      "sections": sections[]{ _key, _type, sectionTitle, introBody, appearance }
    }`,
    { slugs: ["experian-boost", "memory-tubes", "life-of-a-miner-vr"] },
  );

  for (const doc of docs) {
    if (doc.slug === "life-of-a-miner-vr") {
      const body = (generatedCaseStudies["life-of-a-miner-vr"] as any)?.designInterventions?.body;
      if (!body) continue;
      if (doc.sections.some((s) => s._type === "showcaseGallery")) {
        console.log(`${doc.slug}: Research Artifacts already carries the copy`);
        continue;
      }
      // An earlier cut of this script parked the copy in its own "Design
      // Interventions" prose band, which is a twelfth heading the template
      // doesn't have. Replace it with the Research Artifacts band the other 16
      // studies keep this paragraph in. The block only draws its slider when
      // there are images, so with none it is just the heading and the copy, and
      // Israel's artifacts drop straight in later.
      const stale = doc.sections.findIndex(
        (s) => s._type === "proseSection" && /design intervention/i.test(s.sectionTitle ?? ""),
      );
      if (stale >= 0) await client.patch(doc._id).unset([`sections[${stale}]`]).commit();
      // Sit where Research Artifacts would have: after Design Process, before
      // the demo/stats bands that follow it.
      const after = doc.sections.findIndex((s) => s._type === "accordionSection");
      const at = after >= 0 ? after + 1 : doc.sections.length;
      await client
        .patch(doc._id)
        .insert("before", `sections[${at}]`, [
          {
            _key: key(),
            _type: "showcaseGallery",
            sectionTitle: "Research Artifacts",
            expandable: true,
            items: [],
            introBody: String(body)
              .split(/\n{2,}/)
              .map((p) => block(p.trim()))
              .filter((b) => plain(b as Blk)),
            appearance: BLACK_BAND,
          },
        ])
        .commit();
      console.log(`${doc.slug}: copy moved into Research Artifacts at ${at}`);
      continue;
    }

    const idx = doc.sections.findIndex(
      (s) => s._type === "showcaseGallery" && /research artifacts/i.test(s.sectionTitle ?? ""),
    );
    if (idx < 0) {
      console.warn(`! ${doc.slug}: no Research Artifacts section`);
      continue;
    }
    const existing = doc.sections[idx].introBody ?? [];
    const additions = introAdditions(doc.slug).filter((t) => !has(existing, t));
    if (!additions.length) {
      console.log(`${doc.slug}: intro already complete`);
      continue;
    }
    await client
      .patch(doc._id)
      .set({ [`sections[${idx}].introBody`]: [...existing, ...additions.map(block)] })
      .commit();
    console.log(`${doc.slug}: appended ${additions.length} paragraph(s) to the Research Artifacts intro`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
