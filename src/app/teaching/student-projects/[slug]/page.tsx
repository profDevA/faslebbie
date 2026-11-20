import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import TeachingBody from "@/components/TeachingBody";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { teachingFromSanity } from "@/lib/teachingFromSanity";
import { STUDENT_PROJECTS_PATH } from "@/lib/teachingPaths";
import {
  findStudent,
  getSiteSettings,
  getStudentSlugs,
  getTeachingPage,
} from "@/sanity/fetch";

// /teaching/student-projects/<student> — Teaching with that student's popup
// open, so each project has a clean address to share (no query string; Fas,
// Nov 20). Unknown students go back to the grid.

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
    title: `${found.project.title} — Student Projects — Fas Lebbie, Ph.D.`,
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
  const content = teachingFromSanity(await getTeachingPage());
  if (!content.students.some((s) => s.id === slug)) redirect(STUDENT_PROJECTS_PATH);
  return (
    <>
      <Nav dark />
      <TeachingBody content={content} initialView="works" initialStudent={slug} />
    </>
  );
}
