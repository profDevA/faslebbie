import { defineField, defineType } from "sanity";
import { blogTextBlockMember } from "./blogEditorShared";

/** Text-only inset for callout boxes (no nested callouts/tables). */
export const blogInlineBlocks = defineType({
  name: "blogInlineBlocks",
  title: "Inset text",
  type: "array",
  of: [blogTextBlockMember()],
});

export const blogCallout = defineType({
  name: "blogCallout",
  title: "Callout",
  type: "object",
  fields: [
    defineField({
      name: "tone",
      title: "Type",
      type: "string",
      initialValue: "note",
      options: {
        list: [
          { title: "Note", value: "note" },
          { title: "Tip", value: "tip" },
          { title: "Important", value: "important" },
          { title: "Warning", value: "warning" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "title",
      title: "Title (optional)",
      type: "string",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blogInlineBlocks",
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { title: "title", tone: "tone" },
    prepare({ title, tone }) {
      const labels: Record<string, string> = {
        note: "Note",
        tip: "Tip",
        important: "Important",
        warning: "Warning",
      };
      return { title: title || labels[tone as string] || "Callout" };
    },
  },
});
