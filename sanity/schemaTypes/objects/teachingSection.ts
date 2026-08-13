import { defineField, defineType } from "sanity";

// A Teaching page section: kicker, interactive prose, and an optional action link.
export const teachingSection = defineType({
  name: "teachingSection",
  title: "Section",
  type: "object",
  fields: [
    defineField({ name: "kicker", title: "Kicker", type: "string" }),
    defineField({ name: "body", title: "Body", type: "interactiveProse" }),
    defineField({
      name: "actionKind",
      title: "Action",
      type: "string",
      options: {
        list: [
          { title: "See all student works", value: "students" },
          { title: "Explore student exhibitions", value: "exhibition" },
        ],
      },
    }),
    defineField({ name: "actionText", title: "Action text", type: "string" }),
  ],
  preview: { select: { title: "kicker" } },
});
