import { defineField, defineType } from "sanity";

// One blog post for Blogs & Media. Opens in a modal with cover and body.
export const blogPostItem = defineType({
  name: "blogPostItem",
  title: "Blog post",
  type: "object",
  fieldsets: [
    {
      name: "footer",
      title: "Article footer",
      description:
        "Avatar, date, and author line below the article body (Figma 16:1581). Share buttons (LinkedIn, X, Threads, Copy link) are automatic on the site — not edited here.",
      options: { collapsible: false },
    },
  ],
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
      description: "Optional link to the full article. Also used as the share link when set.",
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
    defineField({
      name: "authorAvatar",
      title: "Footer avatar",
      type: "image",
      fieldset: "footer",
      options: { hotspot: true },
      description:
        "Square photo above the date line. Empty = Site Settings → Master portrait.",
    }),
    defineField({
      name: "publishedAt",
      title: "Published date",
      type: "date",
      fieldset: "footer",
      description: 'Footer line, e.g. "September 24, 2025 . Written by …".',
    }),
    defineField({
      name: "authorName",
      title: "Author name",
      type: "string",
      fieldset: "footer",
      initialValue: "Fas Lebbie",
      description: 'Footer line, e.g. "… . Written by Fas Lebbie".',
    }),
  ],
  preview: { select: { title: "title", subtitle: "category" } },
});
