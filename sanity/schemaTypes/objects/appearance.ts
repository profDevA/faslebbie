import { defineField, defineType } from "sanity";

// Shared per-section look & layout controls. Embedded in every section so the
// author can set background colour, padding, alignment and width consistently.
// Padding/width/alignment are enums (not raw px) so the layout stays on-grid;
// the renderer maps each enum to Tailwind classes.
export const appearance = defineType({
  name: "appearance",
  title: "Appearance",
  type: "object",
  options: { collapsible: true, collapsed: true, columns: 2 },
  fields: [
    defineField({
      name: "backgroundColor",
      title: "Background color",
      type: "color",
      options: { disableAlpha: false },
    }),
    defineField({
      name: "textColor",
      title: "Text color",
      type: "color",
      options: { disableAlpha: false },
    }),
    defineField({
      name: "paddingTop",
      title: "Padding top",
      type: "string",
      initialValue: "md",
      options: {
        list: [
          { title: "None", value: "none" },
          { title: "Small", value: "sm" },
          { title: "Medium", value: "md" },
          { title: "Large", value: "lg" },
          { title: "Extra large", value: "xl" },
        ],
      },
    }),
    defineField({
      name: "paddingBottom",
      title: "Padding bottom",
      type: "string",
      initialValue: "md",
      options: {
        list: [
          { title: "None", value: "none" },
          { title: "Small", value: "sm" },
          { title: "Medium", value: "md" },
          { title: "Large", value: "lg" },
          { title: "Extra large", value: "xl" },
        ],
      },
    }),
    defineField({
      name: "contentAlignment",
      title: "Content alignment",
      type: "string",
      initialValue: "left",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Center", value: "center" },
          { title: "Right", value: "right" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "maxWidth",
      title: "Content max width",
      type: "string",
      initialValue: "default",
      options: {
        list: [
          { title: "Narrow", value: "narrow" },
          { title: "Default", value: "default" },
          { title: "Wide", value: "wide" },
          { title: "Full bleed", value: "full" },
        ],
      },
    }),
  ],
});
