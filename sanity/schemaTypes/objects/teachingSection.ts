import { defineField, defineType } from "sanity";

// A ".txt" section on the Teaching page: a kicker, interactive prose, and a
// trailing red action link (Student Works / My Student Exhibitions).
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
          { title: "See all student works (→ .img)", value: "students" },
          { title: "Explore student exhibitions (→ overlay)", value: "exhibition" },
        ],
      },
    }),
    defineField({ name: "actionText", title: "Action text", type: "string" }),
  ],
  preview: { select: { title: "kicker" } },
});
