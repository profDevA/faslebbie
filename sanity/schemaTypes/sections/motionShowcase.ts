import { defineField, defineType } from "sanity";

// Motion Showcase: stacked device rows with looping animations.
export const motionShowcase = defineType({
  name: "motionShowcase",
  title: "Motion Showcase (device animations)",
  type: "object",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section title",
      type: "string",
      initialValue: "Key Product Experiences",
    }),
    defineField({ name: "intro", title: "Intro body", type: "portableText" }),
    defineField({
      name: "rows",
      title: "Device rows",
      type: "array",
      of: [{ type: "motionRow" }],
      validation: (r) => r.min(1),
    }),
    defineField({ name: "appearance", type: "appearance" }),
  ],
  preview: {
    select: { title: "sectionTitle", rows: "rows" },
    prepare: ({ title, rows }) => ({
      title: title || "Motion Showcase",
      subtitle: `${rows?.length || 0} row(s)`,
    }),
  },
});
