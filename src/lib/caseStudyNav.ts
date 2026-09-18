/** Work listing `.txt` / `.img` — preserved when opening a full-page case study. */
export type WorkListingView = "txt" | "img";

export function parseWorkListingView(
  raw: string | string[] | undefined | null,
): WorkListingView | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "txt" || v === "img") return v;
  return null;
}

export function workListingHref(view: WorkListingView | null): string {
  if (view) return `/casestudies?view=${view}`;
  return "/casestudies";
}

export function caseStudyHref(
  slug: string,
  view: WorkListingView | null,
): string {
  const base = `/casestudies/${slug}`;
  if (view) return `${base}?view=${view}`;
  return base;
}
