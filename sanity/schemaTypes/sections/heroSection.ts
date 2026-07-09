import { defineField, defineType } from "sanity";

// Hero band. Project name + tagline come from the document; this holds the
// hero art (and an optional mobile crop / caption / heading override).
export const heroSection = defineType({
  name: "heroSection",
  title: "Hero",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "imageMobile",
      title: "Hero image (mobile)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
    defineField({
      name: "headingOverride",
      title: "Heading override",
      type: "string",
      description: "Defaults to the project name if left blank.",
    }),
    defineField({ name: "appearance", type: "appearance" }),
  ],
  preview: {
    select: { media: "image", caption: "caption" },
    prepare: ({ media, caption }) => ({ title: "Hero", subtitle: caption, media }),
  },
});
