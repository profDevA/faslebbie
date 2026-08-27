/**
 * Patch only buildPage.intro from the collaboration doc Build tab.
 * Does not touch projects / images. Do not run migrate-pages.ts.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-build-final-copy.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { buildIntro } from "./data/buildSeed";
import type { BuildToken } from "../src/lib/build";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type MarkDef = Record<string, unknown> & { _key: string; _type: string };

function block(tokens: BuildToken[]) {
  const markDefs: MarkDef[] = [];
  const children = tokens.map((tok) => {
    const marks: string[] = [];
    if (tok.t === "proj") {
      const _key = key();
      markDefs.push({ _key, _type: "ref", targetId: tok.id });
      marks.push(_key);
    }
    return { _type: "span", _key: key(), text: tok.text, marks };
  });
  return { _type: "block", _key: key(), style: "normal", markDefs, children };
}

async function run() {
  const before = await client.fetch<{
    intro?: unknown[];
    projects?: unknown[];
  } | null>(`*[_id == "buildPage"][0]{ intro, projects }`);

  if (!before) {
    console.error("buildPage not found — run migrate-pages.ts first.");
    process.exit(1);
  }

  console.log(
    `Before: ${before.intro?.length ?? 0} intro blocks, ${before.projects?.length ?? 0} projects (left untouched)`,
  );

  const intro = buildIntro.map((p) => block(p));
  await client.patch("buildPage").set({ intro }).commit();

  const after = await client.fetch<{
    intro?: unknown[];
    projects?: unknown[];
  }>(`*[_id == "buildPage"][0]{ intro, projects }`);

  console.log(
    `After:  ${after.intro?.length ?? 0} intro blocks, ${after.projects?.length ?? 0} projects`,
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
