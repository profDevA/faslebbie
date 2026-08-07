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
        { type: "coreExperience" },
        { type: "mediaSection" },
        { type: "gallerySection" },
        { type: "showcaseGallery" },
        { type: "motionShowcase" },
        { type: "highlightReel" },
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
    // Fas 08/05: the project's before/after framing. Shown twice — under the
    // hero title line on the case study, and between the title and the credit
    // on the .img card — so it lives on the document, not in heroSection.
    defineField({
      name: "from",
      title: "From",
      type: "string",
      group: ["content", "card"],
      description: 'Where the project started, e.g. "Jargon".',
    }),
    defineField({
      name: "to",
      title: "To",
      type: "string",
      group: ["content", "card"],
      description: 'Where it landed, e.g. "Insightful".',
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
    // One entry per person. The card joins them ("A", "A & B", "A, B & C") so
    // an editor can't reproduce the punctuation Fas flagged on 08/05.
    defineField({
      name: "cardCreditNames",
      title: "Card credits",
      type: "array",
      group: "card",
      of: [{ type: "string" }],
      description: "One name per entry — the card handles the commas and the ampersand.",
    }),
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
      type: "pageSeo",
      group: "seo",
      options: { collapsible: true, collapsed: true },
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
