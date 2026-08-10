import type { Metadata } from "next";
import Nav from "@/components/Nav";
import AboutBody from "@/components/AboutBody";
import AboutWatermark from "@/components/AboutWatermark";
import { getAboutLogoSvgs } from "@/lib/logoSvgs";
import { aboutFromSanity } from "@/lib/aboutFromSanity";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { getAboutPage, getSiteSettings } from "@/sanity/fetch";
import { loadTestimonials } from "@/lib/testimonials";

const logoSvgs = getAboutLogoSvgs();

// About page — bio / links / testimonials from Sanity only.
// Brand logos stay on disk (inlined SVG for hover-wobble).

export async function generateMetadata(): Promise<Metadata> {
  const [about, site] = await Promise.all([getAboutPage(), getSiteSettings()]);
  return pageMetadataFromSanity(about?.seo, {
    title: "About — Fas Lebbie, Ph.D.",
    description: site?.siteDescription?.trim(),
    ogImage: site?.ogImage,
    ogImageAlt: site?.ogImageAlt,
  });
}

export default async function AboutPage() {
  const content = aboutFromSanity(await getAboutPage());

  return (
    <>
      <Nav dark />
      <AboutWatermark />
      <AboutBody
        logoSvgs={logoSvgs}
        testimonials={await loadTestimonials()}
        content={content}
      />
    </>
  );
}
