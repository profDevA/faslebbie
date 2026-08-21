import { defineField, defineType } from "sanity";

// One blog post for Blogs & Media. Opens in a modal with cover and body.
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
        "Full article editor: styles, lists, B/I/U, links, colors, images (caption/size), video, code, tables, callouts, pull quotes, CTAs, dividers. Use + to insert blocks.",
      type: "blogPortableText",
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
