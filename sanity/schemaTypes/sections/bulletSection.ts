import { defineField, defineType } from "sanity";

import { STATS_APPEARANCE_DEFAULTS } from "../../../src/lib/sanityAppearanceDefaults";

// Legacy — use reflectionSection for §11 Next Steps.
export const bulletSection = defineType({
  name: "bulletSection",
  title: "Bullet list / Next Steps (legacy)",
  type: "object",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section title",
      type: "string",
      initialValue: "Next Steps",
    }),
    defineField({
      name: "items",
      title: "Bullets",
      type: "array",
      of: [{ type: "text", rows: 2 }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "appearance",
      type: "appearance",
      initialValue: {
        ...STATS_APPEARANCE_DEFAULTS,
        contentGapInner: 20,
      },
    }),
  ],
  preview: {
    select: { title: "sectionTitle", items: "items" },
    prepare: ({ title, items }) => ({
      title: title || "Next Steps",
      subtitle: `${items?.length || 0} bullet(s) · legacy`,
    }),
  },
});
