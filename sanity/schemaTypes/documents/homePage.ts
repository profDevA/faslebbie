import { defineField, defineType } from "sanity";
import { pageSeoField } from "../objects/pageSeo";

// Singleton for the homepage interactive paragraph (keywords → pages).
export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "hero",
      title: "Hero paragraph",
      type: "homeProse",
      group: "content",
      description:
        "The big interactive sentence. Mark words as Keyword (set the path) or Story pill.",
    }),
    defineField({
      name: "storyHref",
      title: "Default story link",
      type: "string",
      initialValue: "/about",
      group: "content",
      description:
        "Fallback path for the story pill when a mark has no href of its own.",
    }),
    pageSeoField,
  ],
  preview: { prepare: () => ({ title: "Home Page" }) },
});
