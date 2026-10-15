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
      options: { accept: "video/*,image/gif,.gif" },
      description:
        "Looping GIF (preferred) or MP4. Renders inside the mint plate with padding — not full-bleed.",
    }),
    defineField({
      name: "videoUrl",
      title: "Animation URL (optional)",
      type: "url",
      description: "External MP4, GIF, or hosted animation URL.",
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
      description:
        "Still only. Do not use this as a rotator — put the GIF/MP4 in Animation Asset.",
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
      const hasMotion = !!v?.videoFile || !!v?.videoUrl;
      const hasFrames = (v?.frames?.length ?? 0) > 0;
      if (!hasMotion && !hasFrames) {
        return "Add a GIF, MP4, URL, or at least one thumbnail image.";
      }
      return true;
    }),
  preview: {
    select: {
      caption: "caption",
      frames: "frames",
      poster: "posterImage",
      video: "videoFile",
      videoMime: "videoFile.asset.mimeType",
    },
    prepare: ({ caption, frames, poster, video, videoMime }) => ({
      title: caption || "Highlight item",
      subtitle: [
        video
          ? String(videoMime ?? "").includes("gif")
            ? "gif"
            : "mp4"
          : null,
        frames?.length ? `${frames.length} frame(s)` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      media: poster || frames?.[0],
    }),
  },
});
