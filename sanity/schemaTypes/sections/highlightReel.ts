import { defineField, defineType } from "sanity";

// Project Highlights: a grid (3×2 on desktop) of mint-framed cells over a deep
// teal band. Each cell loops through its own set of frames. Fas 07/23 —
// "PROJECT HIGHLIGHTS … it rotates here … plays in a loop."
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
