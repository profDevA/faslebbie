import type { Metadata } from "next";
import Nav from "@/components/Nav";
import V2Hero from "@/components/V2Hero";
import { homeFromSanity } from "@/lib/homeFromSanity";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { getHomePage, getSiteSettings } from "@/sanity/fetch";

// Homepage — wordmark dissolve + centered portrait/bio (Figma 2218:75431).
// Wordmark keeps original layout (no corner photo). Keywords → pages; story+ → About.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [home, site] = await Promise.all([getHomePage(), getSiteSettings()]);
  return pageMetadataFromSanity(home?.seo, {
    title: site?.siteTitle?.trim() || "Fas Lebbie, Ph.D.",
    description: site?.siteDescription?.trim(),
    ogImage: site?.ogImage,
    ogImageAlt: site?.ogImageAlt,
  });
}

export default async function Home() {
  const content = homeFromSanity(await getHomePage());
  return (
    <>
      <Nav dark />
      <main className="flex flex-1 flex-col">
        <V2Hero content={content} />
      </main>
    </>
  );
}
