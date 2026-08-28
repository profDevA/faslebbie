import { defineField, defineType } from "sanity";

/** One screen tile in the Core Experience band or popup (Figma 2110:39499 / 2271:58148). */
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
        "Export one frame from Figma @2×+. Mobile row: ~360×640 portrait. Desktop grid: ~762×467 landscape (Acme Lending).",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "imageWidth",
      title: "Display width (px)",
      type: "number",
      description:
        "Optional exact render width from Figma export. Empty = template default for layout variant.",
      validation: (r) => r.min(80).integer(),
    }),
    defineField({
      name: "imageHeight",
      title: "Display height (px)",
      type: "number",
      description: "Optional exact render height. Pair with display width for precise sizing.",
      validation: (r) => r.min(80).integer(),
    }),
    defineField({
      name: "label",
      title: "Short label",
      type: "string",
      description:
        'Bold line under the screen, e.g. "Find Financial Institution:" — include the colon if the design has one.',
    }),
    defineField({
      name: "description",
      title: "Supporting line",
      type: "string",
      description: 'Second line under the label, e.g. "Connect trusted financial institutions."',
    }),
    defineField({
      name: "appearance",
      title: "Card layout & colors",
      type: "appearance",
      description:
        "Per-screen overrides: card background, padding, gaps. Empty = band preview defaults.",
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
