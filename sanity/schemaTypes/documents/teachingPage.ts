import { defineField, defineType } from "sanity";
import { pageSeoField } from "../objects/pageSeo";

// Singleton for the /teaching page: intro, sections, student works, exhibition.
export const teachingPage = defineType({
  name: "teachingPage",
  title: "Teaching Page",
  type: "document",
  groups: [
    { name: "prose", title: "Prose", default: true },
    { name: "students", title: "Student works" },
    { name: "exhibition", title: "Exhibition" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "intro", title: "Intro prose", type: "interactiveProse", group: "prose" }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [{ type: "teachingSection" }],
      group: "prose",
    }),
    defineField({
      name: "students",
      title: "Student projects",
      type: "array",
      of: [{ type: "studentProject" }],
      group: "students",
    }),
    defineField({
      name: "studentsWorkIntro",
      title: "Student works intro",
      type: "text",
      rows: 5,
      description: "Intro paragraph on /teaching/students/[slug] detail pages.",
      group: "students",
    }),
    defineField({
      name: "exhibitionTitle",
      title: "Exhibition title",
      type: "string",
      initialValue: "SFK Beijing Exhibition",
      group: "exhibition",
    }),
    defineField({
      name: "exhibitionTiles",
      title: "Exhibition tiles",
      type: "array",
      of: [{ type: "exhibitionTile" }],
      group: "exhibition",
    }),
    pageSeoField,
  ],
  preview: { prepare: () => ({ title: "Teaching Page" }) },
});
