import { defineField, defineType } from "sanity";

// Shared look & layout controls for sections and nested elements (popups, tiles,
// cards). Reuse this type on section bands and on sub-components so Israel can
// tune each layer in Studio — same field set everywhere (tree-style CMS).
// Padding and gap are pixel values so authors can match Figma (e.g. 102).
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
      name: "paddingLeft",
      title: "Padding left (px)",
      type: "number",
      description: "Horizontal inset on the left, e.g. 20. Empty = template default.",
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "paddingRight",
      title: "Padding right (px)",
      type: "number",
      description: "Horizontal inset on the right, e.g. 20. Empty = template default.",
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "contentGap",
      title: "Content gap (px)",
      type: "number",
      description:
        "Vertical space between stacked blocks (e.g. Problem Context and What I Brought). Empty = template default.",
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
    defineField({
      name: "tileBackgroundColor",
      title: "Tile / card background",
      type: "color",
      description:
        "Fill behind image tiles or nested cards (e.g. Core Experience popup grid #4f6b76).",
      options: { disableAlpha: false },
    }),
    defineField({
      name: "introMaxWidth",
      title: "Intro max width (px)",
      type: "number",
      description:
        "Max width of headline + intro prose column, e.g. 560. Empty = template default.",
      validation: (r) => r.min(200).integer(),
    }),
    defineField({
      name: "containerMaxWidth",
      title: "Container max width (px)",
      type: "number",
      description:
        "Cap content width when set, e.g. 1200. Leave empty for full popup width.",
      validation: (r) => r.min(320).integer(),
    }),
  ],
});
