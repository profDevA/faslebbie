import { defineField, defineType } from "sanity";

// A device/view tab (e.g. Mobile / iPad / Desktop) grouping gallery items.
export const deviceTab = defineType({
  name: "deviceTab",
  title: "Device tab",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [{ type: "galleryItem" }],
    }),
  ],
  preview: {
    select: { title: "label", items: "items" },
    prepare: ({ title, items }) => ({
      title: title || "Tab",
      subtitle: `${items?.length || 0} item(s)`,
    }),
  },
});
