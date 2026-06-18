import Image from "next/image";
import Nav from "@/components/Nav";
import AboutContent from "@/components/AboutContent";
import { getAboutLogoSvgs } from "@/lib/logoSvgs";

const logoSvgs = getAboutLogoSvgs();

// About page (Figma "About Page" / 187:2596) — two columns: photo + heading on
// the left, the interactive bio on the right. Stacks on mobile.
export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16 lg:py-16">
        {/* Left column: heading + portrait. Centered on mobile (Figma 381:1177),
            left-aligned + sticky on desktop. */}
        <div className="flex flex-col items-center text-center lg:sticky lg:top-[88px] lg:items-start lg:self-start lg:text-left">
          {/* Figma 06/18: Helvetica 700, 50px, line-height 66.333px (≈1.327),
              uppercase, #000. */}
          <h1 className="whitespace-nowrap font-helvetica text-[50px] font-bold uppercase leading-[1.327] text-black">
            About me
          </h1>
          {/* Mobile: 271×299 on a #f0f0f0 plate, 72px below the heading (Figma).
              Desktop: tighter 260×286 in the sticky left rail. */}
          <Image
            src="/portrait.png"
            alt="Portrait of Fas Lebbie"
            width={271}
            height={299}
            priority
            className="mt-[72px] h-[299px] w-[271px] bg-[#f0f0f0] object-cover object-top lg:mt-6 lg:h-[286px] lg:w-[260px]"
          />
        </div>

        {/* Right column: interactive bio */}
        <AboutContent className="pb-24" logoSvgs={logoSvgs} />
      </main>
    </>
  );
}
