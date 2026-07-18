import { defineField, defineType } from "sanity";

// One student project (Teaching → Student Works). The repeatable, editable
// template the team fills in — appears in the ".img" grid and the paged modal.
export const studentProject = defineType({
  name: "studentProject",
  title: "Student project",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "ID",
      type: "string",
      description: "Stable slug used by the prose links, e.g. new-transport.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description: "Long descriptive subtitle (e.g. Reimagining Urban Transit Experience).",
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4 }),
    defineField({
      name: "span",
      title: "Card height",
      type: "string",
      initialValue: "md",
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
    defineField({
      name: "tint",
      title: "Placeholder tint",
      type: "string",
      description: "Hex color for the placeholder card art (until real images are added).",
    }),
    defineField({ name: "lightArt", title: "Light placeholder (dark caption)", type: "boolean" }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description: "Carousel images. When empty, a placeholder is shown.",
    }),
  ],
  preview: { select: { title: "title", subtitle: "headline" } },
});
