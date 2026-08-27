import { defineField, defineType } from "sanity";

// §10 — one highlight tile: video and/or cross-fading image frames.
export const highlightCell = defineType({
  name: "highlightCell",
  title: "Highlight Item",
  type: "object",
  fields: [
    defineField({
      name: "videoFile",
      title: "Highlight Reel / Animation Asset",
      type: "file",
      options: { accept: "video/*" },
      description: "Looping animation or video for this highlight.",
    }),
    defineField({
      name: "videoUrl",
      title: "Animation URL (optional)",
      type: "url",
      description: "External mp4 or hosted animation URL.",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "posterImage",
      title: "Poster / Static Fallback",
      type: "image",
      options: { hotspot: true },
      description: "Shown while the animation loads or when video autoplay is unavailable.",
    }),
    defineField({
      name: "frames",
      title: "Optional Image / Thumbnail Grid",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description: "Static images or cross-fade loop when no video is set.",
    }),
    defineField({
      name: "caption",
      title: "Caption / Description",
      type: "string",
    }),
  ],
  validation: (Rule) =>
    Rule.custom((value) => {
      const v = value as {
        videoFile?: unknown;
        videoUrl?: string;
        frames?: unknown[];
      };
      const hasVideo = !!v?.videoFile || !!v?.videoUrl;
      const hasFrames = (v?.frames?.length ?? 0) > 0;
      if (!hasVideo && !hasFrames) {
        return "Add an animation asset or at least one thumbnail image.";
      }
      return true;
    }),
  preview: {
    select: {
      caption: "caption",
      frames: "frames",
      poster: "posterImage",
      video: "videoFile",
    },
    prepare: ({ caption, frames, poster, video }) => ({
      title: caption || "Highlight item",
      subtitle: [
        video ? "video" : null,
        frames?.length ? `${frames.length} frame(s)` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      media: poster || frames?.[0],
    }),
  },
});
