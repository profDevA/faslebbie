import { defineField, defineType } from "sanity";

import { INTERVENTION_GRID_APPEARANCE_DEFAULTS } from "../../../src/lib/sanityAppearanceDefaults";

/**
 * Design Assist — on-page intervention grid (Figma 3719:65044).
 * Title + intro, 2-column card grid, optional Read More expansion.
 */
export const interventionGrid = defineType({
  name: "interventionGrid",
  title: "Intervention Grid",
  type: "object",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section title",
      type: "string",
      initialValue: "Design Interventions",
    }),
    defineField({
      name: "introBody",
      title: "Intro body",
      type: "portableText",
    }),
    defineField({
      name: "items",
      title: "Intervention cards",
      type: "array",
      of: [{ type: "showcaseItem" }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "initialVisibleCount",
      title: "Cards before Load More",
      type: "number",
      initialValue: 6,
      validation: (r) => r.min(1).integer(),
    }),
    defineField({
      name: "readMoreLabel",
      title: "Load More label",
      type: "string",
      initialValue: "Load More",
    }),
    defineField({
      name: "appearance",
      type: "appearance",
      initialValue: INTERVENTION_GRID_APPEARANCE_DEFAULTS,
    }),
  ],
  preview: {
    select: { title: "sectionTitle", items: "items" },
    prepare: ({ title, items }) => ({
      title: title || "Intervention Grid",
      subtitle: `${items?.length || 0} card(s)`,
    }),
  },
});
