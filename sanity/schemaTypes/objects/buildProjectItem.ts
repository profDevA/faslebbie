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
    defineField({ name: "kicker", title: "Modal kicker", type: "string", initialValue: "Design · 5 Min Read", group: "modal" }),
    defineField({ name: "subtitle", title: "Modal subtitle", type: "text", rows: 2, group: "modal" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4, group: "modal" }),
    defineField({
      name: "outputVisual",
      title: "Output visual",
      type: "image",
      options: { hotspot: true },
      description:
        "Popup scroll — “Output visuals” block (Figma 3540:1192). Middle screenshot Israel uploads.",
      group: "modal",
    }),
    defineField({
      name: "conceptPreview",
      title: "Concept preview",
      type: "image",
      options: { hotspot: true },
      description:
        "Full-screen Concept Preview overlay (Figma 16:2613 desktop / 16:3697 mobile).",
      group: "modal",
    }),
    defineField({
      name: "howItWorks",
      title: "How it works (steps)",
      type: "array",
      of: [{ type: "string" }],
      group: "modal",
    }),
    defineField({ name: "note", title: "Note", type: "text", rows: 2, group: "modal" }),
    defineField({
      name: "supportedTools",
      title: "Supported tools",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "modal",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "blurb", media: "images.0" },
  },
});
