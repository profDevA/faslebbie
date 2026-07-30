import { defineField, defineType } from "sanity";

// Singleton for the homepage interactive paragraph (keywords → pages).
export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero paragraph",
      type: "homeProse",
      description:
        "The big interactive sentence. Mark words as Keyword (set the path) or Story pill.",
    }),
    defineField({
      name: "storyHref",
      title: "Default story link",
      type: "string",
      initialValue: "/about",
      description:
        "Fallback path for the story pill when a mark has no href of its own.",
    }),
  ],
  preview: { prepare: () => ({ title: "Home Page" }) },
});
