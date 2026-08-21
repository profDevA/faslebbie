import { defineField, defineType } from "sanity";

export const blogCodeBlock = defineType({
  name: "blogCodeBlock",
  title: "Code block",
  type: "object",
  fields: [
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      initialValue: "text",
      options: {
        list: [
          { title: "Plain text", value: "text" },
          { title: "JavaScript", value: "javascript" },
          { title: "TypeScript", value: "typescript" },
          { title: "HTML", value: "html" },
          { title: "CSS", value: "css" },
          { title: "JSON", value: "json" },
          { title: "Python", value: "python" },
          { title: "Bash / Shell", value: "bash" },
          { title: "SQL", value: "sql" },
        ],
        layout: "dropdown",
      },
    }),
    defineField({
      name: "filename",
      title: "Filename (optional)",
      type: "string",
      description: "Shown above the block, e.g. config.ts",
    }),
    defineField({
      name: "code",
      title: "Code",
      type: "text",
      rows: 14,
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "filename", subtitle: "language", code: "code" },
    prepare({ title, subtitle, code }) {
      const snippet = (code as string | undefined)?.split("\n")[0]?.slice(0, 48);
      return {
        title: title || "Code block",
        subtitle: subtitle
          ? `${subtitle}${snippet ? ` · ${snippet}` : ""}`
          : snippet,
      };
    },
  },
});
