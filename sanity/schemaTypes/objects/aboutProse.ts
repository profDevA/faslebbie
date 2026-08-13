import { defineArrayMember, defineType } from "sanity";

// The About bio, as Portable Text. Each BLOCK is one paragraph of the page.
//
// About needs more than the shared `interactiveProse` used by Teaching / Build /
// Leadership: alongside the grey click-to-expand keywords it has cycling `>/~`
// typer tags, inline brand-logo chips and an inline photo. Those three aren't
// annotations (they replace text rather than mark it), so they're modelled as
// INLINE OBJECTS in the block's `of` for logos and photos mid-sentence.
//
// Grey pills carry no copy here: their reveal text lives in the aboutPage
// document's `expansions` list, keyed by the pill's own words, so an expansion
// can itself be rich (nested pills) rather than a flat string.

/** Keys must stay in sync with `aboutLogos` in src/lib/content.ts. */
const LOGO_OPTIONS = [
  { title: "Carnegie Mellon University", value: "carnegie-mellon" },
  { title: "Parsons School of Design", value: "parsons" },
  { title: "University of Utah", value: "utah" },
  { title: "Franki", value: "frankl" },
  { title: "Meta", value: "meta" },
  { title: "Mastercard / Finicity", value: "mastercard" },
  { title: "PTC", value: "ptc" },
  { title: "Consumer Reports", value: "consumer-reports" },
  { title: "Western Digital / SanDisk", value: "western-digital" },
  { title: "MIT", value: "mit" },
];

export const aboutTyper = defineType({
  name: "aboutTyper",
  title: "Cycling tag (>/~)",
  type: "object",
  fields: [
    {
      name: "words",
      title: "Words",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Click-to-retype list. The first word is what shows on load.",
      validation: (r) => r.min(1),
    },
  ],
  preview: {
    select: { words: "words" },
    prepare: ({ words }: { words?: string[] }) => ({
      title: words?.[0] ?? "Cycling tag",
      subtitle: `>/~ ${words?.length ?? 0} words`,
    }),
  },
});

export const aboutLogo = defineType({
  name: "aboutLogo",
  title: "Brand logo chip",
  type: "object",
  fields: [
    {
      name: "name",
      title: "Logo",
      type: "string",
      options: { list: LOGO_OPTIONS },
      validation: (r) => r.required(),
    },
  ],
  preview: {
    select: { name: "name" },
    prepare: ({ name }: { name?: string }) => ({
      title:
        LOGO_OPTIONS.find((o) => o.value === name)?.title ?? name ?? "Logo",
    }),
  },
});

export const aboutPhoto = defineType({
  name: "aboutPhoto",
  title: "Inline photo",
  type: "object",
  fields: [
    { name: "image", title: "Photo", type: "image" },
    { name: "alt", title: "Alt text", type: "string" },
  ],
  preview: {
    select: { media: "image", alt: "alt" },
    prepare: ({ media, alt }: { media?: unknown; alt?: string }) => ({
      title: alt ?? "Inline photo",
      media: media as never,
    }),
  },
});

export const aboutProse = defineType({
  name: "aboutProse",
  title: "Bio",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [{ title: "Normal", value: "normal" }],
      lists: [],
      of: [
        { type: "aboutTyper" },
        { type: "aboutLogo" },
        { type: "aboutPhoto" },
      ],
      marks: {
        decorators: [],
        annotations: [
          {
            name: "pill",
            type: "object",
            title: "Grey keyword (click to expand)",
            description:
              "Add the reveal copy under Expansions, keyed by these exact words.",
            fields: [
              { name: "note", type: "string", title: "Note", hidden: true },
            ],
          },
          {
            name: "redKey",
            type: "object",
            title: "Red keyword (opens pop-up)",
            fields: [
              {
                name: "kind",
                type: "string",
                title: "Opens",
                options: {
                  list: [
                    { title: "Testimonials modal", value: "testimonials" },
                  ],
                },
                initialValue: "testimonials",
              },
            ],
          },
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [{ name: "href", type: "string", title: "URL or path" }],
          },
        ],
      },
    }),
  ],
});
