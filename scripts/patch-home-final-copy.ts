/**
 * Patch homePage hero + Site Settings logo from final copy doc.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-home-final-copy.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type MarkDef = Record<string, unknown> & { _key: string; _type: string };
interface SpanBuild {
  text: string;
  markDef?: Omit<MarkDef, "_key">;
}

function block(spans: SpanBuild[]) {
  const markDefs: MarkDef[] = [];
  const children = spans.map((s) => {
    const marks: string[] = [];
    if (s.markDef) {
      const _key = key();
      markDefs.push({ _key, ...s.markDef } as MarkDef);
      marks.push(_key);
    }
    return { _type: "span", _key: key(), text: s.text, marks };
  });
  return { _type: "block", _key: key(), style: "normal", markDefs, children };
}

function kw(text: string, href: string): SpanBuild {
  return { text, markDef: { _type: "keyword", href } };
}

function story(text: string, href = "/about"): SpanBuild {
  return { text, markDef: { _type: "story", href } };
}

const HERO = block([
  { text: "I " },
  kw("design", "/casestudies"),
  { text: " digital product experiences and " },
  kw("research", "/research"),
  {
    text: " the material (minerals), immaterial (AI), and leadership systems that support them. I ",
  },
  kw("teach", "/teaching"),
  { text: ", " },
  kw("write", "/blogs"),
  { text: ", " },
  kw("prototype", "/build"),
  {
    text: ", and advise on design and research. This feedback loop shapes my ",
  },
  kw("approach", "/approach"),
  {
    text: ", treating design and research as tools to reduce risk in product innovation and long-term system transitions. ",
  },
  story("More to my story."),
]);

async function main() {
  await client.createOrReplace({
    _id: "homePage",
    _type: "homePage",
    hero: [HERO],
    storyHref: "/about",
  });
  console.log("✓ patched homePage — final hero copy");

  const settingsId: string | null = await client.fetch(
    `*[_type == "siteSettings"][0]._id`,
  );
  if (settingsId) {
    await client.patch(settingsId).set({ logoName: "Fas Lebbie" }).commit();
    console.log('✓ patched siteSettings — logoName "Fas Lebbie"');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
