import { defineField, defineType } from "sanity";

// Singleton for the /blogs page: the ".blog" writing list and the ".media"
// grid. Both are repeatable arrays the team can extend from the CMS.
export const blogsPage = defineType({
  name: "blogsPage",
  title: "Blogs & Media Page",
  type: "document",
  groups: [
    { name: "blog", title: "Blog", default: true },
    { name: "media", title: "Media" },
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
  ],
  preview: { prepare: () => ({ title: "Blogs & Media Page" }) },
});
