import Link from "next/link";

import { CS_RED } from "@/components/caseStudyView/constants";
import { csPagerShell, csShell } from "@/components/caseStudyView/layoutClasses";
import { csUiText } from "@/components/caseStudyView/typography";
import PagerDots from "@/components/PagerDots";

/**
 * The bottom "< Previous · Next >" bar of a full page — case studies first,
 * blog posts since Nov 17 (Fas, Nov 16 evening: "there's no way to go to the
 * next blog… we already have it on case studies, making this universal").
 * Sticky on mobile, static at the foot of the page on desktop.
 *
 * Nov 20: the same dots as the popups sit between the two links (Fas, Nov 19
 * QA: "pop-ups as well as case studies or anything that has next or previous
 * use this modern style") — each segment links to that study / post.
 */
export default function PagerBar({
  prevHref,
  nextHref,
  dots,
}: {
  prevHref: string;
  nextHref: string;
  /** Every page in order, with the current one — draws the dot pager. */
  dots?: { hrefs: string[]; labels: string[]; active: number };
}) {
  return (
    // data-pager-bar: the floating intro-video card sits above this bar.
    <div data-pager-bar className="sticky bottom-0 z-50 flex min-h-12 shrink-0 items-center border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom,0px)] lg:static lg:pb-0">
      <div className={`w-full ${csShell()}`}>
        <div
          className={`${csPagerShell()} reckless-prose font-normal ${csUiText()}`}
          style={{ color: CS_RED }}
        >
          <Link
            href={prevHref}
            data-cursor="hover"
            className="shrink-0 whitespace-nowrap transition-opacity hover:opacity-70"
          >
            &lt; Previous
          </Link>
          {dots && dots.hrefs.length > 1 ? (
            <PagerDots
              className="flex min-w-0"
              count={dots.hrefs.length}
              active={dots.active}
              hrefs={dots.hrefs}
              labels={dots.labels}
            />
          ) : null}
          <Link
            href={nextHref}
            data-cursor="hover"
            className="shrink-0 whitespace-nowrap transition-opacity hover:opacity-70"
          >
            Next &gt;
          </Link>
        </div>
      </div>
    </div>
  );
}
