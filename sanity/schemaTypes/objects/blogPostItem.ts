import { defineField, defineType } from "sanity";

// One ".blog" entry (Blogs & Media). Shows as a title + meta line in the list;
// opens a paged modal with a cover slide + colored caption panel.
export const blogPostItem = defineType({
  name: "blogPostItem",
  title: "Blog post",
  type: "object",
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "string",
      description: "Stable id, e.g. design-pulse.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Column / category",
      type: "string",
      description: 'Grouping heading in the list, e.g. "Design Muscle".',
      initialValue: "Design Muscle",
    }),
    defineField({
      name: "meta",
      title: "Meta line",
      type: "string",
      description: 'Small line above the title, e.g. "Design · 5 min read".',
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "kicker",
      title: "Modal kicker",
      type: "string",
      description: 'Small caps line in the modal, e.g. "Design · 5 Min Read".',
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "body",
      title: "Article body",
      description:
        "Full article, shown below the hero in the modal (scrolls). Use Section for major headings, Subheading for smaller ones. Add images for in-article diagrams.",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Section", value: "h2" },
            { title: "Subheading", value: "h3" },
          ],
          lists: [{ title: "Bullet", value: "bullet" }],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [],
          },
        },
        { type: "image", options: { hotspot: true } },
      ],
    }),
    defineField({
      name: "url",
      title: "Read blog URL",
      type: "url",
      description: "Optional link to the full article.",
    }),
    defineField({
      name: "cover",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      description: "Optional. When empty, the color below is used as the cover.",
    }),
    defineField({
      name: "coverBg",
      title: "Cover color",
      type: "string",
      description: "Hex used for the cover slide when no image is set.",
      initialValue: "#eaa31e",
    }),
    defineField({
      name: "panelBg",
      title: "Caption panel color",
      type: "string",
      initialValue: "#3a1618",
    }),
    defineField({
      name: "panelText",
      title: "Caption text color",
      type: "string",
      initialValue: "#e8917b",
    }),
  ],
  preview: { select: { title: "title", subtitle: "category" } },
});
