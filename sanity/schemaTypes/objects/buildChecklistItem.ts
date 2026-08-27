import { defineField, defineType } from "sanity";

export const buildChecklistItem = defineType({
  name: "buildChecklistItem",
  title: "Checklist item",
  type: "object",
  fields: [
    defineField({ name: "done", title: "Done", type: "boolean", initialValue: false }),
    defineField({ name: "text", title: "Text", type: "string", validation: (r) => r.required() }),
  ],
  preview: {
    select: { title: "text", done: "done" },
    prepare({ title, done }) {
      return { title: `${done ? "✓" : "○"} ${title ?? ""}` };
    },
  },
});
