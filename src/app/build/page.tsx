import type { Metadata } from "next";
import { Suspense } from "react";
import Nav from "@/components/Nav";
import BuildBody from "@/components/BuildBody";
import { buildFromSanity } from "@/lib/buildFromSanity";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { getBuildPage, getSiteSettings } from "@/sanity/fetch";

// Build / Play Ground page. Content is Sanity-driven (buildPage singleton); the
// Content from Sanity buildPage only (empty Studio = empty UI).

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getBuildPage(), getSiteSettings()]);
  return pageMetadataFromSanity(page?.seo, {
    title: "Build / Playground — Fas Lebbie, Ph.D.",
    description: site?.siteDescription?.trim(),
    ogImage: site?.ogImage,
    ogImageAlt: site?.ogImageAlt,
  });
}

export default async function BuildPage() {
  const content = buildFromSanity(await getBuildPage());
  return (
    <>
      <Nav dark />
      <Suspense fallback={null}>
        <BuildBody content={content} />
      </Suspense>
    </>
  );
}
