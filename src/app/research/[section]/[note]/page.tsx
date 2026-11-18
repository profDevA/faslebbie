import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import ResearchBody from "@/components/ResearchBody";
import ResearchWatermark from "@/components/ResearchWatermark";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { researchFromSanity } from "@/lib/researchFromSanity";
import { getResearchPage, getSiteSettings } from "@/sanity/fetch";

// /research/field-notes/<n> — the Research page with the Field Notes popup open
// on note n (1-based), so every note can be shared and found (Xian, Nov 18).
// Paging inside the popup keeps the address in step (ResearchBody).
// Only Field Notes has notes; any other section here is a 404.

export const revalidate = 60;

async function load(section: string, note: string) {
  if (section !== "field-notes" || !/^\d+$/.test(note)) return null;
  const content = researchFromSanity(await getResearchPage());
  const fieldNotes = content.sections["field-notes"];
  if (fieldNotes?.kind !== "field-notes") return null;
  const index = Number(note) - 1;
  const item = fieldNotes.notes[index];
  return item ? { content, index, item } : null;
}

export async function generateStaticParams() {
  const content = researchFromSanity(await getResearchPage());
  const fieldNotes = content.sections["field-notes"];
  const count = fieldNotes?.kind === "field-notes" ? fieldNotes.notes.length : 0;
  return Array.from({ length: count }, (_, i) => ({ section: "field-notes", note: String(i + 1) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; note: string }>;
}): Promise<Metadata> {
  const { section, note } = await params;
  const [found, site] = await Promise.all([load(section, note), getSiteSettings()]);
  return pageMetadataFromSanity(undefined, {
    title: found?.item.quote
      ? `${found.item.quote} — Field Notes — Fas Lebbie, Ph.D.`
      : "Field Notes — Research — Fas Lebbie, Ph.D.",
    description: found?.item.insight?.trim() || site?.siteDescription?.trim(),
    ogImage: found?.item.image || site?.ogImage,
    ogImageAlt: found?.item.place || site?.ogImageAlt,
  });
}

export default async function FieldNotePage({
  params,
}: {
  params: Promise<{ section: string; note: string }>;
}) {
  const { section, note } = await params;
  const found = await load(section, note);
  if (!found) notFound();
  return (
    <>
      <Nav dark />
      <ResearchWatermark />
      <ResearchBody content={found.content} initialOpen="field-notes" initialNote={found.index} />
    </>
  );
}
