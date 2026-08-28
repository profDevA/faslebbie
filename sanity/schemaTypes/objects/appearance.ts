import { defineField, defineType } from "sanity";

// Shared per-section look & layout controls. Padding and gap are pixel values
// so authors can match Figma exactly (e.g. 102). Leave empty for template defaults.
export const appearance = defineType({
  name: "appearance",
  title: "Layout & colors",
  type: "object",
  options: { collapsible: true, collapsed: false, columns: 2 },
  fields: [
    defineField({
      name: "backgroundColor",
      title: "Background color",
      type: "color",
      description: "Section band fill. Leave empty to use the template default for this block.",
      options: { disableAlpha: false },
    }),
    defineField({
      name: "textColor",
      title: "Text color",
      type: "color",
      description: "Override body + label color when the band is dark or tinted.",
      options: { disableAlpha: false },
    }),
    defineField({
      name: "paddingTop",
      title: "Padding top (px)",
      type: "number",
      description: "Space above section content, e.g. 102. Empty = template default.",
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "paddingBottom",
      title: "Padding bottom (px)",
      type: "number",
      description: "Space below section content. Empty = template default.",
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "contentGap",
      title: "Content gap (px)",
      type: "number",
      description:
        "Vertical space between title, body, and media inside the section, e.g. 66. Empty = template default.",
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "contentGapInner",
      title: "Inner gap (px)",
      type: "number",
      description: "Space between a heading and its body, e.g. 20. Empty = template default.",
      validation: (r) => r.min(0).integer(),
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
      description: "Narrow for prose-only bands; Wide for grids and mockups.",
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
