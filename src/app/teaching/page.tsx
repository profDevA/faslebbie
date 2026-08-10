import type { Metadata } from "next";
import { Suspense } from "react";
import Nav from "@/components/Nav";
import TeachingBody from "@/components/TeachingBody";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { teachingFromSanity } from "@/lib/teachingFromSanity";
import { getSiteSettings, getTeachingPage } from "@/sanity/fetch";

// Teaching page. Content is Sanity-driven (teachingPage singleton) only.

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

export default async function TeachingPage() {
  const content = teachingFromSanity(await getTeachingPage());
  return (
    <>
      <Nav dark />
      <Suspense fallback={null}>
        <TeachingBody content={content} />
      </Suspense>
    </>
  );
}
