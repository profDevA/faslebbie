import { defineField, defineType } from "sanity";
import { pageSeoField } from "../objects/pageSeo";

// Singleton for the /build page: intro prose + the repeatable Build projects
// (each powers a card and the paged project modal).
export const buildPage = defineType({
  name: "buildPage",
  title: "Build Page",
  type: "document",
  groups: [
    { name: "prose", title: "Prose", default: true },
    { name: "projects", title: "Projects" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "intro",
      title: "Intro prose",
      type: "interactiveProse",
      group: "prose",
    }),
    defineField({
      name: "projects",
      title: "Projects",
      type: "array",
      of: [{ type: "buildProjectItem" }],
      group: "projects",
    }),
    pageSeoField,
  ],
  preview: { prepare: () => ({ title: "Build Page" }) },
});
