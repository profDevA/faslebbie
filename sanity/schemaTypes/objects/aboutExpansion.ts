import { defineType } from "sanity";

// The keyword <-> pill link is a plain string match, so renaming a pill in the
// Bio without renaming it here would leave a pill that expands to nothing. The
// Studio can't prevent that, but it can point it out: collect every grey pill in
// the document (the bio AND other expansions, since pills nest) and flag a
// keyword that matches none of them.
type Block = {
  _type?: string;
  markDefs?: { _key?: string; _type?: string }[];
  children?: { _type?: string; text?: string; marks?: string[] }[];
};

function pillTexts(blocks: unknown, into: Set<string>) {
  if (!Array.isArray(blocks)) return;
  for (const block of blocks as Block[]) {
    if (block?._type !== "block") continue;
    const pillKeys = new Set(
      (block.markDefs ?? [])
        .filter((d) => d?._type === "pill")
        .map((d) => d._key),
    );
    if (!pillKeys.size) continue;
    for (const child of block.children ?? []) {
      if (child?._type !== "span" || !child.text) continue;
      if ((child.marks ?? []).some((m) => pillKeys.has(m))) into.add(child.text);
    }
  }
}

// One grey keyword's reveal copy. `keyword` must match the pill's words in the
// bio EXACTLY — that string is the lookup key at render time.
//
// `body` is full aboutProse rather than a plain string so an expansion can hold
// its own grey pills. The bio's "sustainable minerals" passage relies on this:
// it nests ten further keywords ("design decisions", "Mineral Choreography", …)
// that expand in turn.
export const aboutExpansion = defineType({
  name: "aboutExpansion",
  title: "Keyword expansion",
  type: "object",
  fields: [
    {
      name: "keyword",
      title: "Keyword",
      type: "string",
      description:
        "Must match the grey pill's text exactly, including capitalisation.",
      validation: (r) => [
        r.required(),
        r.custom((keyword, context) => {
          if (typeof keyword !== "string" || !keyword) return true;
          const doc = context.document as
            | { bio?: unknown; expansions?: { body?: unknown }[] }
            | undefined;
          if (!doc) return true;
          const found = new Set<string>();
          pillTexts(doc.bio, found);
          for (const e of doc.expansions ?? []) pillTexts(e?.body, found);
          // Nothing marked up yet — don't nag on a half-filled document.
          if (!found.size) return true;
          return found.has(keyword)
            ? true
            : `No grey keyword reads exactly "${keyword}". This expansion won't show until the text matches a pill in the Bio (or inside another expansion).`;
        }).warning(),
      ],
    },
    {
      name: "body",
      title: "Reveal copy",
      type: "aboutProse",
      description:
        "Flows on from the keyword inline. May contain its own grey pills.",
    },
  ],
  preview: {
    select: { title: "keyword" },
    prepare: ({ title }: { title?: string }) => ({
      title: title ?? "(no keyword)",
    }),
  },
});
