import { defineField, defineType } from "sanity";
import { pageSeoField } from "../objects/pageSeo";

// Singleton for the /blogs page: blog posts and media entries.
export const blogsPage = defineType({
  name: "blogsPage",
  title: "Blogs & Media Page",
  type: "document",
  groups: [
    { name: "blog", title: "Blog", default: true },
    { name: "words", title: "Publications" },
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
      title: "Articles",
      description: "Shown as \"Articles\" on .publications (was Current Projects, Nov 17).",
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
      title: "Journals",
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
        "Hero podcast block at the top of `.media`. Talks use Media entries below.",
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
