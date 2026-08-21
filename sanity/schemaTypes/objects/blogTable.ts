import { defineField, defineType } from "sanity";

const tableRow = defineType({
  name: "blogTableRow",
  title: "Row",
  type: "object",
  fields: [
    defineField({
      name: "cells",
      title: "Cells",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { cells: "cells" },
    prepare({ cells }) {
      const row = (cells as string[] | undefined)?.join(" · ");
      return { title: row || "Row" };
    },
  },
});

export const blogTable = defineType({
  name: "blogTable",
  title: "Table",
  type: "object",
  fields: [
    defineField({
      name: "caption",
      title: "Caption (optional)",
      type: "string",
    }),
    defineField({
      name: "headerRow",
      title: "First row is header",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "rows",
      title: "Rows",
      type: "array",
      of: [{ type: "blogTableRow" }],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { caption: "caption", rows: "rows" },
    prepare({ caption, rows }) {
      const count = (rows as unknown[] | undefined)?.length ?? 0;
      return {
        title: caption || "Table",
        subtitle: `${count} row${count === 1 ? "" : "s"}`,
      };
    },
  },
});

export { tableRow as blogTableRow };
