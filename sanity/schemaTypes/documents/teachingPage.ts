import { defineField, defineType } from "sanity";

// Singleton for the /teaching page: intro prose, the ".txt" sections (Student
// Works / My Student Exhibitions), and the repeatable Student Works entries.
// The SFK exhibition collage stays code-driven (placeholder tiles) for now.
export const teachingPage = defineType({
  name: "teachingPage",
  title: "Teaching Page",
  type: "document",
  groups: [
    { name: "prose", title: "Prose", default: true },
    { name: "students", title: "Student works" },
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
  ],
  preview: { prepare: () => ({ title: "Teaching Page" }) },
});
