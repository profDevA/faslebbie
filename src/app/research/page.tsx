import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ResearchBody from "@/components/ResearchBody";
import ResearchWatermark from "@/components/ResearchWatermark";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { researchFromSanity } from "@/lib/researchFromSanity";
import { getResearchPage, getSiteSettings } from "@/sanity/fetch";

// Research page (Figma "Faslebbie July Hollistic" 28fl2XqojJTa3jEblotAaz,
// frames 1-40936 → 1-41873). Mirrors the About/Leadership architecture: a big
// "Research" watermark recedes as the dimmed portrait + prose brighten forward,
// and red words open the paged "Minerals & Post-Extractive Design" modal
// (paradigms / principles / modalities / manifesto / field notes).
//
// Content is Sanity-driven (researchPage singleton); the in-code copy in
// Content from Sanity researchPage only (empty Studio = empty UI).

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([
    getResearchPage(),
    getSiteSettings(),
  ]);
  return pageMetadataFromSanity(page?.seo, {
    title: "Research — Fas Lebbie, Ph.D.",
    description: site?.siteDescription?.trim(),
    ogImage: site?.ogImage,
    ogImageAlt: site?.ogImageAlt,
  });
}

export default async function ResearchPage() {
  const content = researchFromSanity(await getResearchPage());
  return (
    <>
      <Nav dark />
      <ResearchWatermark />
      <ResearchBody content={content} />
    </>
  );
}
