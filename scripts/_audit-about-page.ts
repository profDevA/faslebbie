/**
 * One-off audit: print aboutPage bio + expansion keywords from Sanity.
 * Run: npx sanity exec scripts/_audit-about-page.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

type Span = { text?: string; marks?: string[] };
type Child = { _type?: string; text?: string; words?: string[]; name?: string };
type Block = { children?: Child[]; markDefs?: { _key: string; _type: string; href?: string }[] };

function spanText(child: Child, markDefs: Block["markDefs"]): string {
  if (child._type === "aboutTyper") return `[typer:${child.words?.join("|")}]`;
  if (child._type === "aboutLogo") return `[logo:${child.name}]`;
  if (child._type === "aboutPhoto") return "[photo]";
  const text = child.text ?? "";
  const marks = (child as Span).marks ?? [];
  for (const m of marks) {
    const def = markDefs?.find((d) => d._key === m);
    if (def?._type === "pill") return `[pill:${text}]`;
    if (def?._type === "redKey") return `[red:${text}]`;
    if (def?._type === "link") return `[link:${text}→${def.href}]`;
  }
  return text;
}

function blockToLine(block: Block): string {
  const markDefs = block.markDefs ?? [];
  return (block.children ?? []).map((c) => spanText(c, markDefs)).join("");
}

async function main() {
  const doc = await client.fetch<{
    headline?: string;
    intro?: Block[];
    bio?: Block[];
    expansions?: { keyword?: string; body?: Block[] }[];
  }>(`*[_id == "aboutPage"][0]{
    headline,
    intro,
    bio,
    expansions[]{ keyword, body }
  }`);

  console.log("HEADLINE:", JSON.stringify(doc?.headline ?? ""));
  console.log("INTRO paras:", doc?.intro?.length ?? 0);
  console.log("\n--- BIO ---");
  for (const [i, block] of (doc?.bio ?? []).entries()) {
    console.log(`${i + 1}. ${blockToLine(block)}`);
  }
  console.log("\n--- EXPANSIONS ---");
  for (const e of doc?.expansions ?? []) {
    const body = e.body?.[0] ? blockToLine(e.body[0]) : "";
    console.log(`• ${e.keyword}`);
    console.log(`  ${body.slice(0, 120)}${body.length > 120 ? "…" : ""}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
