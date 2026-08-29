import { defineField, defineType } from "sanity";

import { MOTION_SHOWCASE_BAND_DEFAULTS } from "../../../src/lib/caseStudyDefaults";
import { MOTION_SHOWCASE_APPEARANCE_DEFAULTS } from "../../../src/lib/sanityAppearanceDefaults";

// 07 — Motion Showcase (Figma 2019:104708).
// Coral example: Key Product Experiences — Mobile + iPad.
export const motionShowcase = defineType({
  name: "motionShowcase",
  title: "07 — Motion Showcase",
  type: "object",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section heading",
      type: "string",
      initialValue: "Key Product Experiences",
    }),
    defineField({
      name: "layoutVariant",
      title: "Band layout",
      type: "string",
      initialValue: "stacked",
      options: {
        list: [
          {
            title: "Stacked rows (Coral — one coloured band, multiple devices)",
            value: "stacked",
          },
          {
            title: "Featured device (Census — centred mockup + anchored caption)",
            value: "featured",
          },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "intro",
      title: "Supporting description",
      type: "portableText",
    }),
    defineField({
      name: "titleMarginBottom",
      title: "Title margin bottom (px)",
      type: "number",
      initialValue: MOTION_SHOWCASE_BAND_DEFAULTS.titleMarginBottom,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "titleMarginBottomDesktop",
      title: "Title margin bottom desktop (px)",
      type: "number",
      initialValue: MOTION_SHOWCASE_BAND_DEFAULTS.titleMarginBottomDesktop,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "introMarginBottom",
      title: "Intro margin bottom (px)",
      type: "number",
      initialValue: MOTION_SHOWCASE_BAND_DEFAULTS.introMarginBottom,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "rows",
      title: "Optional multiple product flows",
      description:
        "Each flow is one device row — e.g. mobile animations (left) and tablet / iPad animations (right).",
      type: "array",
      of: [{ type: "motionRow" }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "appearance",
      type: "appearance",
      initialValue: MOTION_SHOWCASE_APPEARANCE_DEFAULTS,
    }),
  ],
  preview: {
    select: { title: "sectionTitle", rows: "rows" },
    prepare: ({ title, rows }) => ({
      title: title || "Motion Showcase",
      subtitle: `07 · ${rows?.length || 0} product flow(s)`,
    }),
  },
});
