import { defineField, defineType } from "sanity";

// One media entry for Blogs & Media. Shows as a play-button card in the grid.
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
      description:
        "Square thumbnail for the media grid. Without this the card shows as an empty play tile.",
    }),
    defineField({
      name: "video",
      title: "Embed URL",
      type: "url",
      description:
        "YouTube / Vimeo / Spotify URL (watch or embed link). Optional if a video file is uploaded. The file wins when both are set.",
    }),
    defineField({
      name: "videoFile",
      title: "Video file",
      type: "file",
      options: { accept: "video/*" },
      description:
        "Upload an mp4 (or similar) so the clip stays on this site even if the original URL is taken down.",
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
  preview: { select: { title: "title", subtitle: "format", media: "thumb" } },
});
