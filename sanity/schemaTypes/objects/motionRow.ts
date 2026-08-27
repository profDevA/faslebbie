import { defineField, defineType } from "sanity";

// One product-flow row inside 07 — Motion Showcase.
export const motionRow = defineType({
  name: "motionRow",
  title: "Product flow",
  type: "object",
  fields: [
    defineField({
      name: "device",
      title: "Device type",
      type: "string",
      initialValue: "mobile",
      options: {
        list: [
          { title: "Mobile", value: "mobile" },
          { title: "Tablet / iPad", value: "tablet" },
          { title: "Desktop", value: "desktop" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "items",
      title: "Animation / motion assets",
      description: "Mobile animation, tablet animation, or additional frames in this flow.",
      type: "array",
      of: [{ type: "mediaItem" }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "posterImage",
      title: "Poster / static fallback",
      type: "image",
      options: { hotspot: true },
      description: "Optional fallback for this flow while videos load.",
    }),
    defineField({
      name: "label",
      title: "Screen / moment title",
      type: "string",
    }),
    defineField({
      name: "caption",
      title: "Caption / description",
      type: "text",
      rows: 2,
    }),
  ],
  preview: {
    select: { title: "label", device: "device", items: "items", caption: "caption" },
    prepare: ({ title, device, items, caption }) => ({
      title: title || caption || "Product flow",
      subtitle: `${device || "mobile"} · ${items?.length || 0} asset(s)`,
    }),
  },
});
