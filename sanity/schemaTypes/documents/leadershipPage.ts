import { defineField, defineType } from "sanity";
import { pageSeoField } from "../objects/pageSeo";
import { approachSection } from "../objects/approachSection";

// Singleton for /leadership (nav: Approach): section prose with grey-pill
// reveals, plus leadership moments for the gallery view.
export const leadershipPage = defineType({
  name: "leadershipPage",
  title: "Approach Page",
  type: "document",
  groups: [
    { name: "prose", title: "Prose", default: true },
    { name: "legacy", title: "Deprecated fields" },
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
        "Seven sections with grey-pill reveals. When set, replaces the deprecated intro, lead, and closing fields.",
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
      title: "Intro prose (deprecated)",
      type: "interactiveProse",
      group: "legacy",
    }),
    defineField({
      name: "momentsHeading",
      title: "Moments heading (deprecated)",
      type: "string",
      initialValue: "My leadership moments",
      group: "legacy",
    }),
    defineField({
      name: "lead",
      title: "Lead prose (deprecated)",
      type: "interactiveProse",
      group: "legacy",
    }),
    defineField({
      name: "exploreText",
      title: "Explore link text (deprecated)",
      type: "string",
      initialValue: "",
      group: "legacy",
    }),
    defineField({
      name: "closing",
      title: "Closing prose (deprecated)",
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
