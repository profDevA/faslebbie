import { defineField, defineType } from "sanity";

// Project Highlights: either a grid (3×2 on desktop) of mint-framed cells or a
// single large card, over a coloured band. Each cell loops through its own set
// of frames. Fas 07/23 — "PROJECT HIGHLIGHTS … it rotates here … plays in a
// loop."
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
        "Grid: Coral's 3×2 mint-matted cells. Single card: one large card that rotates through every frame (Experian Boost, Memory Tubes).",
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
