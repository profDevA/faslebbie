import { defineField, defineType } from "sanity";

// Media band: title + body + one or more media items (video / image /
// prototype). Covers Product Demo, Product Demo 2 and the maroon Empowering
// band. Navigation is shown by the renderer only when there is >1 item.
export const mediaSection = defineType({
  name: "mediaSection",
  title: "Media / Product Demo",
  type: "object",
  fields: [
    defineField({ name: "sectionTitle", title: "Section title", type: "string" }),
    defineField({ name: "body", title: "Body", type: "portableText" }),
    defineField({
      name: "items",
      title: "Media items",
      type: "array",
      of: [{ type: "mediaItem" }],
      validation: (r) => r.min(1),
    }),
    defineField({ name: "appearance", type: "appearance" }),
  ],
  preview: {
    select: { title: "sectionTitle", items: "items" },
    prepare: ({ title, items }) => ({
      title: title || "Media",
      subtitle: `${items?.length || 0} item(s)`,
    }),
  },
});
