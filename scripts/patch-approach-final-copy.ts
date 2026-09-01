/**
 * Patch leadershipPage (Approach) from Final Edits_faslebbiesite.docx (Aug 2026).
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-approach-final-copy.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import {
  APPROACH_SECTIONS,
  type ProsePart,
} from "./approach-final-copy-data";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type MarkDef = Record<string, unknown> & { _key: string; _type: string };

function proseBlock(parts: ProsePart[]) {
  const markDefs: MarkDef[] = [];
  const children: Record<string, unknown>[] = [];

  for (const part of parts) {
    if (typeof part === "string") {
      if (!part) continue;
      children.push({ _type: "span", _key: key(), text: part, marks: [] });
      continue;
    }
    const [text, meta] = part;
    const mk = key();
    if (meta && typeof meta === "object" && "contact" in meta) {
      markDefs.push({ _key: mk, _type: "action", kind: "contact" });
    } else {
      const expansion = meta as string | undefined;
      markDefs.push(
        expansion
          ? { _key: mk, _type: "expandPill", expansion }
          : { _key: mk, _type: "pill" },
      );
    }
    children.push({ _type: "span", _key: key(), text, marks: [mk] });
  }

  return {
    _type: "block" as const,
    _key: key(),
    style: "normal",
    markDefs,
    children,
  };
}

async function main() {
  const existing = await client.fetch<{ sections?: { title?: string }[] }>(
    `*[_id == "leadershipPage"][0]{ "sections": sections[]{ title } }`,
  );

  console.log(
    `before: ${existing?.sections?.length ?? 0} sections [${(existing?.sections ?? []).map((s) => s.title).join(", ")}]`,
  );

  const sections = APPROACH_SECTIONS.map((section) => ({
    _type: "approachSection" as const,
    _key: key(),
    title: section.title,
    static: section.static ?? false,
    blocks: section.blocks.map((block) => ({
      _type: "approachBlock" as const,
      _key: key(),
      ...(block.subheading ? { subheading: block.subheading } : {}),
      body: [proseBlock(block.parts)],
    })),
  }));

  await client.createOrReplace({
    _id: "leadershipPage",
    _type: "leadershipPage",
    sections,
    contactText: "",
  });

  console.log(`✓ patched leadershipPage (Approach) — ${sections.length} sections`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
