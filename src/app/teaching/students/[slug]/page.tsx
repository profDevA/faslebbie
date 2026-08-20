import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import {
  findStudent,
  getSiteSettings,
  getStudentSlugs,
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
  const found = await findStudent(slug);
  if (!found) notFound();
  redirect(`/teaching?view=works&student=${encodeURIComponent(slug)}`);
}
