import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StudentWorksPageView from "@/components/StudentWorksPageView";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { teachingFromSanity } from "@/lib/teachingFromSanity";
import {
  findStudent,
  getSiteSettings,
  getStudentSlugs,
  getTeachingPage,
} from "@/sanity/fetch";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getStudentSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [found, site] = await Promise.all([findStudent(slug), getSiteSettings()]);
  if (!found) return {};
  return pageMetadataFromSanity(undefined, {
    title: `${found.project.title} — Student Works — Fas Lebbie, Ph.D.`,
    description: found.project.description || site?.siteDescription?.trim(),
    ogImage: found.project.images?.[0] || site?.ogImage,
    ogImageAlt: site?.ogImageAlt || found.project.title,
  });
}

export default async function StudentProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [found, content] = await Promise.all([
    findStudent(slug),
    teachingFromSanity(await getTeachingPage()),
  ]);
  if (!found) notFound();

  return (
    <StudentWorksPageView
      students={found.students}
      activeId={found.project.id}
      studentsWorkIntro={content.studentsWorkIntro}
    />
  );
}
