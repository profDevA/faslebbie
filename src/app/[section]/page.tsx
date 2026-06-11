import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";

// Placeholder pages for sections that come after the homepage (Phase 2+).
const sections: Record<string, string> = {
  work: "Work",
  research: "Research",
  build: "Build",
  teaching: "Teaching / Mentorship",
  leadership: "Leadership",
  blogs: "Blogs & Media",
  contact: "Contact",
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
      <Nav />
      <main className="mx-auto flex w-full max-w-[1088px] flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-serif text-[clamp(28px,4vw,48px)] font-bold leading-[1.35] tracking-[0.04em]">
          {title}
          <span className="text-accent">.</span>
        </h1>
        <p className="mt-6 font-serif text-[16px] font-medium tracking-[0.06em]">
          This section is coming soon.
        </p>
        <Link
          href="/"
          data-cursor="hover"
          className="mt-10 font-serif text-[16px] font-medium text-accent underline underline-offset-2"
        >
          ← Back to home
        </Link>
      </main>
    </>
  );
}
