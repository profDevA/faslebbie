import { defineField, defineType } from "sanity";

import { DESKTOP_MOTION_APPEARANCE_DEFAULTS } from "../../../src/lib/sanityAppearanceDefaults";

/** Layouts built from `carousels` — the single-mockup fields don't apply. */
const usesCarousels = (parent: unknown) => {
  const v = (parent as { layoutVariant?: string } | undefined)?.layoutVariant;
  return v === "staggeredPair" || v === "oldVsNew";
};

// 08 — Desktop Motion Showcase.
// Coral example: “Fostering equality in healthcare” desktop website animation.
export const desktopMotionShowcase = defineType({
  name: "desktopMotionShowcase",
  title: "08 — Desktop Motion Showcase",
  type: "object",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section heading",
      type: "string",
      initialValue: "Marketing Website",
    }),
    defineField({
      name: "layoutVariant",
      title: "Band layout",
      type: "string",
      description:
        "Unset / single = one centred mockup or slides[] carousel. Staggered pair = two or three independent sliders (OC Links uses two; Circle Key Product Experiences uses three). Large device, caption below = the Final Cleanup layout (Acme Key Product Experiences): the mockup at full wide size, title + text under it, right of centre. Old vs New = rows of old screen → arrow → new screen, with the row title + text on the right (OC Links, Figma 559:37739).",
      options: {
        list: [
          { title: "Single mockup or carousel", value: "single" },
          { title: "Staggered pair (two or three sliders)", value: "staggeredPair" },
          { title: "Large device, caption below", value: "captionBelow" },
          { title: "Old vs New (old screen → new screen rows)", value: "oldVsNew" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "body",
      title: "Supporting description",
      type: "portableText",
      hidden: ({ parent }) => usesCarousels(parent),
    }),
    defineField({
      name: "carousels",
      title: "Sliders",
      type: "array",
      of: [{ type: "desktopMotionCarousel" }],
      description:
        "Staggered pair: two or three sliders — odd rows sit left, even rows sit right, each with its own slides + caption. Old vs New: one entry per row — slide 1 = old screen, slide 2 = new screen, plus the row title and text.",
      hidden: ({ parent }) => !usesCarousels(parent),
      validation: (r) =>
        r.custom((value, ctx) => {
          const parent = ctx.parent as { layoutVariant?: string } | undefined;
          const n = value?.length ?? 0;
          if (parent?.layoutVariant === "oldVsNew") {
            return n >= 1 || "Old vs New needs at least one row";
          }
          if (parent?.layoutVariant !== "staggeredPair") return true;
          if (n < 2 || n > 3) {
            return "Staggered pair needs two or three sliders";
          }
          return true;
        }),
    }),
    defineField({
      name: "videoUrl",
      title: "Desktop animation / video URL",
      type: "url",
      description: "External mp4, YouTube, or Vimeo URL. Optional if you upload a static image below.",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
      hidden: ({ parent }) => usesCarousels(parent),
    }),
    defineField({
      name: "videoFile",
      title: "Desktop animation / video asset",
      type: "file",
      options: { accept: "video/*" },
      hidden: ({ parent }) => usesCarousels(parent),
    }),
    defineField({
      name: "posterImage",
      title: "Static image fallback",
      type: "image",
      options: { hotspot: true },
      description:
        "Single poster when slides[] is empty. Also used as video poster while loading.",
      hidden: ({ parent }) => usesCarousels(parent),
    }),
    defineField({
      name: "slides",
      title: "Poster slides (carousel)",
      type: "array",
      of: [{ type: "desktopMotionSlide" }],
      description:
        "When set, renders a left/right carousel (first slide visible). AR Handbook bands 3/5/7 — Figma slider frames.",
      hidden: ({ parent }) => usesCarousels(parent),
    }),
    defineField({
      name: "caption",
      title: "Caption / description",
      type: "text",
      rows: 3,
      hidden: ({ parent }) => usesCarousels(parent),
    }),
    defineField({
      name: "ctaLabel",
      title: "Optional external / website link label",
      type: "string",
      description: 'e.g. "Visit Site".',
      hidden: ({ parent }) => usesCarousels(parent),
    }),
    defineField({
      name: "ctaUrl",
      title: "Optional external / website link URL",
      type: "url",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
      hidden: ({ parent }) => usesCarousels(parent),
    }),
    defineField({
      name: "appearance",
      type: "appearance",
      initialValue: DESKTOP_MOTION_APPEARANCE_DEFAULTS,
    }),
  ],
  preview: {
    select: { title: "sectionTitle", media: "posterImage" },
    prepare: ({ title, media }) => ({
      title: title || "Desktop Motion Showcase",
      subtitle: "08 — Desktop Motion Showcase",
      media,
    }),
  },
});
