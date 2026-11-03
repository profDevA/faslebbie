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
    defineField({
      name: "imageHasGradient",
      title: "Images already include the dark gradient",
      type: "boolean",
      description:
        "Turn on when the desktop and mobile hero exports carry their own bottom gradient (Israel's Figma exports, Nov 2026). The site then skips its own dark wash under the caption.",
      initialValue: false,
    }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
    defineField({
      name: "headingOverride",
      title: "Heading override",
      type: "string",
      description: "Defaults to the project name if left blank.",
    }),
  ],
  preview: {
    select: { media: "image", caption: "caption" },
    prepare: ({ media, caption }) => ({ title: "Hero", subtitle: caption, media }),
  },
});
