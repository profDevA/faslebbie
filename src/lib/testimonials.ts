import { testimonials as fallbackTestimonials, type Testimonial } from "@/lib/content";
import { getTestimonials } from "@/sanity/fetch";

/** Load Sanity testimonials with the same fallback About uses. */
export async function loadTestimonials(): Promise<Testimonial[]> {
  try {
    const fromSanity = await getTestimonials();
    if (fromSanity.length) {
      return fromSanity.map((t) => ({
        name: t.name,
        role: t.role ?? "",
        quote: t.quote,
        avatar: t.avatar ?? "/testimonials/avatar-1.png",
      }));
    }
  } catch {
    // keep fallback
  }
  return fallbackTestimonials;
}
