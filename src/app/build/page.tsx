import type { Metadata } from "next";
import Nav from "@/components/Nav";
import BuildBody from "@/components/BuildBody";
import { buildFromSanity } from "@/lib/buildFromSanity";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { getBuildPage, getSiteSettings } from "@/sanity/fetch";

// Build / Play Ground page. Content is Sanity-driven (buildPage singleton).

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getBuildPage(), getSiteSettings()]);
  return pageMetadataFromSanity(page?.seo, {
    title: "Build / Playground — Fas Lebbie, Ph.D.",
    description: site?.siteDescription?.trim(),
    ogImage: site?.ogImage,
    ogImageAlt: site?.ogImageAlt,
  });
}

export default async function BuildPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; project?: string }>;
}) {
  const params = await searchParams;
  const content = buildFromSanity(await getBuildPage());
  return (
    <>
      <Nav dark />
      <BuildBody
        content={content}
        initialView={params.view ?? null}
        initialProject={params.project ?? null}
      />
    </>
  );
}
