import { defineField, defineType } from "sanity";

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
      description: "Optional looping video. Replaces the side image when set.",
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
      description: "Panel colour behind the side mockup when fit is Contain (e.g. Coral teal #52747E).",
      options: { disableAlpha: false },
    }),
    defineField({ name: "appearance", type: "appearance" }),
  ],
  preview: {
    select: { title: "sectionTitle", media: "sideImage" },
    prepare: ({ title, media }) => ({ title: title || "Overview", media }),
  },
});
