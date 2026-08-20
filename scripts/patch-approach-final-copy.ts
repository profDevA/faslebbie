/**
 * Patch leadershipPage (Approach) from holistic Figma `2890:74211`.
 * Preserves existing leadership moments for the gallery.
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
    const [text, expansion] = part;
    const mk = key();
    markDefs.push(
      expansion
        ? { _key: mk, _type: "expandPill", expansion }
        : { _key: mk, _type: "pill" },
    );
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

/** Fallback if the page has never had a pill label set. */
const EXPLORE_TEXT = "Explore my leadership moments";

async function main() {
  const existing = await client.fetch<{
    moments?: unknown[];
    exploreText?: string;
    sections?: { title?: string }[];
  }>(`*[_id == "leadershipPage"][0]{ moments, exploreText, "sections": sections[]{ title } }`);

  console.log(
    `before: ${existing?.sections?.length ?? 0} sections [${(existing?.sections ?? []).map((s) => s.title).join(", ")}], ${existing?.moments?.length ?? 0} moments`,
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
    contactText: "Get in touch",
    // Keep the pill label: the `.txt`/`.img` toggle was removed for QA `p`, so
    // this is the only route into the moments gallery. Blanking it orphans them.
    exploreText: existing?.exploreText || EXPLORE_TEXT,
    intro: [],
    lead: [],
    closing: [],
    momentsHeading: "",
    moments: existing?.moments ?? [],
  });

  console.log(
    `✓ patched leadershipPage (Approach) — ${sections.length} sections, ${existing?.moments?.length ?? 0} moments kept`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
