import { defineField, defineType } from "sanity";
import { BUILD_SECTION_TITLE_DEFAULTS } from "../../../src/lib/build";
import { pageSeoField } from "../objects/pageSeo";

const TITLE_FIELDS: { name: keyof typeof BUILD_SECTION_TITLE_DEFAULTS; title: string }[] = [
  { name: "trigger", title: "Trigger" },
  { name: "observation", title: "Observation" },
  { name: "hypothesis", title: "Hypothesis" },
  { name: "value", title: "Value" },
  { name: "experiment", title: "Experiment" },
  { name: "status", title: "Status" },
  { name: "checklist", title: "Checklist" },
  { name: "whoFor", title: "Who it's for" },
  { name: "howItWorks", title: "How it works" },
  { name: "outputVisuals", title: "Output visuals" },
  { name: "insights", title: "Insight grid" },
];

// Singleton for the /build page: intro prose + the repeatable Build projects
// (each powers a card and the paged project modal).
export const buildPage = defineType({
  name: "buildPage",
  title: "Build Page",
  type: "document",
  groups: [
    { name: "prose", title: "Prose", default: true },
    { name: "projects", title: "Projects" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "intro",
      title: "Intro prose",
      type: "interactiveProse",
      group: "prose",
    }),
    defineField({
      name: "projects",
      title: "Projects",
      type: "array",
      of: [{ type: "buildProjectItem" }],
      group: "projects",
    }),
    defineField({
      name: "sectionTitles",
      title: "Popup section titles",
      description:
        "The titles above each section in every project popup. Change one here and it changes in all projects. Leave a field empty to keep the default shown in grey. To remove a section from one project, clear its content in that project.",
      type: "object",
      group: "projects",
      options: { collapsible: true, collapsed: true },
      fields: TITLE_FIELDS.map(({ name, title }) =>
        defineField({
          name,
          title,
          type: "string",
          placeholder: BUILD_SECTION_TITLE_DEFAULTS[name],
        }),
      ),
    }),
    pageSeoField,
  ],
  preview: { prepare: () => ({ title: "Build Page" }) },
});
