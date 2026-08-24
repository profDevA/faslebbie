import { defineArrayMember, defineType } from "sanity";

// Shared interactive prose for Teaching, Build, and Leadership pages.
export const interactiveProse = defineType({
  name: "interactiveProse",
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
          { name: "pill", type: "object", title: "Grey pill (static)", fields: [{ name: "note", type: "string", title: "Note", hidden: true }] },
          {
            name: "expandPill",
            type: "object",
            title: "Grey pill (click to expand)",
            fields: [
              {
                name: "expansion",
                type: "text",
                rows: 2,
                title: "Reveal copy",
                description: "Continuation revealed inline when the pill is clicked.",
              },
            ],
          },
          { name: "term", type: "object", title: "Terminal highlight (>/~)", fields: [{ name: "note", type: "string", title: "Note", hidden: true }] },
          {
            name: "ref",
            type: "object",
            title: "Open item modal (by id)",
            fields: [
              {
                name: "targetId",
                type: "string",
                title: "Item id",
                description: "The id/slug of the student or project this opens.",
              },
            ],
          },
          {
            name: "action",
            type: "object",
            title: "Action link",
            fields: [
              {
                name: "kind",
                type: "string",
                title: "Action",
                options: {
                  list: [
                    { title: "See all student works", value: "see-students" },
                    { title: "Explore student exhibitions", value: "explore-exhibition" },
                    { title: "Get in touch", value: "contact" },
                  ],
                },
              },
            ],
          },
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [{ name: "href", type: "string", title: "URL or path" }],
          },
        ],
      },
    }),
  ],
});
