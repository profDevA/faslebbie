import { defineField, defineType } from "sanity";

import { STATS_BAND_DEFAULTS } from "../../../src/lib/caseStudyDefaults";
import { STATS_APPEARANCE_DEFAULTS } from "../../../src/lib/sanityAppearanceDefaults";

// §09 Impact — count-up metric band (Figma 2110:40267).
export const statsSection = defineType({
  name: "statsSection",
  title: "09 — Impact",
  type: "object",
  fields: [
    defineField({ name: "sectionTitle", title: "Section Heading", type: "string" }),
    defineField({
      name: "body",
      title: "Impact / Outcome Description",
      type: "portableText",
    }),
    defineField({
      name: "items",
      title: "Metric Items",
      type: "array",
      of: [{ type: "statItem" }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "metricGridGap",
      title: "Metric grid gap (px)",
      type: "number",
      initialValue: STATS_BAND_DEFAULTS.metricGridGap,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "metricGridGapDesktop",
      title: "Metric grid gap desktop (px)",
      type: "number",
      initialValue: STATS_BAND_DEFAULTS.metricGridGapDesktop,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "titleMarginBottom",
      title: "Title margin bottom (px)",
      type: "number",
      initialValue: STATS_BAND_DEFAULTS.titleMarginBottom,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "titleMarginBottomDesktop",
      title: "Title margin bottom desktop (px)",
      type: "number",
      initialValue: STATS_BAND_DEFAULTS.titleMarginBottomDesktop,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "bodyMarginBottom",
      title: "Body margin bottom (px)",
      type: "number",
      initialValue: STATS_BAND_DEFAULTS.bodyMarginBottom,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "appearance",
      type: "appearance",
      initialValue: STATS_APPEARANCE_DEFAULTS,
    }),
  ],
  preview: {
    select: { title: "sectionTitle", items: "items" },
    prepare: ({ title, items }) => ({
      title: title || "Stats",
      subtitle: `${items?.length || 0} metric(s)`,
    }),
  },
});
