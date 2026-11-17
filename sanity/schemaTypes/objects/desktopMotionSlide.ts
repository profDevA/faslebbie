import { defineField, defineType } from "sanity";

import { parentBandLayout } from "./desktopMotionCarousel";

/** A slide inside a staggered-pair slider (sections[_key].carousels[_key].slides[_key]). */
function inStaggeredPairSlider(document: unknown, path: unknown) {
  return (
    Array.isArray(path) &&
    path[2] === "carousels" &&
    parentBandLayout(document, path) === "staggeredPair"
  );
}

/** One poster in §08 Desktop Motion Showcase carousel (AR Handbook KPE sliders). */
export const desktopMotionSlide = defineType({
  name: "desktopMotionSlide",
  title: "Desktop motion slide",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Slide image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "video",
      title: "Motion video (MP4)",
      description:
        "Optional. Plays muted on a loop in place of the image (Galderma Key Product Experiences, Nov 16). The image above stays as the poster while it loads.",
      type: "file",
      options: { accept: "video/mp4,video/*" },
      hidden: ({ document, path }) => !inStaggeredPairSlider(document, path),
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
    }),
  ],
  preview: {
    select: { alt: "alt", media: "image" },
    prepare: ({ alt, media }) => ({
      title: alt || "Desktop motion slide",
      media,
    }),
  },
});
