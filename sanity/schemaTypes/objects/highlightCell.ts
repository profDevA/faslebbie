import { defineField, defineType } from "sanity";

// One cell in the Project Highlights grid. Loops through its frame images.
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
