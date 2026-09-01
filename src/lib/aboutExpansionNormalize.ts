import type { AboutToken } from "@/lib/content";

export function expansionEndsWithPeriod(tokens: AboutToken[]): boolean {
  for (let i = tokens.length - 1; i >= 0; i--) {
    const t = tokens[i];
    if (t.t === "text") return t.text.trimEnd().endsWith(".");
  }
  return false;
}

/** Drop stale leading keyword titles copied into expansion body copy. */
export function stripExpansionKeywordPrefix(
  keyword: string,
  tokens: AboutToken[],
): AboutToken[] {
  if (!tokens.length || tokens[0].t !== "text") return tokens;
  const first = tokens[0].text;
  const stripped = first
    .replace(new RegExp(`^${escapeRegExp(keyword)}\\s*[—–-]\\s*`, "i"), "")
    .replace(new RegExp(`^${escapeRegExp(keyword)}\\s*,\\s*`, "i"), "")
    .replace(new RegExp(`^${escapeRegExp(keyword)}\\s+`, "i"), "");
  if (stripped === first) return tokens;
  if (!stripped.trim()) return tokens.slice(1);
  return [{ t: "text", text: stripped }, ...tokens.slice(1)];
}

/**
 * When a grey pill is expanded, bio copy often carries the sentence period in the
 * next text run. Skip duplicate punctuation already present on the expansion.
 */
export function textAfterExpandedKey(
  text: string,
  expansion: AboutToken[],
): string | null {
  if (!expansionEndsWithPeriod(expansion)) return text;
  if (text === ".") return null;
  if (text.startsWith(". ")) return text.slice(1);
  return text;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
