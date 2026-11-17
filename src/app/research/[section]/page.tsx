import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import ResearchBody from "@/components/ResearchBody";
import ResearchWatermark from "@/components/ResearchWatermark";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { researchSectionOrder, type ResearchSectionId } from "@/lib/research";
import { researchFromSanity } from "@/lib/researchFromSanity";
import { getResearchPage, getSiteSettings } from "@/sanity/fetch";

// /research/<section> — the Research page with that popup already open, so
// each popup has an address to share and for search engines (Fas, Nov 16
// evening: "there's no URL for them so no one can find them"). Opening a
// popup on /research puts this address in the bar (usePopupRoute).

export const revalidate = 60;

const SECTION_TITLE: Record<ResearchSectionId, string> = {
  paradigms: "Paradigms",
  principles: "Principles",
  modalities: "Modalities",
  manifesto: "Manifesto",
  "field-notes": "Field Notes",
};

function sectionId(raw: string): ResearchSectionId | null {
  return researchSectionOrder.includes(raw as ResearchSectionId)
    ? (raw as ResearchSectionId)
    : null;
}

export function generateStaticParams() {
  return researchSectionOrder.map((section) => ({ section }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const id = sectionId(section);
  const [page, site] = await Promise.all([getResearchPage(), getSiteSettings()]);
  const s = id ? researchFromSanity(page).sections[id] : undefined;
  const label = s && "label" in s && s.label ? s.label : id ? SECTION_TITLE[id] : "Research";
  const intro =
    s && "intro" in s ? s.intro : s && "statement" in s ? s.statement : "";
  return pageMetadataFromSanity(undefined, {
    title: `${label} — Research — Fas Lebbie, Ph.D.`,
    description: intro?.trim() || site?.siteDescription?.trim(),
    ogImage: site?.ogImage,
    ogImageAlt: site?.ogImageAlt,
  });
}

export default async function ResearchSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const id = sectionId(section);
  if (!id) notFound();
  const content = researchFromSanity(await getResearchPage());
  if (!content.sections[id]) notFound();
  return (
    <>
      <Nav dark />
      <ResearchWatermark />
      <ResearchBody content={content} initialOpen={id} />
    </>
  );
}
