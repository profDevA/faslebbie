import { defineField, defineType } from "sanity";

// One cell of the Project Highlights grid. Each cell loops through its own set
// of frames (brand art / photo cards) — Fas 07/23: "this one changes to these
// three and it plays in a loop." One frame = a static cell.
export const highlightCell = defineType({
  name: "highlightCell",
  title: "Highlight cell",
  type: "object",
  fields: [
    defineField({
      name: "frames",
      title: "Frames (loop)",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (r) => r.min(1),
    }),
  ],
  preview: {
    select: { frames: "frames" },
    prepare: ({ frames }) => ({
      title: "Highlight cell",
      subtitle: `${frames?.length || 0} frame(s)`,
      media: frames?.[0],
    }),
  },
});
