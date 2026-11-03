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
      initialValue: "image",
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
      description:
        "Optional. External mp4, YouTube or Vimeo URL — use only if the video isn't uploaded below.",
      hidden: ({ parent }) => parent?.mediaType !== "video",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "videoFile",
      title: "Video file (upload)",
      type: "file",
      options: { accept: "video/*" },
      hidden: ({ parent }) => parent?.mediaType !== "video",
      // Error sits on the upload box (what editors use), not on the URL field.
      validation: (r) =>
        r.custom((val, ctx) => {
          const p = ctx.parent as { mediaType?: string; videoUrl?: string };
          if (p?.mediaType === "video" && !val && !p?.videoUrl)
            return "Upload a video file, or paste a video URL above.";
          return true;
        }),
    }),
    defineField({
      name: "posterImage",
      title: "Poster / static fallback",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType !== "video",
      description: "Shown while the video loads or when autoplay is unavailable.",
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
      description: "Prototype or iframe embed URL.",
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
