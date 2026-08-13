import { defineField, defineType } from "sanity";

// Project Overview: intro prose + a metadata column (service list, duration,
// team, optional CTA + confidentiality note) and a side feature image.
export const overviewSection = defineType({
  name: "overviewSection",
  title: "Overview",
  type: "object",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section title",
      type: "string",
      initialValue: "Overview",
    }),
    defineField({ name: "body", title: "Overview body", type: "portableText" }),
    defineField({ name: "ctaLabel", title: "CTA label", type: "string" }),
    defineField({
      name: "ctaUrl",
      title: "CTA URL",
      type: "url",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "serviceCategoryLabel",
      title: "Service category label",
      type: "string",
      description: 'e.g. "Research & Design".',
    }),
    defineField({ name: "serviceList", title: "Service list", type: "text", rows: 2 }),
    defineField({ name: "duration", title: "Duration", type: "string" }),
    defineField({ name: "team", title: "Team members", type: "text", rows: 2 }),
    defineField({ name: "confidentialityNote", title: "Confidentiality note", type: "string" }),
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
        "Optional looping video. Replaces the side image when set.",
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
      options: { disableAlpha: false },
    }),
    defineField({ name: "appearance", type: "appearance" }),
  ],
  preview: {
    select: { title: "sectionTitle", media: "sideImage" },
    prepare: ({ title, media }) => ({ title: title || "Overview", media }),
  },
});
