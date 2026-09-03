import { defineField, defineType } from "sanity";

/** Build popup long-scroll body. */
export const buildCaseStudyDetail = defineType({
  name: "buildCaseStudyDetail",
  title: "Modal scroll body",
  type: "object",
  fields: [
    defineField({
      name: "statusLabel",
      title: "Status label",
      type: "string",
      description: 'e.g. "Status: Prototype"',
    }),
    defineField({ name: "trigger", title: "Trigger", type: "text", rows: 4 }),
    defineField({ name: "observation", title: "Observation", type: "text", rows: 4 }),
    defineField({ name: "hypothesis", title: "Hypothesis", type: "text", rows: 4 }),
    defineField({
      name: "value",
      title: "Value (optional)",
      type: "text",
      rows: 3,
      description: "Rookieball-only beat between Hypothesis and Experiment.",
    }),
    defineField({ name: "experiment", title: "Experiment", type: "text", rows: 4 }),
    defineField({ name: "statusBody", title: "Status body", type: "text", rows: 3 }),
    defineField({
      name: "checklist",
      title: "Checklist",
      type: "array",
      of: [{ type: "buildChecklistItem" }],
    }),
    defineField({ name: "whoFor", title: "Who it's for", type: "text", rows: 3 }),
    defineField({
      name: "howItWorks",
      title: "How it works (steps)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "insights",
      title: "Insight grid",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
});
