import { defineField, defineType } from "sanity";

// One build project. Appears in the gallery grid and the project modal.
export const buildProjectItem = defineType({
  name: "buildProjectItem",
  title: "Build project",
  type: "object",
  groups: [
    { name: "card", title: "Card", default: true },
    { name: "modal", title: "Modal" },
  ],
  fields: [
    defineField({
      name: "id",
      title: "ID",
      type: "string",
      description: "Stable slug used by the prose links, e.g. leoney.",
      group: "card",
      validation: (r) => r.required(),
    }),
    defineField({ name: "title", title: "Title", type: "string", group: "card", validation: (r) => r.required() }),
    defineField({
      name: "hidden",
      title: "Hide on site",
      type: "boolean",
      description:
        "On: the project disappears from the Build page (grid, popup, Previous / Next) and keeps everything here, so you can bring it back later. (Fas, Nov 19: hide SenseSpace AI while it moves to Work.)",
      initialValue: false,
      group: "card",
    }),
    defineField({
      name: "tech",
      title: "Tech stack",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "card",
    }),
    defineField({
      name: "span",
      title: "Card height",
      type: "string",
      initialValue: "md",
      group: "card",
      options: {
        list: [
          { title: "Small", value: "sm" },
          { title: "Medium", value: "md" },
          { title: "Large", value: "lg" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({ name: "tint", title: "Placeholder tint", type: "string", group: "card" }),
    defineField({ name: "lightArt", title: "Light placeholder (dark label)", type: "boolean", group: "card" }),
    defineField({
      name: "blurb",
      title: "Card blurb",
      type: "text",
      rows: 2,
      description: "Short line under the tech stack on the gallery card.",
      group: "card",
    }),
    defineField({
      name: "images",
      title: "Card cover + hero",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (r) => r.max(1),
      description:
        "Gallery `.img` thumb and modal teal-band hero (first slide). One image only.",
      group: "card",
    }),
    // Israel, Nov 25 (Holistic → QUICK FIXES): each popup's left panel has its
    // own 549 × 684 art, different from the .img card. Set = it fills the
    // panel and the colour / size below don't apply; empty = the card image.
    defineField({
      name: "popupImage",
      title: "Popup image (left panel)",
      type: "image",
      options: { hotspot: true },
      description:
        "Full-bleed art for the popup's left panel (Israel's Quick Fixes art). Empty = uses the card image.",
      group: "modal",
    }),
    // Fas, Nov 23 call (item 7): the popup's image panel was the same dark
    // teal for every project ("it should reflect the case study").
    defineField({
      name: "panelColor",
      title: "Popup image panel colour",
      type: "color",
      description:
        "Background of the popup's image panel (left half on desktop, the block under the title on phones). Empty = the dark teal #133034.",
      options: { disableAlpha: true },
      group: "modal",
    }),
    defineField({
      name: "panelImageFit",
      title: "Popup image size",
      type: "string",
      description:
        "Padded: the card image sits in the middle of the panel colour (as now). Fill: it covers the whole panel edge to edge (cropped to fit, centred).",
      initialValue: "padded",
      options: {
        list: [
          { title: "Padded (as now)", value: "padded" },
          { title: "Fill the panel", value: "fill" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      group: "modal",
    }),
    defineField({ name: "kicker", title: "Modal kicker", type: "string", group: "modal" }),
    defineField({ name: "subtitle", title: "Modal subtitle", type: "text", rows: 2, group: "modal" }),
    defineField({
      name: "caseStudyDetail",
      title: "Modal scroll body",
      type: "buildCaseStudyDetail",
      description:
        "Trigger through Insight grid — the long scroll below the hero.",
      group: "modal",
    }),
    defineField({
      name: "outputVisual",
      title: "Output visual",
      type: "image",
      options: { hotspot: true },
      description:
        "Popup scroll — “Output visuals” block. Middle screenshot Israel uploads.",
      group: "modal",
    }),
    defineField({
      name: "conceptPreview",
      title: "Concept preview",
      type: "image",
      options: { hotspot: true },
      description:
        "Full-screen Concept Preview overlay (desktop and mobile).",
      group: "modal",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "blurb", media: "images.0", hidden: "hidden" },
    prepare: ({ title, subtitle, media, hidden }) => ({
      title: hidden ? `${title ?? ""} (hidden)` : title,
      subtitle,
      media,
    }),
  },
});
