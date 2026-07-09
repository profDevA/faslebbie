import { defineField, defineType } from "sanity";

// Flexible image grid. Covers Design Interventions, Feature Set, Supporting
// Designs, Spotlight and Research Outputs. Optionally uses device tabs; grid
// shows up to `itemsBeforeViewMore` before a Load More.
export const gallerySection = defineType({
  name: "gallerySection",
  title: "Gallery",
  type: "object",
  fields: [
    defineField({ name: "sectionTitle", title: "Section title", type: "string" }),
    defineField({ name: "body", title: "Body", type: "portableText" }),
    defineField({
      name: "useDeviceTabs",
      title: "Use device tabs",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "tabs",
      title: "Device tabs",
      type: "array",
      of: [{ type: "deviceTab" }],
      hidden: ({ parent }) => !parent?.useDeviceTabs,
    }),
    defineField({
      name: "items",
      title: "Gallery items",
      type: "array",
      of: [{ type: "galleryItem" }],
      hidden: ({ parent }) => !!parent?.useDeviceTabs,
    }),
    defineField({
      name: "showCaptions",
      title: "Show item captions",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "itemsBeforeViewMore",
      title: "Items before “view more”",
      type: "number",
      initialValue: 6,
      validation: (r) => r.min(1).max(12),
    }),
    defineField({
      name: "loadMoreLabel",
      title: "Load more label",
      type: "string",
      initialValue: "Load More",
    }),
    defineField({ name: "appearance", type: "appearance" }),
  ],
  preview: {
    select: { title: "sectionTitle", items: "items", tabs: "tabs" },
    prepare: ({ title, items, tabs }) => ({
      title: title || "Gallery",
      subtitle: tabs?.length
        ? `${tabs.length} tab(s)`
        : `${items?.length || 0} item(s)`,
    }),
  },
});
