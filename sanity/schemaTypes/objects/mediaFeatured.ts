import { defineField, defineType } from "sanity";

/** Design Again podcast hero on `.media`. */
export const mediaFeatured = defineType({
  name: "mediaFeatured",
  title: "Featured media (podcast)",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Design Again Podcast",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "listingBlurb",
      title: "Listing blurb",
      type: "text",
      rows: 3,
      description: "Short copy under the hero on the `.media` tab.",
    }),
    defineField({
      name: "tag",
      title: "Tag line",
      type: "string",
      initialValue: "Podcast · Ongoing",
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      description: "Podcast artwork for the grid card and coming-soon popup.",
    }),
    defineField({
      name: "comingSoonTitle",
      title: "Popup heading",
      type: "string",
      initialValue: "Coming Soon",
    }),
    defineField({
      name: "comingSoonBody",
      title: "Popup body",
      type: "text",
      rows: 8,
    }),
    defineField({
      name: "earlyAccessLabel",
      title: "Early access label",
      type: "string",
      initialValue: "Get early access",
    }),
    defineField({
      name: "earlyAccessUrl",
      title: "Early access URL",
      type: "url",
      description: "Optional link for the popup CTA (e.g. Contact or signup form).",
    }),
  ],
  preview: {
    select: { title: "title", media: "heroImage" },
    prepare: ({ title, media }) => ({
      title: title ?? "Featured media",
      media,
    }),
  },
});
