import { defineField, defineType } from "sanity";

// One metric tile in §09 Impact (value + suffix + label + description).
export const statItem = defineType({
  name: "statItem",
  title: "Metric Item",
  type: "object",
  fields: [
    defineField({
      name: "value",
      title: "Metric Value",
      type: "number",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "prefix",
      title: "Value Prefix",
      type: "string",
      description: 'Prepended to value, e.g. "$"',
    }),
    defineField({
      name: "suffix",
      title: "Value Suffix",
      type: "string",
      description: 'Appended to value, e.g. "%", "M+", "pts"',
    }),
    defineField({
      name: "label",
      title: "Metric Label",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "note", title: "Metric Description", type: "string" }),
  ],
  preview: {
    select: { value: "value", prefix: "prefix", suffix: "suffix", label: "label" },
    prepare: ({ value, prefix, suffix, label }) => ({
      title: `${prefix ?? ""}${value ?? ""}${suffix || ""}`,
      subtitle: label,
    }),
  },
});
