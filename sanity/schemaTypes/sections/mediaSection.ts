import { defineField, defineType } from "sanity";

import { DESKTOP_MOTION_APPEARANCE_DEFAULTS } from "../../../src/lib/sanityAppearanceDefaults";

// Legacy — use desktopMotionShowcase (§08) or motionShowcase (§07).
export const mediaSection = defineType({
  name: "mediaSection",
  title: "Media / Product Demo (legacy)",
  type: "object",
  fields: [
    defineField({ name: "sectionTitle", title: "Section title", type: "string" }),
    defineField({ name: "body", title: "Body", type: "portableText" }),
    defineField({
      name: "items",
      title: "Media items",
      type: "array",
      of: [{ type: "mediaItem" }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "appearance",
      type: "appearance",
      initialValue: DESKTOP_MOTION_APPEARANCE_DEFAULTS,
    }),
  ],
  preview: {
    select: { title: "sectionTitle", items: "items" },
    prepare: ({ title, items }) => ({
      title: title || "Media",
      subtitle: `${items?.length || 0} item(s) · legacy`,
    }),
  },
});
