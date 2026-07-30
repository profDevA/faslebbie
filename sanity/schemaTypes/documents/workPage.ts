import { defineField, defineType } from "sanity";

// Singleton config for the /work grid shell (Work Gallery). The card grid
// itself is derived from published case studies, not stored here.
export const workPage = defineType({
  name: "workPage",
  title: "Work Page",
  type: "document",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section title",
      type: "string",
      initialValue: "Work",
    }),
    defineField({
      name: "intro",
      title: ".txt narrative",
      type: "workProse",
      description:
        "One paragraph per block. Mark project names with Project link (case-study slug) or Org name for non-clickable red orgs.",
    }),
    defineField({
      name: "enableTextView",
      title: "Enable text (.txt) view",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "enableImageView",
      title: "Enable image (.img) view",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "loadMoreLabel",
      title: "Load more label",
      type: "string",
      initialValue: "Load More",
    }),
    defineField({ name: "appearance", type: "appearance" }),
  ],
  preview: { prepare: () => ({ title: "Work Page" }) },
});
