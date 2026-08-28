import { defineField, defineType } from "sanity";

/** One screen tile in the Core Experience band or popup (Figma 2110:39499 / 3670:18004). */
export const coreExperienceScreen = defineType({
  name: "coreExperienceScreen",
  title: "Experience screen",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Screen image",
      type: "image",
      options: { hotspot: true },
      description:
        "Export one phone or desktop frame from Figma — PNG @2×. Mobile row: ~360×640 px (portrait). Desktop grid: ~800×500 px (landscape). Do not upload the whole band as one image.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "label",
      title: "Short label",
      type: "string",
      description:
        'Bold line under the screen, e.g. "Virtual Consultation:" — include the colon if the design has one.',
    }),
    defineField({
      name: "description",
      title: "Supporting line",
      type: "string",
      description: 'Second line under the label, e.g. "Connect directly with your care team".',
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "description", media: "image" },
    prepare: ({ title, subtitle, media }) => ({
      title: title || "Screen",
      subtitle,
      media,
    }),
  },
});
