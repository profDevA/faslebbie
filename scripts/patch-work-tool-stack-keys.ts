/**
 * Add missing `_key` on Work Page → toolStack items (Studio list editing).
 * Does not re-upload logos.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-work-tool-stack-keys.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type StackItem = {
  _key?: string;
  _type?: string;
  label?: string;
  logo?: unknown;
};

async function main() {
  const docs = await client.fetch<{ _id: string; toolStack?: StackItem[] }[]>(
    `*[_type == "workPage"]{ _id, toolStack }`,
  );
  if (!docs.length) throw new Error("No workPage document");

  for (const doc of docs) {
    const toolStack = (doc.toolStack ?? []).map((item) => ({
      ...item,
      _key: item._key ?? key(),
    }));

    const added = toolStack.filter(
      (item, i) => !doc.toolStack?.[i]?._key,
    ).length;

    await client.patch(doc._id).set({ toolStack }).commit();

    console.log(
      `patched ${doc._id}: ${toolStack.length} stack icons (${added} keys added)`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
