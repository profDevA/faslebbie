import { defineArrayMember, defineType } from "sanity";

// Work page ".txt" narrative. Spans can be marked as a red project link
// (opens the case-study modal by slug) or a red org name (Western Digital /
// SanDisk — underlined but not clickable).
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
                  "Must match a published Case Study slug (e.g. coral-health).",
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
