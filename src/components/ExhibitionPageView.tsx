"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import ExhibitionScrollCollage from "@/components/ExhibitionScrollCollage";
import ExhibitionWatermark from "@/components/ExhibitionWatermark";
import { POPUP_LINK } from "@/components/InlineToken";
import type { ExhibitionTile } from "@/lib/teaching";

function ExhibitionIntro({
  className = "",
  size = "desktop",
  heading,
  intro,
  cta,
}: {
  className?: string;
  size?: "desktop" | "mobile";
  heading: string;
  intro: string;
  cta: string;
}) {
  const mobile = size === "mobile";
  return (
    <div
      className={`flex flex-col items-center text-center ${
        mobile
          ? "w-full max-w-[332px] gap-[11px]"
          : "max-w-[677px] gap-[14px]"
      } ${className}`}
    >
      <h1
        className={
          mobile
            ? "font-grotesk text-[24px] font-medium leading-[1.1] tracking-[-0.44px] text-black"
            : "font-grotesk text-[50px] font-normal leading-[54.5px] tracking-[-0.55px] text-black"
        }
      >
        {heading}
      </h1>
      <p
        className={
          mobile
            ? "font-grotesk text-[10px] font-light leading-[13.5px] tracking-[0.8px] text-black"
            : "max-w-[579px] font-grotesk text-[14px] font-light leading-[17px] tracking-[1px] text-black"
        }
      >
        {intro}
      </p>
      <Link
        href="/teaching?view=works"
        data-cursor="hover"
        className={`${POPUP_LINK} pointer-events-auto font-grotesk font-medium ${
          mobile
            ? "text-[13px] tracking-[0.8px]"
            : "text-[20px] tracking-[1px]"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

export default function ExhibitionPageView({
  tiles,
  heading,
  intro,
  cta,
}: {
  tiles: ExhibitionTile[];
  heading: string;
  intro: string;
  cta: string;
}) {
  return (
    <>
      <Nav dark />
      <div className="relative min-h-dvh">
        <ExhibitionWatermark />
        <main className="relative z-10 bg-page/80">
          <p className="pointer-events-none absolute left-0 right-0 top-[82px] z-30 px-[13px] pt-6 font-grotesk text-[18px] font-light leading-[1.6] tracking-[0.38px] text-black lg:px-12 lg:pt-10">
            <Link
              href="/teaching"
              data-cursor="hover"
              className="pointer-events-auto hover:opacity-70"
            >
              Teaching
            </Link>
            <span className="mx-1">/</span>
            <span className="underline decoration-from-font underline-offset-4">
              Student Exhibitions
            </span>
          </p>

          <div className="relative">
            <ExhibitionScrollCollage tiles={tiles} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[82px] z-20 flex items-center justify-center px-[35px] lg:px-6">
              <ExhibitionIntro
                className="lg:hidden"
                size="mobile"
                heading={heading}
                intro={intro}
                cta={cta}
              />
              <ExhibitionIntro
                className="hidden lg:flex"
                heading={heading}
                intro={intro}
                cta={cta}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
