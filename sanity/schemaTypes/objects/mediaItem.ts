import { defineField, defineType } from "sanity";

// A single media unit for the Product Demo / media band: a video (uploaded file
// or external URL), an image, or an interactive prototype embed.
export const mediaItem = defineType({
  name: "mediaItem",
  title: "Media item",
  type: "object",
  fields: [
    defineField({
      name: "mediaType",
      title: "Media type",
      type: "string",
      initialValue: "video",
      validation: (r) => r.required(),
      options: {
        list: [
          { title: "Video", value: "video" },
          { title: "Image", value: "image" },
          { title: "Interactive prototype", value: "prototype" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      description: "External mp4, YouTube or Vimeo URL.",
      hidden: ({ parent }) => parent?.mediaType !== "video",
      validation: (r) =>
        r.uri({ scheme: ["http", "https"] }).custom((val, ctx) => {
          const p = ctx.parent as { mediaType?: string; videoFile?: unknown };
          if (p?.mediaType === "video" && !val && !p?.videoFile)
            return "Provide a video URL or upload a file.";
          return true;
        }),
    }),
    defineField({
      name: "videoFile",
      title: "Video file (upload)",
      type: "file",
      options: { accept: "video/*" },
      hidden: ({ parent }) => parent?.mediaType !== "video",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType !== "image",
    }),
    defineField({
      name: "embedUrl",
      title: "Prototype embed URL",
      type: "url",
      description: "Figma prototype / iframe URL.",
      hidden: ({ parent }) => parent?.mediaType !== "prototype",
    }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
  ],
  preview: {
    select: { type: "mediaType", url: "videoUrl", caption: "caption", media: "image" },
    prepare: ({ type, url, caption, media }) => ({
      title: caption || (type ? type[0].toUpperCase() + type.slice(1) : "Media"),
      subtitle: url || undefined,
      media,
    }),
  },
});
