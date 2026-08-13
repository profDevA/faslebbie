/**
 * @deprecated Use patch-about-expansions.ts instead.
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import type { AboutToken } from "../src/lib/content";
import { ABOUT_EXPANSIONS } from "./about-expansions-data";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function tokensToBody(tokens: AboutToken[]) {
  const text = tokens
    .filter((t): t is Extract<AboutToken, { t: "text" }> => t.t === "text")
    .map((t) => t.text)
    .join("");
  return [
    {
      _type: "block" as const,
      _key: key(),
      style: "normal" as const,
      markDefs: [],
      children: [
        {
          _type: "span" as const,
          _key: key(),
          text,
          marks: [] as string[],
        },
      ],
    },
  ];
}

async function main() {
  console.warn("Use scripts/patch-about-expansions.ts for new runs.");
  const doc = await client.fetch<{
    _id: string;
    expansions?: { _key?: string; keyword?: string }[];
  } | null>(`*[_type == "aboutPage"][0]{ _id, expansions[]{ _key, keyword } }`);

  if (!doc?._id) throw new Error("No aboutPage document");

  const prevByKeyword = new Map(
    (doc.expansions ?? [])
      .filter((e) => e.keyword)
      .map((e) => [e.keyword!, e]),
  );

  const expansions = Object.entries(ABOUT_EXPANSIONS).map(
    ([keyword, tokens]) => {
      const prev = prevByKeyword.get(keyword);
      return {
        _type: "aboutExpansion" as const,
        _key: prev?._key ?? key(),
        keyword,
        body: tokensToBody(tokens),
      };
    },
  );

  await client.patch(doc._id).set({ expansions }).commit();
  console.log(`patched ${doc._id}: ${expansions.length} keyword expansions`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
