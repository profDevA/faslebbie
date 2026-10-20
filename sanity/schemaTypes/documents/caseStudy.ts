import { defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

// The one flexible case-study template. Body is an ordered array of optional
// section blocks (the page builder). Card + SEO + design references live in
// their own field groups.
export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  orderings: [orderRankOrdering],
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
      name: "passwordProtected",
      title: "Password protected",
      type: "boolean",
      group: "content",
      initialValue: false,
      description:
        "When on, visitors must enter the Site Settings → Access password before opening this case study.",
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      group: "content",
      of: [
        { type: "heroSection" },
        { type: "overviewSection" },
        { type: "problemContextSection" },
        { type: "coreExperience" },
        { type: "accordionSection" },
        { type: "showcaseGallery" },
        { type: "interventionCarousel" },
        { type: "interventionGrid" },
        { type: "motionShowcase" },
        { type: "desktopMotionShowcase" },
        { type: "statsSection" },
        { type: "highlightReel" },
        { type: "reflectionSection" },
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
      name: "from",
      title: "From",
      type: "string",
      group: ["content", "card"],
      description: 'Where the project started, e.g. "Jargon". Shown on the hero and Work card.',
    }),
    defineField({
      name: "to",
      title: "To",
      type: "string",
      group: ["content", "card"],
      description: 'Where it landed, e.g. "Insightful". Shown on the hero and Work card.',
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
      options: {
        hotspot: true,
        accept: "image/gif,image/jpeg,image/png,image/webp,.gif",
      },
      description:
        "Work `.img` grid cover. Still (PNG/JPG/WebP, ≥1200px) or an animated GIF — GIFs play on the wall. Do not crop or set a hotspot on GIFs; that flattens them to the first frame.",
    }),
    defineField({
      name: "cardThumbnailMotion",
      title: "Card motion (GIF or MP4)",
      type: "file",
      group: "card",
      options: { accept: "image/gif,.gif,video/mp4,video/webm,video/quicktime" },
      description:
        "Optional looping GIF or MP4. When set, this plays on the Work `.img` card instead of the still. Use this for Jitter MP4 exports — the image field cannot hold video.",
    }),
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
      title: "Design references",
      type: "array",
      group: "refs",
      of: [{ type: "designRef" }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "tagline", media: "cardThumbnail" },
  },
});
