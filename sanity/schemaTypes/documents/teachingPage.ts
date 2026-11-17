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
      name: "materials",
      title: "Teaching statement & materials",
      type: "array",
      group: "prose",
      description:
        "Links shown at the end of the Teaching text, in the same pills as About's CV / Resume (Fas, Nov 17: \"put my teaching statement and related materials in a place where people can access them\"). Upload a PDF or paste a link. Empty = nothing shown.",
      of: [
        {
          type: "object",
          name: "teachingMaterial",
          fields: [
            { name: "label", title: "Label", type: "string", validation: (r) => r.required() },
            { name: "pdf", title: "PDF", type: "file", options: { accept: "application/pdf" } },
            { name: "href", title: "Or a link (URL)", type: "url", validation: (r) => r.uri({ scheme: ["http", "https", "mailto"] }) },
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        },
      ],
    }),
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
      title: "Exhibition page title (SEO)",
      type: "string",
      description:
        "Browser tab title for /teaching/exhibition only. Not shown on the Student Works grid.",
      group: "exhibition",
    }),
    defineField({
      name: "exhibitionHeading",
      title: "Exhibition page heading",
      type: "string",
      initialValue: "My Student Exhibitions",
      group: "exhibition",
    }),
    defineField({
      name: "exhibitionIntro",
      title: "Exhibition page intro",
      type: "text",
      rows: 4,
      group: "exhibition",
    }),
    defineField({
      name: "exhibitionCta",
      title: "Exhibition page CTA",
      type: "string",
      initialValue: "See their case studies",
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
