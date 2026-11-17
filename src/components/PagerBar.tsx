import Link from "next/link";

import { CS_RED } from "@/components/caseStudyView/constants";
import { csPagerShell, csShell } from "@/components/caseStudyView/layoutClasses";
import { csUiText } from "@/components/caseStudyView/typography";

/**
 * The bottom "< Previous · Next >" bar of a full page — case studies first,
 * blog posts since Nov 17 (Fas, Nov 16 evening: "there's no way to go to the
 * next blog… we already have it on case studies, making this universal").
 * Sticky on mobile, static at the foot of the page on desktop.
 */
export default function PagerBar({
  prevHref,
  nextHref,
}: {
  prevHref: string;
  nextHref: string;
}) {
  return (
    <div className="sticky bottom-0 z-50 flex min-h-12 shrink-0 items-center border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom,0px)] lg:static lg:pb-0">
      <div className={`w-full ${csShell()}`}>
        <div
          className={`${csPagerShell()} reckless-prose font-normal ${csUiText()}`}
          style={{ color: CS_RED }}
        >
          <Link
            href={prevHref}
            data-cursor="hover"
            className="transition-opacity hover:opacity-70"
          >
            &lt; Previous
          </Link>
          <Link
            href={nextHref}
            data-cursor="hover"
            className="transition-opacity hover:opacity-70"
          >
            Next &gt;
          </Link>
        </div>
      </div>
    </div>
  );
}
