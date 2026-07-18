import { defineArrayMember, defineType } from "sanity";

// Shared interactive prose (Portable Text) for the Teaching / Build / Leadership
// pages. Spans can be marked as:
//   • pill        — static grey institution pill (Teaching intro)
//   • expandPill  — grey pill that reveals a short continuation on click
//                   (Leadership intro, About-style) — carries the reveal copy
//   • term        — black `>/~` terminal-style highlight (Teaching "learn it")
//   • ref         — red link that opens a modal item by id (student / project)
//   • action      — red action link (see-all / explore / contact)
//   • link        — internal/external navigation
// The per-page mappers (lib/*FromSanity.ts) turn these back into each page's
// token dialect, falling back to the in-code copy when a field is empty.
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
                    { title: "See all student works (→ .img)", value: "see-students" },
                    { title: "Explore student exhibitions (→ overlay)", value: "explore-exhibition" },
                    { title: "Explore leadership moments (→ .img)", value: "explore-moments" },
                    { title: "Get in touch (→ /contact)", value: "contact" },
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
