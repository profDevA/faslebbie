import { defineField, defineType } from "sanity";
import { pageSeoField } from "../objects/pageSeo";

// Singleton for the /blogs page: blog posts and media entries.
export const blogsPage = defineType({
  name: "blogsPage",
  title: "Blogs & Media Page",
  type: "document",
  groups: [
    { name: "blog", title: "Blog", default: true },
    { name: "words", title: "Words (publications)" },
    { name: "media", title: "Media" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "posts",
      title: "Blog posts",
      type: "array",
      of: [{ type: "blogPostItem" }],
      group: "blog",
    }),
    defineField({
      name: "currentProjects",
      title: "Current Projects",
      type: "array",
      of: [{ type: "publicationItem" }],
      group: "words",
    }),
    defineField({
      name: "books",
      title: "Books",
      type: "array",
      of: [{ type: "publicationItem" }],
      group: "words",
    }),
    defineField({
      name: "journals",
      title: "Journals + Articles",
      type: "array",
      of: [{ type: "publicationItem" }],
      group: "words",
    }),
    defineField({
      name: "mediaFeatured",
      title: "Design Again (featured)",
      type: "mediaFeatured",
      group: "media",
      description:
        "Hero podcast block at the top of `.media` (Figma 3323:9065). Talks use Media entries below.",
    }),
    defineField({
      name: "media",
      title: "Talks & videos",
      type: "array",
      of: [{ type: "mediaEntry" }],
      group: "media",
    }),
    pageSeoField,
  ],
  preview: { prepare: () => ({ title: "Blogs & Media Page" }) },
});
