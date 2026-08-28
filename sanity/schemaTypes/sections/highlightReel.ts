import { defineField, defineType } from "sanity";

import {
  HIGHLIGHT_REEL_GRID_DEFAULTS,
  HIGHLIGHT_REEL_SINGLE_DEFAULTS,
} from "../../../src/lib/caseStudyDefaults";
import {
  HIGHLIGHT_REEL_APPEARANCE_DEFAULTS,
  sanityColor,
} from "../../../src/lib/sanityAppearanceDefaults";

// §10 Highlight Reel / Project Highlights — grid or single rotating card.
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
        "Grid: six cells in a 3×2 layout (Coral). Single card: one large card cycling every frame (Experian Boost, Memory Tubes).",
      options: {
        list: [
          { title: "Grid (3×2 cells)", value: "grid" },
          { title: "Single rotating card", value: "single" },
        ],
        layout: "radio",
      },
      initialValue: "grid",
    }),
    defineField({
      name: "cells",
      title: "Multiple Highlights",
      type: "array",
      of: [{ type: "highlightCell" }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "gridCellMatteColor",
      title: "Grid cell matte color",
      type: "color",
      initialValue: sanityColor(HIGHLIGHT_REEL_GRID_DEFAULTS.cellMatteColor),
      description: "Background behind each thumbnail in the 3×2 grid layout.",
      options: { disableAlpha: false },
      hidden: ({ parent }) => parent?.layout === "single",
    }),
    defineField({
      name: "gridCellInsetVerticalPercent",
      title: "Grid cell inset top/bottom (%)",
      type: "number",
      initialValue: HIGHLIGHT_REEL_GRID_DEFAULTS.cellInsetVerticalPercent,
      validation: (r) => r.min(0).max(40),
      hidden: ({ parent }) => parent?.layout === "single",
    }),
    defineField({
      name: "gridCellInsetHorizontalPercent",
      title: "Grid cell inset left/right (%)",
      type: "number",
      initialValue: HIGHLIGHT_REEL_GRID_DEFAULTS.cellInsetHorizontalPercent,
      validation: (r) => r.min(0).max(40),
      hidden: ({ parent }) => parent?.layout === "single",
    }),
    defineField({
      name: "gridGap",
      title: "Grid gap (px)",
      type: "number",
      initialValue: HIGHLIGHT_REEL_GRID_DEFAULTS.gridGap,
      validation: (r) => r.min(0).integer(),
      hidden: ({ parent }) => parent?.layout === "single",
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
      name: "appearance",
      type: "appearance",
      initialValue: HIGHLIGHT_REEL_APPEARANCE_DEFAULTS,
    }),
  ],
  preview: {
    select: { title: "sectionTitle", cells: "cells", layout: "layout" },
    prepare: ({ title, cells, layout }) => ({
      title: title || "Project Highlights",
      subtitle: `${cells?.length || 0} highlight(s) · ${layout === "single" ? "single card" : "grid"}`,
    }),
  },
});
