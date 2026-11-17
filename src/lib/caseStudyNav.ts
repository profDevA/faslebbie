/** Work listing `.txt` / `.img` — preserved when opening a full-page case study. */
export type WorkListingView = "txt" | "img";

/**
 * Case-study URLs stay clean (`/work/<slug>`, no `?view=txt` — Fas,
 * Nov 16 evening: "I need to clean up the URL"). The Work view a visitor came
 * from is remembered for this tab instead, so "Case Studies" / × go back to it.
 * Old links with `?view=` still work.
 */
const WORK_VIEW_KEY = "fas-work-view";

export function rememberWorkView(view: WorkListingView): void {
  try {
    sessionStorage.setItem(WORK_VIEW_KEY, view);
  } catch {
    /* blocked storage */
  }
}

export function readRememberedWorkView(): WorkListingView | null {
  try {
    return parseWorkListingView(sessionStorage.getItem(WORK_VIEW_KEY));
  } catch {
    return null;
  }
}

export function parseWorkListingView(
  raw: string | string[] | undefined | null,
): WorkListingView | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "txt" || v === "img") return v;
  return null;
}

export function workListingHref(view: WorkListingView | null): string {
  if (view) return `/work?view=${view}`;
  return "/work";
}

export function caseStudyHref(slug: string): string {
  return `/work/${slug}`;
}
