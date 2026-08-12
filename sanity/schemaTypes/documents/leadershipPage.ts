import { defineField, defineType } from "sanity";
import { pageSeoField } from "../objects/pageSeo";
import { approachSection } from "../objects/approachSection";

// Singleton for /leadership (nav: Approach): seven-section prose with grey-pill
// reveals, plus leadership moments for the ".img" gallery.
export const leadershipPage = defineType({
  name: "leadershipPage",
  title: "Approach Page",
  type: "document",
  groups: [
    { name: "prose", title: "Prose", default: true },
    { name: "legacy", title: "Legacy prose" },
    { name: "moments", title: "Moments" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "sections",
      title: "Approach sections",
      type: "array",
      of: [{ type: "approachSection" }],
      description:
        "Final-copy structure (7 sections). When set, replaces legacy intro / lead / closing.",
      group: "prose",
    }),
    defineField({
      name: "contactText",
      title: "Contact link text",
      type: "string",
      initialValue: "Get in touch",
      group: "prose",
    }),
    defineField({
      name: "intro",
      title: "Intro prose (legacy)",
      type: "interactiveProse",
      group: "legacy",
    }),
    defineField({
      name: "momentsHeading",
      title: "Moments heading (legacy)",
      type: "string",
      initialValue: "My leadership moments",
      group: "legacy",
    }),
    defineField({
      name: "lead",
      title: "Lead prose (legacy)",
      type: "interactiveProse",
      group: "legacy",
    }),
    defineField({
      name: "exploreText",
      title: "Explore link text (legacy — removed from Approach)",
      type: "string",
      initialValue: "",
      group: "legacy",
    }),
    defineField({
      name: "closing",
      title: "Closing prose (legacy)",
      type: "interactiveProse",
      group: "legacy",
    }),
    defineField({
      name: "moments",
      title: "Leadership moments",
      type: "array",
      of: [{ type: "leadershipMoment" }],
      group: "moments",
    }),
    pageSeoField,
  ],
  preview: { prepare: () => ({ title: "Approach Page" }) },
});
