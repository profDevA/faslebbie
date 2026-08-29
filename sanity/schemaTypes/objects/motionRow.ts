import { defineField, defineType } from "sanity";

import { MOTION_ROW_DEFAULTS } from "../../../src/lib/caseStudyDefaults";
import { sanityColor } from "../../../src/lib/sanityAppearanceDefaults";

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
      name: "rowWidthPercent",
      title: "Row max width (%)",
      type: "number",
      initialValue: MOTION_ROW_DEFAULTS.rowWidthPercent,
      validation: (r) => r.min(20).max(100),
    }),
    defineField({
      name: "itemGapPercent",
      title: "Gap between frames (%)",
      type: "number",
      initialValue: MOTION_ROW_DEFAULTS.itemGapPercent,
      validation: (r) => r.min(0).max(20),
    }),
    defineField({
      name: "captionMarginTop",
      title: "Caption margin top (px)",
      type: "number",
      initialValue: MOTION_ROW_DEFAULTS.captionMarginTop,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "tileBackgroundColor",
      title: "Frame background color",
      type: "color",
      initialValue: sanityColor(MOTION_ROW_DEFAULTS.tileBackgroundColor),
      options: { disableAlpha: false },
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
    defineField({
      name: "captionAlign",
      title: "Caption placement",
      type: "string",
      initialValue: "below",
      options: {
        list: [
          { title: "Below device (Coral stacked rows)", value: "below" },
          { title: "Bottom-left (featured mobile band)", value: "left" },
          { title: "Bottom-right (featured desktop band)", value: "right" },
        ],
        layout: "radio",
      },
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
