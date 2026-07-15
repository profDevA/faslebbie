import { defineField, defineType } from "sanity";

// Singleton for the /research page: hero prose areas + the five modal sections
// (Minerals & Post-Extractive Design). Manifesto uses standard rich text so the
// bold emphasis runs are editable.
export const researchPage = defineType({
  name: "researchPage",
  title: "Research Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "sections", title: "Modal sections" },
  ],
  fields: [
    defineField({
      name: "areas",
      title: "Research areas",
      type: "array",
      of: [{ type: "researchArea" }],
      group: "hero",
    }),
    defineField({
      name: "closing",
      title: "Closing line",
      type: "researchProse",
      group: "hero",
    }),
    defineField({ name: "paradigms", type: "researchParadigms", group: "sections" }),
    defineField({ name: "principles", type: "researchPrinciples", group: "sections" }),
    defineField({ name: "modalities", type: "researchModalities", group: "sections" }),
    defineField({
      name: "manifesto",
      title: "Manifesto",
      type: "portableText",
      description: "Statement paragraphs; use bold for the emphasised phrases.",
      group: "sections",
    }),
    defineField({
      name: "fieldNotes",
      title: "Field notes",
      type: "array",
      of: [{ type: "researchFieldNote" }],
      group: "sections",
    }),
  ],
  preview: { prepare: () => ({ title: "Research Page" }) },
});
