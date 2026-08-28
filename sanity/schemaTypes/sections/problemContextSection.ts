import { defineField, defineType } from "sanity";

import { PROBLEM_CONTEXT_APPEARANCE_DEFAULTS } from "../../../src/lib/sanityAppearanceDefaults";

// 03 — Problem Context / What I Brought (Figma 2019:104708, band 600:12516).
// One black narrative band: challenge copy, then role / contribution copy.
export const problemContextSection = defineType({
  name: "problemContextSection",
  title: "Problem Context / What I Brought",
  type: "object",
  fields: [
    defineField({
      name: "problemHeading",
      title: "Problem context heading",
      type: "string",
      initialValue: "Problem Context",
    }),
    defineField({
      name: "problemBody",
      title: "Problem / challenge description",
      type: "portableText",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "broughtHeading",
      title: "What I brought heading",
      type: "string",
      initialValue: "What I Brought",
    }),
    defineField({
      name: "broughtBody",
      title: "Role / contribution description",
      type: "portableText",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "supportingCopy",
      title: "Optional supporting copy",
      type: "portableText",
    }),
    defineField({
      name: "appearance",
      type: "appearance",
      initialValue: PROBLEM_CONTEXT_APPEARANCE_DEFAULTS,
    }),
  ],
  preview: {
    select: { problemHeading: "problemHeading", broughtHeading: "broughtHeading" },
    prepare: ({ problemHeading, broughtHeading }) => ({
      title: "Problem Context / What I Brought",
      subtitle: [problemHeading, broughtHeading].filter(Boolean).join(" · "),
    }),
  },
});
