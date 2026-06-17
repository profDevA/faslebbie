import { readFileSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Nav from "@/components/Nav";
import AboutContent from "@/components/AboutContent";
import { aboutLogos } from "@/lib/content";

// Brand logos are self-contained SVG chips; read them once on the server and
// pass the raw markup down so they render inline (no <img> wrapper).
const logoSvgs = Object.fromEntries(
  Object.entries(aboutLogos).map(([name, { src }]) => [
    name,
    readFileSync(join(process.cwd(), "public", src), "utf8"),
  ]),
) as Record<keyof typeof aboutLogos, string>;

// About page (Figma "About Page" / 187:2596) — two columns: photo + heading on
// the left, the interactive bio on the right. Stacks on mobile.
export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16 lg:py-16">
        {/* Left column: heading + portrait */}
        <div className="lg:sticky lg:top-[88px] lg:self-start">
          {/* Figma: Druk Text Trial 700, 65px, uppercase, #000. We don't have
              Druk yet; the Archivo Black stand-in is wider, so it's sized down
              here to keep the left column narrow (≈ photo width) and give the
              bio its full width. Bump back toward 65px once real Druk lands. */}
          <h1 className="whitespace-nowrap font-druk text-[30px] font-bold uppercase leading-[1.02] tracking-tight text-black sm:text-[36px] lg:text-[44px]">
            About me
          </h1>
          <Image
            src="/portrait.png"
            alt="Portrait of Fas Lebbie"
            width={260}
            height={286}
            priority
            className="mt-6 h-[286px] w-[260px] object-cover object-top"
          />
        </div>

        {/* Right column: interactive bio */}
        <AboutContent className="pb-24" logoSvgs={logoSvgs} />
      </main>
    </>
  );
}
