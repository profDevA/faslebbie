import { defineField, defineType } from "sanity";

// One labelled device row inside the Motion Showcase ("Key Product
// Experiences"). Holds one or more device frames — each is a mediaItem so it
// can be a looping video (the Jitter export) or a static frame placeholder.
export const motionRow = defineType({
  name: "motionRow",
  title: "Device row",
  type: "object",
  fields: [
    defineField({
      name: "device",
      title: "Device",
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
    defineField({ name: "label", title: "Label", type: "string" }),
    defineField({ name: "caption", title: "Caption", type: "text", rows: 2 }),
    defineField({
      name: "items",
      title: "Frames / animations",
      type: "array",
      of: [{ type: "mediaItem" }],
      validation: (r) => r.min(1),
    }),
  ],
  preview: {
    select: { title: "label", device: "device", items: "items" },
    prepare: ({ title, device, items }) => ({
      title: title || "Device row",
      subtitle: `${device || "mobile"} · ${items?.length || 0} frame(s)`,
    }),
  },
});
