import { defineField, defineType } from "sanity";

export const blogDivider = defineType({
  name: "blogDivider",
  title: "Divider",
  type: "object",
  fields: [
    defineField({
      name: "style",
      title: "Style",
      type: "string",
      initialValue: "line",
      options: {
        list: [
          { title: "Horizontal line", value: "line" },
          { title: "Extra space", value: "space" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
  ],
  preview: {
    select: { style: "style" },
    prepare({ style }: { style?: string }) {
      return {
        title: style === "space" ? "— Spacer —" : "— Divider —",
      };
    },
  },
});
