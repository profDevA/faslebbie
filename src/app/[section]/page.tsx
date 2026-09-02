import { notFound } from "next/navigation";
import { NavPill } from "@/components/InlineToken";
import Nav from "@/components/Nav";

// Placeholder pages for sections that come after the homepage (Phase 2+).
// NOTE: "casestudies", "research", "approach", "build",
// "teaching", and "blogs" are intentionally omitted — they have their own
// static routes. "contact" is a slide-in drawer (see ContactDrawer / Nav),
// not a page.
const sections: Record<string, string> = {
  story: "My Story",
};

export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = sections[section];
  if (!title) notFound();

  return (
    <>
      <Nav dark />
      <main className="mx-auto flex w-full max-w-272 flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-grotesk text-[32px] font-bold leading-[1.35] tracking-[0.04em] md:text-[40px] lg:text-[48px]">
          {title}
          <span className="text-accent">.</span>
        </h1>
        <p className="mt-6 font-grotesk text-[16px] font-medium tracking-[0.06em]">
          This section is coming soon.
        </p>
        <NavPill href="/" className="mt-10 font-grotesk text-[16px] font-medium">
          ← Back to home
        </NavPill>
      </main>
    </>
  );
}
