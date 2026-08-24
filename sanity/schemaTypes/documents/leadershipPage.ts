import { defineField, defineType } from "sanity";
import { pageSeoField } from "../objects/pageSeo";
import { approachSection } from "../objects/approachSection";

// Singleton for /leadership (nav: Approach): section prose with grey-pill reveals.
export const leadershipPage = defineType({
  name: "leadershipPage",
  title: "Approach Page",
  type: "document",
  groups: [
    { name: "prose", title: "Prose", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "sections",
      title: "Approach sections",
      type: "array",
      of: [{ type: "approachSection" }],
      description: "Five sections with grey-pill reveals.",
      group: "prose",
    }),
    defineField({
      name: "contactText",
      title: "Contact link text",
      type: "string",
      initialValue: "Get in touch",
      group: "prose",
    }),
    pageSeoField,
  ],
  preview: { prepare: () => ({ title: "Approach Page" }) },
});
