import Image from "next/image";
import Nav from "@/components/Nav";
import AboutContent from "@/components/AboutContent";

// About page (Figma "About Page" / 187:2596) — two columns: photo + heading on
// the left, the interactive bio on the right. Stacks on mobile.
export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16 lg:py-16">
        {/* Left column: heading + portrait */}
        <div className="lg:sticky lg:top-[88px] lg:self-start">
          <h1 className="font-grotesk text-[40px] font-bold uppercase leading-[0.95] tracking-tight sm:text-[52px] lg:text-[44px]">
            About me
          </h1>
          <Image
            src="/portrait.png"
            alt="Portrait of Fas Lebbie"
            width={260}
            height={286}
            priority
            className="mt-6 h-[286px] w-[260px] object-cover object-top lg:h-[300px] lg:w-full"
          />
        </div>

        {/* Right column: interactive bio */}
        <AboutContent className="pb-24" />
      </main>
    </>
  );
}
