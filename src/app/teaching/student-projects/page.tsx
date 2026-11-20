import type { Metadata } from "next";
import Nav from "@/components/Nav";
import TeachingBody from "@/components/TeachingBody";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { teachingFromSanity } from "@/lib/teachingFromSanity";
import { getSiteSettings, getTeachingPage } from "@/sanity/fetch";

// /teaching/student-projects — the Teaching page on its ".student projects"
// view (was /teaching?view=works; Fas doesn't like query strings, Nov 20).

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getTeachingPage(), getSiteSettings()]);
  return pageMetadataFromSanity(undefined, {
    title: "Student Projects — Teaching — Fas Lebbie, Ph.D.",
    description: page?.studentsWorkIntro?.trim() || site?.siteDescription?.trim(),
    ogImage: site?.ogImage,
    ogImageAlt: site?.ogImageAlt,
  });
}

export default async function StudentProjectsPage() {
  const content = teachingFromSanity(await getTeachingPage());
  return (
    <>
      <Nav dark />
      <TeachingBody content={content} initialView="works" />
    </>
  );
}
