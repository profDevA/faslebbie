import { defineArrayMember, defineType } from "sanity";

// Homepage interactive paragraph. Keywords navigate to an internal path;
// "story" is the trailing "more to my story+" pill (usually /about).
export const homeProse = defineType({
  name: "homeProse",
  title: "Home prose",
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
            name: "keyword",
            type: "object",
            title: "Keyword (navigate)",
            fields: [
              {
                name: "href",
                type: "string",
                title: "Path",
                description: "e.g. /work, /research, /teaching",
                validation: (r) => r.required(),
              },
            ],
          },
          {
            name: "story",
            type: "object",
            title: "Story pill (→ About)",
            fields: [
              {
                name: "href",
                type: "string",
                title: "Path",
                initialValue: "/about",
              },
            ],
          },
        ],
      },
    }),
  ],
});
