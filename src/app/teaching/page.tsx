import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import Nav from "@/components/Nav";
import TeachingBody from "@/components/TeachingBody";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { teachingFromSanity } from "@/lib/teachingFromSanity";
import { STUDENT_PROJECTS_PATH, studentProjectPath } from "@/lib/teachingPaths";
import { getSiteSettings, getTeachingPage } from "@/sanity/fetch";

// Teaching page (philosophy). Content is Sanity-driven (teachingPage singleton).
// Student projects live at /teaching/student-projects[/<student>] since Nov 20
// (Fas doesn't like query strings); old ?view= / ?student= links 308 there.

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([
    getTeachingPage(),
    getSiteSettings(),
  ]);
  return pageMetadataFromSanity(page?.seo, {
    title: "Teaching — Fas Lebbie, Ph.D.",
    description: site?.siteDescription?.trim(),
    ogImage: site?.ogImage,
    ogImageAlt: site?.ogImageAlt,
  });
}

export default async function TeachingPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; student?: string; all?: string }>;
}) {
  const params = await searchParams;
  if (params.student) permanentRedirect(studentProjectPath(params.student));
  if (params.view === "works" || params.view === "img" || params.all === "1") {
    permanentRedirect(STUDENT_PROJECTS_PATH);
  }
  if (params.view !== undefined) permanentRedirect("/teaching");
  const content = teachingFromSanity(await getTeachingPage());
  return (
    <>
      <Nav dark />
      <TeachingBody content={content} initialView="philosophy" />
    </>
  );
}
