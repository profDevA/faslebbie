import type { Metadata } from "next";
import StudentWorksPageView from "@/components/StudentWorksPageView";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { teachingFromSanity } from "@/lib/teachingFromSanity";
import { getSiteSettings, getTeachingPage } from "@/sanity/fetch";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [content, site] = await Promise.all([
    teachingFromSanity(await getTeachingPage()),
    getSiteSettings(),
  ]);
  return pageMetadataFromSanity(undefined, {
    title: "Student's Work — Fas Lebbie, Ph.D.",
    description: content.studentsWorkIntro || site?.siteDescription?.trim(),
    ogImage: content.students[0]?.images?.[0] || site?.ogImage,
    ogImageAlt: site?.ogImageAlt || "Student's Work",
  });
}

export default async function StudentsHubPage() {
  const content = teachingFromSanity(await getTeachingPage());

  return (
    <StudentWorksPageView
      students={content.students}
      studentsWorkIntro={content.studentsWorkIntro}
    />
  );
}
