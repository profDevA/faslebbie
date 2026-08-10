import type { Testimonial } from "@/lib/content";
import { getTestimonials } from "@/sanity/fetch";

/** Load testimonials from Sanity only — empty list if none. */
export async function loadTestimonials(): Promise<Testimonial[]> {
  try {
    const fromSanity = await getTestimonials();
    return fromSanity.map((t) => ({
      name: t.name,
      role: t.role ?? "",
      quote: t.quote,
      avatar: t.avatar ?? "",
    }));
  } catch {
    return [];
  }
}
