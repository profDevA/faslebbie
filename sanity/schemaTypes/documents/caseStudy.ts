import { defineField, defineType } from "sanity";
import { orderRankField } from "@sanity/orderable-document-list";

// The one flexible case-study template. Body is an ordered array of optional
// section blocks (the page builder). Card + SEO + design references live in
// their own field groups.
export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "card", title: "Card" },
    { name: "seo", title: "SEO" },
    { name: "refs", title: "References" },
  ],
  fields: [
    orderRankField({ type: "caseStudy" }),
    defineField({
      name: "title",
      title: "Project name",
      type: "string",
      group: ["content", "card"],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      group: "content",
      of: [
        { type: "heroSection" },
        { type: "overviewSection" },
        { type: "accordionSection" },
        { type: "proseSection" },
        { type: "mediaSection" },
        { type: "gallerySection" },
        { type: "showcaseGallery" },
        { type: "statsSection" },
        { type: "bulletSection" },
      ],
    }),

    // --- Card (work grid) ---
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "card",
      description: "One-line descriptor shown in the grid.",
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      group: "card",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    }),
    defineField({
      name: "cardThumbnail",
      title: "Card thumbnail",
      type: "image",
      group: "card",
      options: { hotspot: true },
    }),
    defineField({ name: "cardCredits", title: "Card credits", type: "string", group: "card" }),
    defineField({
      name: "cardTags",
      title: "Card tags",
      type: "array",
      group: "card",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "accent",
      title: "Accent color",
      type: "color",
      group: "card",
      options: { disableAlpha: false },
    }),
    defineField({
      name: "span",
      title: "Card height",
      type: "string",
      group: "card",
      initialValue: "md",
      options: {
        list: [
          { title: "Small", value: "sm" },
          { title: "Medium", value: "md" },
          { title: "Large", value: "lg" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),

    // --- SEO ---
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      group: "seo",
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: "title", title: "Meta title", type: "string" },
        { name: "description", title: "Meta description", type: "text", rows: 2 },
        { name: "ogImage", title: "Social image", type: "image" },
      ],
    }),

    // --- References ---
    defineField({
      name: "designRefs",
      title: "Design references (Figma, etc.)",
      type: "array",
      group: "refs",
      of: [{ type: "designRef" }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "tagline", media: "cardThumbnail" },
  },
});
