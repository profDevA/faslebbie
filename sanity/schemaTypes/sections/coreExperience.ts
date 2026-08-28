import { defineField, defineType } from "sanity";

// 04 — Core Experience Flow (Figma 2110:39499 band + 3670:21768 popup tabs).
export const coreExperience = defineType({
  name: "coreExperience",
  title: "04 — Core Experience Flow",
  type: "object",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Band headline",
      type: "string",
      initialValue: "Core Experience Flow",
      description: "Centred title on the teal band. Default matches Coral.",
    }),
    defineField({
      name: "body",
      title: "Intro (optional)",
      type: "portableText",
      description:
        "Optional paragraph above the screen row. Coral usually leaves this blank — copy lives in popup cards only.",
    }),
    defineField({
      name: "layoutVariant",
      title: "Screen layout",
      type: "string",
      options: {
        list: [
          {
            title: "Mobile row (Coral, phone portraits)",
            value: "mobileRow",
          },
          {
            title: "Desktop grid (US Census, wide frames)",
            value: "desktopGrid",
          },
        ],
        layout: "radio",
      },
      initialValue: "mobileRow",
      description:
        "Mobile row = tall phone cards in a horizontal strip. Desktop grid = wider landscape tiles (popup scrolls sideways).",
    }),
    defineField({
      name: "previewScreens",
      title: "Band preview screens",
      type: "array",
      of: [{ type: "coreExperienceScreen" }],
      description:
        "Screens shown on the case-study band (Figma shows ~5). Order left → right. Upload individual frames — not one combined export.",
      validation: (r) => r.min(1).warning(),
    }),
    defineField({
      name: "popupScreens",
      title: "Popup screens (deprecated)",
      type: "array",
      of: [{ type: "coreExperienceScreen" }],
      hidden: true,
      description: "Legacy horizontal-scroll popup — replaced by Popup device tabs below.",
    }),
    defineField({
      name: "popupBody",
      title: "Popup intro",
      type: "portableText",
      description:
        "Paragraph at the top of the View More popup. Coral: “eight interconnected modules…” (Figma 3670:21768).",
    }),
    defineField({
      name: "popupTabs",
      title: "Popup device tabs",
      type: "array",
      of: [{ type: "deviceTab" }],
      description:
        "Mobile View / iPad View / Desktop View grids inside the popup. Each tab holds flow screenshots on #4f6b76 tiles.",
    }),
    defineField({
      name: "popupItemsBeforeViewMore",
      title: "Popup — items before Load More",
      type: "number",
      initialValue: 6,
      validation: (r) => r.min(1).max(12),
    }),
    defineField({
      name: "popupLoadMoreLabel",
      title: "Popup — Load More label",
      type: "string",
      initialValue: "Load More",
    }),
    defineField({
      name: "viewMoreLabel",
      title: "View-more link label",
      type: "string",
      initialValue: "View More",
      description: "Underlined CTA under the preview row. Opens the popup.",
    }),
    defineField({
      name: "image",
      title: "Legacy — single band artwork",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => (parent?.previewScreens?.length ?? 0) > 0,
      description:
        "Deprecated: one combined PNG of the whole row. Frontend falls back to this when Preview screens is empty. Prefer per-screen uploads above.",
    }),
    defineField({
      name: "imageMobile",
      title: "Legacy — mobile band crop",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => (parent?.previewScreens?.length ?? 0) > 0,
      description: "Optional narrow crop for the legacy single-image band on phones.",
    }),
    defineField({ name: "appearance", type: "appearance" }),
  ],
  preview: {
    select: {
      title: "sectionTitle",
      media: "previewScreens.0.image",
      legacy: "image",
      count: "previewScreens.length",
    },
    prepare: ({ title, media, legacy, count }) => ({
      title: title || "Core Experience Flow",
      subtitle: count ? `${count} preview screen(s)` : "Legacy single image",
      media: media ?? legacy,
    }),
  },
});
