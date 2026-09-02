/**
 * Enable password protection on every case study (published + draft).
 * Uses Site Settings → Access password (same gate as CV / Resume).
 *
 * Safe to re-run — idempotent set to true.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-case-studies-password-protect-all.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

async function main() {
  const [studies, site] = await Promise.all([
    client.fetch<
      {
        _id: string;
        title?: string;
        "slug.current"?: string;
        passwordProtected?: boolean;
      }[]
    >(
      `*[_type == "caseStudy"]{
        _id,
        title,
        "slug": slug.current,
        passwordProtected
      } | order(title asc)`,
    ),
    client.fetch<{ accessPassword?: string | null }>(
      `*[_type == "siteSettings"][0]{ accessPassword }`,
    ),
  ]);

  const accessConfigured = Boolean((site?.accessPassword ?? "").trim());
  if (!accessConfigured) {
    console.warn(
      "⚠ Site Settings → Access password is EMPTY — gate UI will show but /api/access allows anyone through until a password is set.",
    );
  } else {
    console.log("✓ Site Settings access password is configured.");
  }

  if (!studies.length) {
    console.error("No caseStudy documents found.");
    process.exit(1);
  }

  const already = studies.filter((s) => s.passwordProtected).length;
  console.log(
    `\nBefore: ${already}/${studies.length} passwordProtected=true\n`,
  );
  for (const s of studies) {
    const flag = s.passwordProtected ? "✓" : " ";
    console.log(`  ${flag} ${s.slug ?? "(no slug)"} — ${s.title ?? s._id}`);
  }

  let patchCount = 0;
  const tx = client.transaction();
  for (const s of studies) {
    if (!s.passwordProtected) {
      tx.patch(s._id, { set: { passwordProtected: true } });
      patchCount++;
    }
  }

  if (patchCount > 0) {
    await tx.commit();
    console.log(`\n✓ patched ${patchCount} case study document(s)`);
  } else {
    console.log("\n✓ all case studies already passwordProtected=true");
  }

  const after = await client.fetch<number>(
    `count(*[_type == "caseStudy" && passwordProtected == true])`,
  );
  const total = await client.fetch<number>(`count(*[_type == "caseStudy"])`);
  console.log(`After:  ${after}/${total} passwordProtected=true`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
