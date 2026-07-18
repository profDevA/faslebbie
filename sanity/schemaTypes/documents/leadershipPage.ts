import { defineField, defineType } from "sanity";

// Singleton for the /leadership page: the three ".txt" prose paragraphs (with
// click-to-expand grey pills), the small headings/links, and the repeatable
// "leadership moments" that power the ".img" gallery + unified popup.
export const leadershipPage = defineType({
  name: "leadershipPage",
  title: "Leadership Page",
  type: "document",
  groups: [
    { name: "prose", title: "Prose", default: true },
    { name: "moments", title: "Moments" },
  ],
  fields: [
    defineField({ name: "intro", title: "Intro prose", type: "interactiveProse", group: "prose" }),
    defineField({ name: "momentsHeading", title: "Moments heading", type: "string", initialValue: "My leadership moments", group: "prose" }),
    defineField({ name: "lead", title: "Lead prose", type: "interactiveProse", group: "prose" }),
    defineField({ name: "exploreText", title: "Explore link text", type: "string", initialValue: "Explore my leadership moments", group: "prose" }),
    defineField({ name: "closing", title: "Closing prose", type: "interactiveProse", group: "prose" }),
    defineField({ name: "contactText", title: "Contact link text", type: "string", initialValue: "Get in touch", group: "prose" }),
    defineField({
      name: "moments",
      title: "Leadership moments",
      type: "array",
      of: [{ type: "leadershipMoment" }],
      group: "moments",
    }),
  ],
  preview: { prepare: () => ({ title: "Leadership Page" }) },
});
