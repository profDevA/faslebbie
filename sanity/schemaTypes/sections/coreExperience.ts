import { defineField, defineType } from "sanity";

// Core Experience Showcase: a full-bleed band between Problem Context / What I
// Brought and Design Process, carrying one exported artwork of the product's
// key screens. Fas 08/05 — "give us a section for image, so we can upload our
// image … it would be for the entire section. We don't need Chang to develop it
// every time." Hence one image rather than Israel's per-screen field list.
export const coreExperience = defineType({
  name: "coreExperience",
  title: "Core Experience Showcase",
  type: "object",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Showcase headline",
      type: "string",
      description:
        'Optional — the Coral band runs untitled. e.g. "Five Moments, One Journey".',
    }),
    defineField({ name: "body", title: "Supporting description", type: "portableText" }),
    defineField({
      name: "image",
      title: "Showcase artwork",
      type: "image",
      options: { hotspot: true },
      description:
        "One high-resolution export of the whole row of screens. Sits edge to edge on the band colour.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "imageMobile",
      title: "Showcase artwork (mobile)",
      type: "image",
      options: { hotspot: true },
      description:
        "Optional narrow crop. Without one, the wide artwork scales down and the screens get small on phones.",
    }),
    defineField({ name: "appearance", type: "appearance" }),
  ],
  preview: {
    select: { title: "sectionTitle", media: "image" },
    prepare: ({ title, media }) => ({
      title: title || "Core Experience Showcase",
      media,
    }),
  },
});
