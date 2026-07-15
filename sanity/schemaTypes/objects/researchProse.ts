import { defineArrayMember, defineType } from "sanity";

// Hero prose for the Research page. Plain paragraphs whose spans can be marked
// as: a grey "highlight" pill (with optional reveal copy shown on click), a
// "sectionLink" that opens one of the modal sections, or a normal "link".
export const researchProse = defineType({
  name: "researchProse",
  title: "Prose",
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
            name: "highlight",
            type: "object",
            title: "Highlight (grey pill)",
            fields: [
              {
                name: "expansion",
                type: "text",
                rows: 3,
                title: "Reveal copy",
                description:
                  "Optional continuation text revealed inline when the pill is clicked.",
              },
            ],
          },
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
