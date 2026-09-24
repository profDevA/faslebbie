import { defineField, defineType } from "sanity";

import { MOTION_SHOWCASE_BAND_DEFAULTS } from "../../../src/lib/caseStudyDefaults";
import {
  MOTION_SHOWCASE_APPEARANCE_DEFAULTS,
  MOTION_SHOWCASE_POPUP_APPEARANCE_DEFAULTS,
} from "../../../src/lib/sanityAppearanceDefaults";

// 07 — Motion Showcase.
// Coral example: Key Product Experiences — Mobile + iPad.
export const motionShowcase = defineType({
  name: "motionShowcase",
  title: "07 — Motion Showcase",
  type: "object",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section heading",
      type: "string",
      initialValue: "Key Product Experiences",
    }),
    defineField({
      name: "layoutVariant",
      title: "Band layout",
      type: "string",
      initialValue: "stacked",
      description:
        "Coral / Experian = stacked rows. Census = featured device. New sections default to stacked; existing documents only show a selected radio after this field is saved once.",
      options: {
        list: [
          {
            title: "Stacked rows (Coral — one coloured band, multiple devices)",
            value: "stacked",
          },
          {
            title: "Featured device (Census — centred mockup + anchored caption)",
            value: "featured",
          },
          {
            title: "Phone row (DVA — 3-up strip + bottom-right intro)",
            value: "phoneRow",
          },
          {
            title:
              "Cross-functional (AR Handbook — diagonal 3-device desktop, stacked mobile)",
            value: "crossFunctional",
          },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "intro",
      title: "Supporting description",
      type: "portableText",
    }),
    defineField({
      name: "titleMarginBottom",
      title: "Title margin bottom (px)",
      type: "number",
      initialValue: MOTION_SHOWCASE_BAND_DEFAULTS.titleMarginBottom,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "titleMarginBottomDesktop",
      title: "Title margin bottom desktop (px)",
      type: "number",
      initialValue: MOTION_SHOWCASE_BAND_DEFAULTS.titleMarginBottomDesktop,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "introMarginBottom",
      title: "Intro margin bottom (px)",
      type: "number",
      initialValue: MOTION_SHOWCASE_BAND_DEFAULTS.introMarginBottom,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "rows",
      title: "Optional multiple product flows",
      description:
        "Each flow is one device row — e.g. mobile animations (left) and tablet / iPad animations (right).",
      type: "array",
      of: [{ type: "motionRow" }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "appearance",
      type: "appearance",
      initialValue: MOTION_SHOWCASE_APPEARANCE_DEFAULTS,
    }),
    defineField({
      name: "viewMoreLabel",
      title: "View More label",
      type: "string",
      initialValue: "View More",
      description:
        "Cross-functional bands only — underlined CTA under the device layout.",
    }),
    defineField({
      name: "viewMorePopups",
      title: "View More popup pages",
      type: "array",
      of: [{ type: "viewMorePopupPage" }],
      description:
        "Design Interventions modal — same device-tab + Load More pattern as Core Experience View More. Extra array entries only if you truly need a separate popup page (footer pager).",
    }),
    defineField({
      name: "popupAppearance",
      title: "View More — layout & colors",
      type: "appearance",
      initialValue: MOTION_SHOWCASE_POPUP_APPEARANCE_DEFAULTS,
    }),
    defineField({
      name: "popupItemsBeforeViewMore",
      title: "Popup — items before Load More",
      type: "number",
      initialValue: 6,
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "popupLoadMoreLabel",
      title: "Popup — Load More label",
      type: "string",
      initialValue: "Load More",
    }),
    defineField({
      name: "popupLoadLessLabel",
      title: "Popup — Show Less label",
      type: "string",
      initialValue: "Show Less",
    }),
  ],
  preview: {
    select: { title: "sectionTitle", rows: "rows" },
    prepare: ({ title, rows }) => ({
      title: title || "Motion Showcase",
      subtitle: `07 · ${rows?.length || 0} product flow(s)`,
    }),
  },
});
