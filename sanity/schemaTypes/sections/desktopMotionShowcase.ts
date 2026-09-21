import { defineField, defineType } from "sanity";

import { DESKTOP_MOTION_APPEARANCE_DEFAULTS } from "../../../src/lib/sanityAppearanceDefaults";

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
        "Unset / single = one centred mockup or slides[] carousel. Staggered pair = two independent sliders (OC Links Figma 4004:116820).",
      options: {
        list: [
          { title: "Single mockup or carousel", value: "single" },
          { title: "Staggered pair (two sliders)", value: "staggeredPair" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "body",
      title: "Supporting description",
      type: "portableText",
      hidden: ({ parent }) => parent?.layoutVariant === "staggeredPair",
    }),
    defineField({
      name: "carousels",
      title: "Sliders",
      type: "array",
      of: [{ type: "desktopMotionCarousel" }],
      description:
        "Two sliders: first left / top, second right / below. Each has its own slides + caption.",
      hidden: ({ parent }) => parent?.layoutVariant !== "staggeredPair",
      validation: (r) =>
        r.max(2).custom((value, ctx) => {
          const parent = ctx.parent as { layoutVariant?: string } | undefined;
          if (parent?.layoutVariant !== "staggeredPair") return true;
          if (!value || value.length !== 2) {
            return "Staggered pair needs exactly two sliders";
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
      hidden: ({ parent }) => parent?.layoutVariant === "staggeredPair",
    }),
    defineField({
      name: "videoFile",
      title: "Desktop animation / video asset",
      type: "file",
      options: { accept: "video/*" },
      hidden: ({ parent }) => parent?.layoutVariant === "staggeredPair",
    }),
    defineField({
      name: "posterImage",
      title: "Static image fallback",
      type: "image",
      options: { hotspot: true },
      description:
        "Single poster when slides[] is empty. Also used as video poster while loading.",
      hidden: ({ parent }) => parent?.layoutVariant === "staggeredPair",
    }),
    defineField({
      name: "slides",
      title: "Poster slides (carousel)",
      type: "array",
      of: [{ type: "desktopMotionSlide" }],
      description:
        "When set, renders a left/right carousel (first slide visible). AR Handbook bands 3/5/7 — Figma slider frames.",
      hidden: ({ parent }) => parent?.layoutVariant === "staggeredPair",
    }),
    defineField({
      name: "caption",
      title: "Caption / description",
      type: "text",
      rows: 3,
      hidden: ({ parent }) => parent?.layoutVariant === "staggeredPair",
    }),
    defineField({
      name: "ctaLabel",
      title: "Optional external / website link label",
      type: "string",
      description: 'e.g. "Visit Site".',
      hidden: ({ parent }) => parent?.layoutVariant === "staggeredPair",
    }),
    defineField({
      name: "ctaUrl",
      title: "Optional external / website link URL",
      type: "url",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
      hidden: ({ parent }) => parent?.layoutVariant === "staggeredPair",
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
