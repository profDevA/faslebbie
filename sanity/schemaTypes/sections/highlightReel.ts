import { defineField, defineType } from "sanity";

// §10 Highlight Reel / Project Highlights — grid or single rotating card.
export const highlightReel = defineType({
  name: "highlightReel",
  title: "Highlight Reel / Project Highlights",
  type: "object",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section Heading",
      type: "string",
      initialValue: "Project Highlights",
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      description:
        "Grid: six cells in a 3×2 layout (Coral). Single card: one large card cycling every frame (Experian Boost, Memory Tubes).",
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
      title: "Multiple Highlights",
      type: "array",
      of: [{ type: "highlightCell" }],
      validation: (r) => r.min(1),
    }),
    defineField({ name: "appearance", type: "appearance" }),
  ],
  preview: {
    select: { title: "sectionTitle", cells: "cells", layout: "layout" },
    prepare: ({ title, cells, layout }) => ({
      title: title || "Project Highlights",
      subtitle: `${cells?.length || 0} highlight(s) · ${layout === "single" ? "single card" : "grid"}`,
    }),
  },
});
