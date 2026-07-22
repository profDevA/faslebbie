import { defineField, defineType } from "sanity";

// One ".media" entry (Blogs & Media). Shows as a play-button card in the grid;
// opens a paged modal with the embed + details.
export const mediaEntry = defineType({
  name: "mediaEntry",
  title: "Media entry",
  type: "object",
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "format",
      title: "Format",
      type: "string",
      options: {
        list: ["Podcast", "Talk", "Interview", "Panel"],
      },
      initialValue: "Podcast",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "platform", title: "Platform", type: "string", description: 'e.g. "Spotify", "MIT Media Lab".' }),
    defineField({ name: "year", title: "Year", type: "string" }),
    defineField({
      name: "thumb",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
      description: "Optional card preview image (else a play placeholder).",
    }),
    defineField({
      name: "video",
      title: "Embed URL",
      type: "url",
      description: "Optional YouTube/Vimeo/Spotify embed URL for the modal.",
    }),
    defineField({ name: "source", title: "Source", type: "string", description: 'e.g. "The Design Leadership Podcast".' }),
    defineField({ name: "detail", title: "Detail line", type: "string", description: 'e.g. "Spotify • Episode 32 • 2024".' }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4 }),
    defineField({
      name: "themes",
      title: "Themes",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
  ],
  preview: { select: { title: "title", subtitle: "format" } },
});
