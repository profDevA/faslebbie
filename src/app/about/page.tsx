import Nav from "@/components/Nav";
import AboutBody from "@/components/AboutBody";
import AboutWatermark from "@/components/AboutWatermark";
import { getAboutLogoSvgs } from "@/lib/logoSvgs";
import { getTestimonials } from "@/sanity/fetch";
import { testimonials as fallbackTestimonials, type Testimonial } from "@/lib/content";

const logoSvgs = getAboutLogoSvgs();

// About page (Figma 807:19122 / 19414) — on desktop the heading is the big
// "About Me" watermark behind the content, which starts on top and recedes as
// the dimmed bio (left portrait + prose) brightens forward on scroll. Mobile
// keeps a small left-aligned heading. Dark nav matches the new design.
//
// Testimonials come from Sanity ("what people are saying" modal); if the
// dataset is empty (or unreachable) it falls back to the in-code list so the
// page never breaks.
export default async function AboutPage() {
  let testimonials: Testimonial[] = fallbackTestimonials;
  try {
    const fromSanity = await getTestimonials();
    if (fromSanity.length) {
      testimonials = fromSanity.map((t) => ({
        name: t.name,
        role: t.role ?? "",
        quote: t.quote,
        avatar: t.avatar ?? "/testimonials/avatar-1.png",
      }));
    }
  } catch {
    // keep the in-code fallback
  }

  return (
    <>
      <Nav dark />
      <AboutWatermark />
      <AboutBody logoSvgs={logoSvgs} testimonials={testimonials} />
    </>
  );
}
