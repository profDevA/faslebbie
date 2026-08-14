import type { Metadata } from "next";
import ExhibitionPageView from "@/components/ExhibitionPageView";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { getSiteSettings, getTeachingExhibition } from "@/sanity/fetch";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [exhibition, site] = await Promise.all([
    getTeachingExhibition(),
    getSiteSettings(),
  ]);
  return pageMetadataFromSanity(undefined, {
    title: exhibition.title
      ? `${exhibition.title} — Teaching — Fas Lebbie, Ph.D.`
      : "Exhibition — Teaching — Fas Lebbie, Ph.D.",
    description: site?.siteDescription?.trim(),
    ogImage: site?.ogImage,
    ogImageAlt: site?.ogImageAlt,
  });
}

export default async function ExhibitionPage() {
  const { tiles } = await getTeachingExhibition();
  return <ExhibitionPageView tiles={tiles} />;
}
