import { defineField, defineType } from "sanity";

/** One screen inside a View More modal (intro + device-tab grids). */
export const viewMorePopupPage = defineType({
  name: "viewMorePopupPage",
  title: "View More popup page",
  type: "object",
  fields: [
    defineField({
      name: "popupKicker",
      title: "Popup kicker (optional)",
      type: "string",
    }),
    defineField({
      name: "popupTitle",
      title: "Popup headline (optional)",
      type: "string",
    }),
    defineField({
      name: "popupBody",
      title: "Popup intro",
      type: "portableText",
    }),
    defineField({
      name: "popupTabs",
      title: "Device tabs",
      type: "array",
      of: [{ type: "deviceTab" }],
    }),
  ],
  preview: {
    select: { title: "popupTitle", tabs: "popupTabs" },
    prepare: ({ title, tabs }) => ({
      title: title || "Popup page",
      subtitle: `${tabs?.length || 0} tab(s)`,
    }),
  },
});
