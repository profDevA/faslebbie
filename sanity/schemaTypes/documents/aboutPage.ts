import { defineField, defineType } from "sanity";

// Singleton for the /about page: the bio itself, the reveal copy behind each
// grey keyword, and the CV / Resume / LinkedIn / Email links.
//
// Testimonials ("what people are saying") are NOT here — they're their own
// orderable document type, shared with the rest of the site.
export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  groups: [
    { name: "bio", title: "Bio", default: true },
    { name: "expansions", title: "Keyword expansions" },
    { name: "links", title: "Links" },
  ],
  fields: [
    defineField({
      name: "bio",
      title: "Bio",
      type: "aboutProse",
      description:
        "One paragraph per block. Grey keywords expand; add their copy under Keyword expansions.",
      group: "bio",
    }),
    defineField({
      name: "expansions",
      title: "Keyword expansions",
      type: "array",
      of: [{ type: "aboutExpansion" }],
      description:
        "Reveal copy for each grey keyword, matched by the keyword's exact text.",
      group: "expansions",
    }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      group: "links",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Label", type: "string" },
            {
              name: "href",
              title: "URL or path",
              type: "string",
              description:
                "e.g. /cv.pdf, https://linkedin.com/in/…, mailto:…",
            },
          ],
          preview: {
            select: { title: "label", subtitle: "href" },
          },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "About Page" }) },
});
