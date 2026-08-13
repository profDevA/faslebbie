import { defineField, defineType } from "sanity";
import { pageSeoField } from "../objects/pageSeo";

// Singleton for the /blogs page: blog posts and media entries.
export const blogsPage = defineType({
  name: "blogsPage",
  title: "Blogs & Media Page",
  type: "document",
  groups: [
    { name: "blog", title: "Blog", default: true },
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
      name: "media",
      title: "Media entries",
      type: "array",
      of: [{ type: "mediaEntry" }],
      group: "media",
    }),
    pageSeoField,
  ],
  preview: { prepare: () => ({ title: "Blogs & Media Page" }) },
});
