/**
 * Acme Lending — Core Experience band captions (Figma 2271:58148).
 * Patches label + description on existing previewScreens only (no image re-upload).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-acme-core-experience-captions.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const SLUG = "acme-lending";

const CAPTIONS = [
  {
    label: "Find Financial Institution:",
    description: "Secure Connections: Connect trusted financial institutions.",
  },
  {
    label: "Account Summary:",
    description: "Review selected accounts before sharing.",
  },
  {
    label: "Verifying Deposits:",
    description: "Automated Verification: Income verification happens instantly.",
  },
  {
    label: "Verification Complete:",
    description: "Instant Approval: Verification completed with confidence.",
  },
] as const;

async function main() {
  const full = await client.fetch<{
    _id: string;
    sections: { _type: string; previewScreens?: { _key: string; label?: string }[] }[];
  } | null>(`*[_type == "caseStudy" && slug.current == $slug][0]{ _id, sections }`, {
    slug: SLUG,
  });

  if (!full) throw new Error(`no case study: ${SLUG}`);

  const coreIdx = full.sections.findIndex(s => s._type === "coreExperience");
  if (coreIdx < 0) throw new Error("no coreExperience section");

  const screens = full.sections[coreIdx].previewScreens ?? [];
  if (!screens.length) throw new Error("no previewScreens on coreExperience");

  const beforeLabels = screens.map(s => s.label ?? "(empty)");
  const patch: Record<string, string> = {};
  const n = Math.min(screens.length, CAPTIONS.length);

  for (let i = 0; i < n; i++) {
    const sc = screens[i];
    const cap = CAPTIONS[i];
    patch[`sections[${coreIdx}].previewScreens[_key=="${sc._key}"].label`] = cap.label;
    patch[`sections[${coreIdx}].previewScreens[_key=="${sc._key}"].description`] =
      cap.description;
  }

  console.log(`Before labels: ${beforeLabels.join(" | ")}`);
  await client.patch(full._id).set(patch).commit();

  const after = await client.fetch<string[]>(
    `*[_type == "caseStudy" && slug.current == $slug][0].sections[_type == "coreExperience"][0].previewScreens[].label`,
    { slug: SLUG },
  );
  console.log(`✓ ${SLUG}: patched ${n} caption(s)`);
  console.log(`After labels: ${after.join(" | ")}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
