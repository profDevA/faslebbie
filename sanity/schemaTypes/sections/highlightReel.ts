import { defineField, defineType } from "sanity";

// Project Highlights: grid of looping cells or a single rotating card.
export const highlightReel = defineType({
  name: "highlightReel",
  title: "Project Highlights (rotating grid)",
  type: "object",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section title",
      type: "string",
      initialValue: "Project Highlights",
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      description:
        "Grid: six cells in a 3×2 layout. Single card: one large card that rotates through multiple frames.",
      options: {
        list: [
          { title: "Grid (3×2 cells)", value: "grid" },
          { title: "Single rotating card", value: "single" },
        ],
        layout: "radio",
      },
      initialValue: "grid",
    }),
    defineField({
      name: "cells",
      title: "Cells",
      type: "array",
      of: [{ type: "highlightCell" }],
      validation: (r) => r.min(1),
    }),
    defineField({ name: "appearance", type: "appearance" }),
  ],
  preview: {
    select: { title: "sectionTitle", cells: "cells" },
    prepare: ({ title, cells }) => ({
      title: title || "Project Highlights",
      subtitle: `${cells?.length || 0} cell(s)`,
    }),
  },
});
