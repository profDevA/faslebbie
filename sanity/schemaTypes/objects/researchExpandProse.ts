import { defineArrayMember, defineType } from "sanity";

// Nested reveal copy inside a Research highlight pill. Same link marks as
// researchProse, but no further grey pills — keeps Studio nesting one level deep
// (used for the "African mining communities" inline expand).
export const researchExpandProse = defineType({
  name: "researchExpandProse",
  title: "Reveal prose",
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
            name: "sectionLink",
            type: "object",
            title: "Open modal section",
            fields: [
              {
                name: "section",
                type: "string",
                title: "Section",
                options: {
                  list: [
                    { title: "Paradigms", value: "paradigms" },
                    { title: "Principles", value: "principles" },
                    { title: "Modalities", value: "modalities" },
                    { title: "Manifesto", value: "manifesto" },
                    { title: "Field Notes", value: "field-notes" },
                  ],
                },
              },
            ],
          },
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              {
                name: "href",
                type: "string",
                title: "URL or path",
              },
            ],
          },
        ],
      },
    }),
  ],
});
