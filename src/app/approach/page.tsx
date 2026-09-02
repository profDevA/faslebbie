import type { Metadata } from "next";
import Nav from "@/components/Nav";
import LeadershipBody from "@/components/LeadershipBody";
import { leadershipFromSanity } from "@/lib/leadershipFromSanity";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { getLeadershipPage, getSiteSettings } from "@/sanity/fetch";

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([
    getLeadershipPage(),
    getSiteSettings(),
  ]);
  return pageMetadataFromSanity(page?.seo, {
    title: "Approach — Fas Lebbie, Ph.D.",
    description: site?.siteDescription?.trim(),
    ogImage: site?.ogImage,
    ogImageAlt: site?.ogImageAlt,
  });
}

export default async function ApproachPage() {
  const raw = await getLeadershipPage();
  const content = leadershipFromSanity(raw);
  return (
    <>
      <Nav dark />
      <LeadershipBody content={content} />
    </>
  );
}
