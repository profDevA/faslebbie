import { defineField, defineType } from "sanity";

import {
  HIGHLIGHT_REEL_COMPOSITE_DEFAULTS,
  HIGHLIGHT_REEL_GRID_DEFAULTS,
  HIGHLIGHT_REEL_SINGLE_DEFAULTS,
} from "../../../src/lib/caseStudyDefaults";
import {
  HIGHLIGHT_REEL_APPEARANCE_DEFAULTS,
  sanityColor,
} from "../../../src/lib/sanityAppearanceDefaults";

// §10 Highlight Reel / Project Highlights — grid, composite board, or rotating card.
export const highlightReel = defineType({
  name: "highlightReel",
  title: "Highlight Reel / Project Highlights",
  type: "object",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section Heading",
      type: "string",
      initialValue: "Project Highlights",
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      description:
        "Grid: six cells in a 3×2 layout (Coral). Composite: one static board image (Experian Boost). Single card: one large card cycling every frame (Memory Tubes).",
      options: {
        list: [
          { title: "Grid (3×2 cells)", value: "grid" },
          { title: "Composite image (single board)", value: "composite" },
          { title: "Single rotating card", value: "single" },
        ],
        layout: "radio",
      },
      initialValue: "grid",
    }),
    defineField({
      name: "compositeImage",
      title: "Composite board image",
      type: "image",
      options: { hotspot: true },
      description: "One pre-composited highlights board (Figma export). Used when layout is Composite.",
      hidden: ({ parent }) => parent?.layout !== "composite",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const layout = (context.parent as { layout?: string } | undefined)?.layout;
          if (layout === "composite" && !value) {
            return "Add the composite board image.";
          }
          return true;
        }),
    }),
    defineField({
      name: "cells",
      title: "Multiple Highlights",
      type: "array",
      of: [{ type: "highlightCell" }],
      hidden: ({ parent }) => parent?.layout === "composite",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const layout = (context.parent as { layout?: string } | undefined)?.layout;
          if (layout === "composite") return true;
          if (!value?.length) return "Add at least one highlight item.";
          return true;
        }),
    }),
    defineField({
      name: "gridCellMatteColor",
      title: "Grid cell matte color",
      type: "color",
      initialValue: sanityColor(HIGHLIGHT_REEL_GRID_DEFAULTS.cellMatteColor),
      description: "Background behind each thumbnail in the 3×2 grid layout.",
      options: { disableAlpha: false },
      hidden: ({ parent }) => parent?.layout !== "grid",
    }),
    defineField({
      name: "gridCellInsetVerticalPercent",
      title: "Grid cell inset top/bottom (%)",
      type: "number",
      initialValue: HIGHLIGHT_REEL_GRID_DEFAULTS.cellInsetVerticalPercent,
      validation: (r) => r.min(0).max(40),
      hidden: ({ parent }) => parent?.layout !== "grid",
    }),
    defineField({
      name: "gridCellInsetHorizontalPercent",
      title: "Grid cell inset left/right (%)",
      type: "number",
      initialValue: HIGHLIGHT_REEL_GRID_DEFAULTS.cellInsetHorizontalPercent,
      validation: (r) => r.min(0).max(40),
      hidden: ({ parent }) => parent?.layout !== "grid",
    }),
    defineField({
      name: "gridGap",
      title: "Grid gap (px)",
      type: "number",
      initialValue: HIGHLIGHT_REEL_GRID_DEFAULTS.gridGap,
      validation: (r) => r.min(0).integer(),
      hidden: ({ parent }) => parent?.layout !== "grid",
    }),
    defineField({
      name: "singleCardMatteColor",
      title: "Single card matte color",
      type: "color",
      initialValue: sanityColor(HIGHLIGHT_REEL_SINGLE_DEFAULTS.cardMatteColor),
      hidden: ({ parent }) => parent?.layout !== "single",
    }),
    defineField({
      name: "singleCardPadding",
      title: "Single card matte padding (px)",
      type: "number",
      initialValue: HIGHLIGHT_REEL_SINGLE_DEFAULTS.cardPadding,
      validation: (r) => r.min(0).integer(),
      hidden: ({ parent }) => parent?.layout !== "single",
    }),
    defineField({
      name: "compositeMaxWidth",
      title: "Composite max width (px)",
      type: "number",
      initialValue: HIGHLIGHT_REEL_COMPOSITE_DEFAULTS.maxWidth,
      validation: (r) => r.min(320).integer(),
      description: "Caps the board width on desktop. Default matches Figma 3778:130432.",
      hidden: ({ parent }) => parent?.layout !== "composite",
    }),
    defineField({
      name: "appearance",
      type: "appearance",
      initialValue: HIGHLIGHT_REEL_APPEARANCE_DEFAULTS,
    }),
  ],
  preview: {
    select: {
      title: "sectionTitle",
      cells: "cells",
      layout: "layout",
      composite: "compositeImage",
    },
    prepare: ({ title, cells, layout, composite }) => ({
      title: title || "Project Highlights",
      subtitle:
        layout === "composite"
          ? "composite board"
          : `${cells?.length || 0} highlight(s) · ${layout === "single" ? "single card" : "grid"}`,
      media: layout === "composite" ? composite : cells?.[0]?.frames?.[0],
    }),
  },
});
