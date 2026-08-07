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

// About page (Figma 807:19122 / 19414) — on desktop the heading is the big
// "About Me" watermark behind the content, which starts on top and recedes as
// the dimmed bio (left portrait + prose) brightens forward on scroll. Mobile
// keeps a small left-aligned heading. Dark nav matches the new design.
//
// The bio and the testimonials both come from Sanity; if the dataset is empty
// (or unreachable) each falls back to the in-code copy so the page never
// breaks. The brand logos stay on disk — they're inlined as SVG markup for the
// hover-wobble, which an <img> can't do.

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
  let content = aboutFromSanity(null);
  try {
    content = aboutFromSanity(await getAboutPage());
  } catch {
    // keep the in-code fallback
  }

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
