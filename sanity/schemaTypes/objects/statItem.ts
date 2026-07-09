import { defineField, defineType } from "sanity";

// A count-up metric tile in the Impact stats band.
export const statItem = defineType({
  name: "statItem",
  title: "Stat",
  type: "object",
  fields: [
    defineField({
      name: "value",
      title: "Value",
      type: "number",
      validation: (r) => r.required(),
    }),
    defineField({ name: "suffix", title: "Suffix", type: "string", description: 'e.g. "%", "M"' }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "note", title: "Note", type: "string" }),
  ],
  preview: {
    select: { value: "value", suffix: "suffix", label: "label" },
    prepare: ({ value, suffix, label }) => ({
      title: `${value ?? ""}${suffix || ""}`,
      subtitle: label,
    }),
  },
});
