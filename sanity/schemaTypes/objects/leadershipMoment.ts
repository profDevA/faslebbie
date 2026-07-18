import { defineField, defineType } from "sanity";

// One leadership moment (Leadership → ".img" gallery + unified popup).
// Repeatable, editable template.
export const leadershipMoment = defineType({
  name: "leadershipMoment",
  title: "Leadership moment",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "ID",
      type: "string",
      description: "Stable id, e.g. m1.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "label", title: "Card label", type: "string" }),
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
    defineField({ name: "highlight", title: "Highlight card (light blue)", type: "boolean" }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "testimonial", title: "Testimonial", type: "text", rows: 4 }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
  ],
  preview: { select: { title: "label", subtitle: "role" } },
});
