import { defineField, defineType } from "sanity";
import { pageSeoField } from "../objects/pageSeo";

// Singleton for the /about page: the bio itself, the reveal copy behind each
// grey keyword, and the CV / Resume / LinkedIn / Email links.
//
// Testimonials ("what people are saying") are NOT here — they're their own
// orderable document type, shared with the rest of the site.
export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  groups: [
    { name: "bio", title: "Bio", default: true },
    { name: "expansions", title: "Keyword expansions" },
    { name: "links", title: "Links" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description: 'Visible heading above the bio (e.g. "Designing for Transitions.").',
      group: "bio",
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "aboutProse",
      description: "Opening paragraph(s) below the headline, before the numbered bio sections.",
      group: "bio",
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "aboutProse",
      description:
        "One paragraph per block. Grey keywords expand; add their copy under Keyword expansions.",
      group: "bio",
    }),
    defineField({
      name: "expansions",
      title: "Keyword expansions",
      type: "array",
      of: [{ type: "aboutExpansion" }],
      description:
        "Reveal copy for each grey keyword, matched by the keyword's exact text.",
      group: "expansions",
    }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      group: "links",
      description:
        "Footer row: CV, Resume, LinkedIn, Email. For CV / Resume upload a PDF; for LinkedIn / Email use a URL or mailto.",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "pdf",
              title: "PDF file (upload)",
              type: "file",
              options: { accept: "application/pdf" },
              description:
                "Preferred for CV / Resume. When set, the site uses this file instead of the URL below.",
            },
            {
              name: "href",
              title: "URL or path",
              type: "string",
              description:
                "LinkedIn, mailto:, or a fallback PDF link if you skip the upload. e.g. https://linkedin.com/in/…, mailto:fas@…",
            },
            {
              name: "passwordProtected",
              title: "Password protected",
              type: "boolean",
              initialValue: false,
              description:
                "Turn on for CV / Resume. Uses the Site Settings → Access password.",
            },
          ],
          preview: {
            select: {
              title: "label",
              href: "href",
              pdf: "pdf.asset.originalFilename",
              locked: "passwordProtected",
            },
            prepare: ({ title, href, pdf, locked }) => ({
              title: title || "Link",
              subtitle: [
                locked ? "Locked" : null,
                pdf ? `PDF: ${pdf}` : href || "No URL or PDF",
              ]
                .filter(Boolean)
                .join(" · "),
            }),
          },
          validation: (Rule) =>
            Rule.custom((value: { href?: string; pdf?: { asset?: unknown } } | undefined) => {
              if (!value) return true;
              if (value.pdf?.asset || (value.href && value.href.trim())) return true;
              return "Add a PDF upload or a URL.";
            }),
        },
      ],
    }),
    pageSeoField,
  ],
  preview: { prepare: () => ({ title: "About Page" }) },
});
