import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import BuildBody from "@/components/BuildBody";
import { buildFromSanity } from "@/lib/buildFromSanity";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { getBuildPage, getSiteSettings } from "@/sanity/fetch";

// /build/<project> — the Build page with that project's popup already open, so
// each project has an address to share (Fas, Nov 19 QA: "I don't see the URL
// changing for the build pages"). Opening a project on /build puts this
// address in the bar (usePopupRoute). Unknown slugs go back to /build.

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [page, site] = await Promise.all([getBuildPage(), getSiteSettings()]);
  const project = buildFromSanity(page).projects.find((p) => p.id === slug);
  return pageMetadataFromSanity(undefined, {
    title: project ? `${project.title} — Build — Fas Lebbie, Ph.D.` : "Build — Fas Lebbie, Ph.D.",
    description: project?.subtitle?.trim() || site?.siteDescription?.trim(),
    ogImage: site?.ogImage,
    ogImageAlt: site?.ogImageAlt,
  });
}

export default async function BuildProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = buildFromSanity(await getBuildPage());
  if (!content.projects.some((p) => p.id === slug)) redirect("/build");
  return (
    <>
      <Nav dark />
      <BuildBody content={content} initialProject={slug} />
    </>
  );
}
