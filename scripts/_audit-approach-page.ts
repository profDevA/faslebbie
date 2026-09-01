/**
 * One-off audit: print leadershipPage sections + expansion keywords.
 * Run: npx sanity exec scripts/_audit-approach-page.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

type MarkDef = { _key: string; _type: string; expansion?: string; href?: string; kind?: string };
type Span = { text?: string; marks?: string[] };
type Child = { _type?: string; text?: string; words?: string[] };
type Block = { children?: Child[]; markDefs?: MarkDef[] };

function spanText(child: Child, markDefs: MarkDef[]): string {
  if (child._type === "aboutTyper") return `[typer:${child.words?.join("|")}]`;
  const text = child.text ?? "";
  const marks = (child as Span).marks ?? [];
  for (const m of marks) {
    const def = markDefs.find((d) => d._key === m);
    if (def?._type === "expandPill") return `[pill:${text}]`;
    if (def?._type === "pill") return `[pill:${text}]`;
    if (def?._type === "action") return `[contact:${text}]`;
  }
  return text;
}

function blockToLine(block: Block): string {
  return (block.children ?? []).map((c) => spanText(c, block.markDefs ?? [])).join("");
}

async function main() {
  const doc = await client.fetch<{
    sections?: {
      title?: string;
      static?: boolean;
      blocks?: { subheading?: string; body?: Block[] }[];
    }[];
  }>(`*[_id == "leadershipPage"][0]{ sections[]{ title, static, blocks[]{ subheading, body } } }`);

  const expansions = new Set<string>();

  for (const sec of doc?.sections ?? []) {
    console.log(`\n## ${sec.title}${sec.static ? " (static)" : ""}`);
    for (const block of sec.blocks ?? []) {
      if (block.subheading) console.log(`  sub: ${block.subheading}`);
      const line = block.body?.[0] ? blockToLine(block.body[0]) : "";
      console.log(`  ${line}`);
      for (const md of block.body?.[0]?.markDefs ?? []) {
        if (md._type === "expandPill" && md.expansion) expansions.add(md.expansion.slice(0, 60) + "…");
      }
      for (const child of block.body?.[0]?.children ?? []) {
        const t = spanText(child, block.body![0].markDefs ?? []);
        if (t.startsWith("[pill:")) {
          const kw = t.slice(6, -1);
          const def = block.body![0].markDefs?.find((d) =>
            (child as Span).marks?.includes(d._key),
          );
          if (def?._type === "expandPill") expansions.add(kw);
        }
      }
    }
  }

  console.log(`\n--- PILL KEYWORDS (${expansions.size}) ---`);
  [...expansions].sort().forEach((k) => console.log(`• ${k}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
