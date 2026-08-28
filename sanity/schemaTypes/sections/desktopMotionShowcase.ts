import { defineField, defineType } from "sanity";

import { DESKTOP_MOTION_APPEARANCE_DEFAULTS } from "../../../src/lib/sanityAppearanceDefaults";

// 08 — Desktop Motion Showcase (Figma 2019:104708).
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
      name: "body",
      title: "Supporting description",
      type: "portableText",
    }),
    defineField({
      name: "videoUrl",
      title: "Desktop animation / video URL",
      type: "url",
      description: "External mp4, YouTube, or Vimeo URL. Optional if you upload a static image below.",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "videoFile",
      title: "Desktop animation / video asset",
      type: "file",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "posterImage",
      title: "Static image fallback",
      type: "image",
      options: { hotspot: true },
      description:
        "Shown when no video is set, or as the video poster while loading. Upload a screenshot when motion is not ready.",
    }),
    defineField({
      name: "caption",
      title: "Caption / description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "ctaLabel",
      title: "Optional external / website link label",
      type: "string",
      description: 'e.g. "Visit Site".',
    }),
    defineField({
      name: "ctaUrl",
      title: "Optional external / website link URL",
      type: "url",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
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
