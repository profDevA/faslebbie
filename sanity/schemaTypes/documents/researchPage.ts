import { defineField, defineType } from "sanity";
import { pageSeoField } from "../objects/pageSeo";

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
    { name: "seo", title: "SEO" },
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
    // Off unless switched on: an existing document has no value, so field notes
    // are hidden with no content change (Fas, Nov 24 call: "Can we hide the
    // field notes for now?"). Like Build's "Hide on site", the notes stay here.
    defineField({
      name: "showFieldNotes",
      title: "Show field notes on site",
      type: "boolean",
      description:
        "Off: no Field Notes popup or pages, no field-note addresses in the sitemap, and the red \"field notes\" link and the words joining it (\", along with selected\") drop out of the Research text, so it ends \"…and a manifesto.\". On: all of it comes back as written. The notes below are kept either way. Never empty the list to hide them.",
      initialValue: false,
      group: "sections",
    }),
    defineField({
      name: "fieldNotes",
      title: "Field notes",
      type: "array",
      of: [{ type: "researchFieldNote" }],
      group: "sections",
    }),
    pageSeoField,
  ],
  preview: { prepare: () => ({ title: "Research Page" }) },
});
