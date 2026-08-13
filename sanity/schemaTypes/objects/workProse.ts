import { defineArrayMember, defineType } from "sanity";

// Work page text narrative. Mark spans as project links or org names.
export const workProse = defineType({
  name: "workProse",
  title: "Work prose",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [{ title: "Normal", value: "normal" }],
      lists: [],
      marks: {
        decorators: [],
        annotations: [
          {
            name: "project",
            type: "object",
            title: "Project link (case study)",
            fields: [
              {
                name: "slug",
                type: "string",
                title: "Case study slug",
                description:
                  "Must match a published Case Study slug.",
                validation: (r) => r.required(),
              },
            ],
          },
          {
            name: "org",
            type: "object",
            title: "Org name (red, not clickable)",
            fields: [
              {
                name: "note",
                type: "string",
                title: "Note",
                hidden: true,
              },
            ],
          },
        ],
      },
    }),
  ],
});
