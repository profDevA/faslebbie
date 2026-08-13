import { defineField, defineType } from "sanity";
import { pageSeoField } from "../objects/pageSeo";

// Singleton config for the /work grid shell (Work Gallery). The card grid
// itself is derived from published case studies, not stored here.
export const workPage = defineType({
  name: "workPage",
  title: "Work Page",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section title",
      type: "string",
      initialValue: "Work",
      group: "content",
    }),
    defineField({
      name: "intro",
      title: "Text narrative",
      type: "workProse",
      group: "content",
      description:
        "One paragraph per block. Mark project names with Project link (case-study slug) or Org name for non-clickable red orgs.",
    }),
    defineField({
      name: "enableTextView",
      title: "Enable text view",
      type: "boolean",
      initialValue: true,
      group: "content",
    }),
    defineField({
      name: "enableImageView",
      title: "Enable gallery view",
      type: "boolean",
      initialValue: true,
      group: "content",
    }),
    defineField({
      name: "toolStack",
      title: "Tool stack",
      type: "array",
      of: [{ type: "toolStackItem" }],
      group: "content",
      description: "Icons under the portrait in text view.",
    }),
    defineField({
      name: "toolStackPerRow",
      title: "Stack icons per row",
      type: "number",
      initialValue: 6,
      group: "content",
      validation: (r) => r.min(1).max(12),
    }),
    defineField({
      name: "loadMoreLabel",
      title: "Load more label",
      type: "string",
      initialValue: "Load More",
      group: "content",
    }),
    defineField({ name: "appearance", type: "appearance", group: "content" }),
    pageSeoField,
  ],
  preview: { prepare: () => ({ title: "Work Page" }) },
});
