import { defineField, defineType } from "sanity";

// Core Experience Showcase: full-bleed band with one exported artwork of key screens.
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
        'Optional section title. Leave blank if the band has no heading.',
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
