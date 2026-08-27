import { defineField, defineType } from "sanity";

// 04 — Core Experience Showcase (Figma 2019:104708 — WIP per Israel).
// Primary path: one exported artwork. Per-screen fields may expand once design is final.
export const coreExperience = defineType({
  name: "coreExperience",
  title: "04 — Core Experience Showcase",
  type: "object",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Showcase headline",
      type: "string",
      description:
        'Optional section title. Leave blank if the band has no heading. (Detailed per-screen fields pending Figma final.)',
    }),
    defineField({ name: "body", title: "Supporting description", type: "portableText" }),
    defineField({
      name: "image",
      title: "Screen assets (single artwork export)",
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
