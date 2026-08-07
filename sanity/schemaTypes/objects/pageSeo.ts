import { defineField, defineType } from "sanity";

/** Shared SEO / social fields for page singletons + case studies. */
export const pageSeo = defineType({
  name: "pageSeo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Meta title",
      type: "string",
      description: "Browser tab + share title. Empty → page default.",
    }),
    defineField({
      name: "description",
      title: "Meta description",
      type: "text",
      rows: 2,
      description: "Empty → site description.",
    }),
    defineField({
      name: "ogImage",
      title: "Social image",
      type: "image",
      options: { hotspot: true },
      description: "Empty → site OG image.",
    }),
    defineField({
      name: "ogImageAlt",
      title: "Social image alt",
      type: "string",
    }),
  ],
});

/** Drop onto a document that has a `seo` group. */
export const pageSeoField = defineField({
  name: "seo",
  title: "SEO",
  type: "pageSeo",
  group: "seo",
  options: { collapsible: true, collapsed: true },
});
