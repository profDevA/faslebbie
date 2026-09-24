/**
 * Circle — push text-only updates from caseStudyCollabCopy.json → Sanity.
 * Does not re-upload images. Run after parse-case-study-collab-doc.mjs.
 *
 *   node scripts/parse-case-study-collab-doc.mjs
 *   npx sanity exec scripts/patch-circle-copy-all.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-circle-copy-all.ts --with-user-token
 */
import { execSync } from "node:child_process";

const DRY = process.argv.includes("--dry");
const cwd = process.cwd();

const steps = [
  "patch-circle-hero-overview.ts --copy-only",
  "patch-circle-approach.ts --copy-only",
  "patch-circle-research-artifacts.ts --copy-only",
  "patch-circle-impact-metrics.ts --copy-only",
  "patch-circle-reflection.ts --copy-only",
];

console.log(`patch-circle-copy-all (${DRY ? "dry" : "live"})`);

for (const step of steps) {
  const [script, ...scriptArgs] = step.split(" ");
  const passthrough = [...scriptArgs, ...(DRY ? ["--dry"] : [])].join(" ");
  const cmd = `npx sanity exec scripts/${script} --with-user-token -- ${passthrough}`;
  console.log(`\n→ ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit", env: process.env });
}

console.log("\n✓ Circle copy patches finished (text only)");
