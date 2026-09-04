import { defineField, defineType } from "sanity";

import {
  OVERVIEW_COPY_COLUMN_PAD,
  OVERVIEW_COPY_COLUMN_PAD_PAGE,
  OVERVIEW_COLUMN_GAP,
  OVERVIEW_MEDIA_COLUMN_PAD,
  OVERVIEW_MEDIA_COLUMN_PAD_PAGE,
  OVERVIEW_SIDE_TEAL,
} from "../../../src/lib/caseStudyDefaults";
import { sanityColor } from "../../../src/lib/sanityAppearanceDefaults";

// Project Overview: intro prose + metadata (discipline, duration, team,
// disclaimer) and side feature art — From/To/Credit live on the case study doc.
export const overviewSection = defineType({
  name: "overviewSection",
  title: "Overview",
  type: "object",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Overview heading",
      type: "string",
      initialValue: "Overview",
    }),
    defineField({
      name: "body",
      title: "Overview description",
      type: "portableText",
    }),
    defineField({ name: "ctaLabel", title: "Visit site / external link label", type: "string" }),
    defineField({
      name: "ctaUrl",
      title: "Visit site / external link URL",
      type: "url",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "serviceCategoryLabel",
      title: "Discipline / role label",
      type: "string",
      description: 'e.g. "Research & Design".',
    }),
    defineField({
      name: "serviceList",
      title: "Discipline / role list",
      type: "text",
      rows: 2,
    }),
    defineField({ name: "duration", title: "Duration", type: "string" }),
    defineField({ name: "team", title: "Team", type: "text", rows: 2 }),
    defineField({
      name: "confidentialityNote",
      title: "Confidentiality / disclaimer",
      type: "string",
    }),
    defineField({
      name: "sideImage",
      title: "Side feature image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "sideVideo",
      title: "Side feature video (looping)",
      type: "file",
      options: { accept: "video/*" },
      description:
        "Optional looping video on the media side. When empty, the side image is shown instead.",
    }),
    defineField({
      name: "sideImageFit",
      title: "Side image fit",
      type: "string",
      description:
        "Cover fills the panel (photography). Contain floats the art on the panel colour with a margin — use it for device mockups so the phone isn't cropped.",
      options: {
        list: [
          { title: "Cover (fill panel)", value: "cover" },
          { title: "Contain (float on panel)", value: "contain" },
        ],
        layout: "radio",
      },
      initialValue: "cover",
    }),
    defineField({
      name: "sideImageBackgroundColor",
      title: "Side feature image background color",
      type: "color",
      initialValue: sanityColor(OVERVIEW_SIDE_TEAL),
      description: "Panel colour behind the side mockup when fit is Contain (e.g. Coral teal #52747E).",
      options: { disableAlpha: false },
    }),
    defineField({
      name: "mediaPosition",
      title: "Media column",
      type: "string",
      initialValue: "right",
      description: "Which side the mockup / video sits on (desktop). Copy is on the other side.",
      options: {
        list: [
          { title: "Media on the right (default)", value: "right" },
          { title: "Media on the left", value: "left" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "copyPaddingTop",
      title: "Copy column padding top (px)",
      type: "number",
      initialValue: OVERVIEW_COPY_COLUMN_PAD.paddingTop,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "copyPaddingBottom",
      title: "Copy column padding bottom (px)",
      type: "number",
      initialValue: OVERVIEW_COPY_COLUMN_PAD.paddingBottom,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "copyPaddingLeft",
      title: "Copy column padding left (px)",
      type: "number",
      initialValue: OVERVIEW_COPY_COLUMN_PAD_PAGE.paddingLeft,
      description: "Full-page layout only — overlay popup ignores horizontal copy inset.",
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "copyPaddingRight",
      title: "Copy column padding right (px)",
      type: "number",
      initialValue: OVERVIEW_COPY_COLUMN_PAD_PAGE.paddingRight,
      description: "Full-page layout only — overlay popup ignores horizontal copy inset.",
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "mediaPaddingTop",
      title: "Media column padding top (px)",
      type: "number",
      initialValue: OVERVIEW_MEDIA_COLUMN_PAD.paddingTop,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "mediaPaddingBottom",
      title: "Media column padding bottom (px)",
      type: "number",
      initialValue: OVERVIEW_MEDIA_COLUMN_PAD.paddingBottom,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "mediaPaddingLeft",
      title: "Media column padding left (px)",
      type: "number",
      initialValue: OVERVIEW_MEDIA_COLUMN_PAD_PAGE.paddingLeft,
      description: "Full-page desktop + mobile inset. Overlay mobile defaults to 0 when empty.",
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "mediaPaddingRight",
      title: "Media column padding right (px)",
      type: "number",
      initialValue: OVERVIEW_MEDIA_COLUMN_PAD_PAGE.paddingRight,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "columnGap",
      title: "Column gap (px)",
      type: "number",
      initialValue: OVERVIEW_COLUMN_GAP,
      description: "Space between copy and media columns on desktop overlay layout.",
      validation: (r) => r.min(0).integer(),
    }),
    defineField({ name: "appearance", type: "appearance" }),
  ],
  preview: {
    select: { title: "sectionTitle", media: "sideImage" },
    prepare: ({ title, media }) => ({ title: title || "Overview", media }),
  },
});
