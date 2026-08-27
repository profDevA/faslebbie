import { defineField, defineType } from "sanity";

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
      name: "intro",
      title: "Supporting description",
      type: "portableText",
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
    defineField({ name: "appearance", type: "appearance" }),
  ],
  preview: {
    select: { title: "sectionTitle", rows: "rows" },
    prepare: ({ title, rows }) => ({
      title: title || "Motion Showcase",
      subtitle: `07 · ${rows?.length || 0} product flow(s)`,
    }),
  },
});
