import { defineField, defineType } from "sanity";

// Singleton for the /teaching page: intro prose, the ".txt" sections (Student
// Works / My Student Exhibitions), Student Works entries, and the SFK
// exhibition collage.
export const teachingPage = defineType({
  name: "teachingPage",
  title: "Teaching Page",
  type: "document",
  groups: [
    { name: "prose", title: "Prose", default: true },
    { name: "students", title: "Student works" },
    { name: "exhibition", title: "Exhibition" },
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
  ],
  preview: { prepare: () => ({ title: "Teaching Page" }) },
});
