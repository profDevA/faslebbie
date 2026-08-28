import { defineField, defineType } from "sanity";

import { ACCORDION_PANEL_BACKGROUND } from "../../../src/lib/caseStudyDefaults";
import {
  ACCORDION_APPEARANCE_DEFAULTS,
  sanityColor,
} from "../../../src/lib/sanityAppearanceDefaults";

// Accordion band. Two variants:
//  - "centered": narrow centred accordion (What I Brought / My Role).
//  - "split": left side-copy (My Approach) + right accordion (Design Process).
// Live rule: 3–6 items.
export const accordionSection = defineType({
  name: "accordionSection",
  title: "Accordion",
  type: "object",
  fields: [
    defineField({
      name: "variant",
      title: "Layout",
      type: "string",
      initialValue: "centered",
      validation: (r) => r.required(),
      options: {
        list: [
          { title: "Centered", value: "centered" },
          { title: "Split with side copy", value: "split" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "sectionTitle",
      title: "Accordion title",
      type: "string",
      description: 'e.g. "What I Brought", "My Role", "Design Process".',
    }),
    defineField({
      name: "sideTitle",
      title: "Side title",
      type: "string",
      description: 'Split only — e.g. "My Approach".',
      hidden: ({ parent }) => parent?.variant !== "split",
    }),
    defineField({
      name: "sideBody",
      title: "Side body",
      type: "portableText",
      hidden: ({ parent }) => parent?.variant !== "split",
    }),
    defineField({
      name: "accordionBackgroundColor",
      title: "Accordion background color",
      type: "color",
      initialValue: sanityColor(ACCORDION_PANEL_BACKGROUND),
      options: { disableAlpha: false },
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [{ type: "accordionItem" }],
      validation: (r) => r.min(3).max(6),
    }),
    defineField({
      name: "appearance",
      type: "appearance",
      initialValue: ACCORDION_APPEARANCE_DEFAULTS,
    }),
  ],
  preview: {
    select: { title: "sectionTitle", variant: "variant", items: "items" },
    prepare: ({ title, variant, items }) => ({
      title: title || "Accordion",
      subtitle: `${variant || "centered"} · ${items?.length || 0} item(s)`,
    }),
  },
});
