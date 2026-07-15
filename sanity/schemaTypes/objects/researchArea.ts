import { defineField, defineType } from "sanity";

// One numbered research area in the hero (kicker + interactive prose body).
export const researchArea = defineType({
  name: "researchArea",
  title: "Research area",
  type: "object",
  fields: [
    defineField({
      name: "kicker",
      title: "Kicker",
      type: "string",
      description: 'e.g. "01 — Minerals & Post-Extractive Design"',
    }),
    defineField({ name: "body", title: "Body", type: "researchProse" }),
  ],
  preview: { select: { title: "kicker" } },
});
