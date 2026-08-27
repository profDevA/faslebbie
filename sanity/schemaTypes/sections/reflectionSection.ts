import { defineField, defineType } from "sanity";

// 11 — Reflection / Next Steps (Figma 600:14126): one black narrative band.
export const reflectionSection = defineType({
  name: "reflectionSection",
  title: "11 — Reflection / Next Steps",
  type: "object",
  fields: [
    defineField({
      name: "reflectionHeading",
      title: "Reflection Heading",
      type: "string",
      initialValue: "Reflection",
    }),
    defineField({
      name: "reflectionBody",
      title: "Reflection / Outcome Description",
      type: "portableText",
    }),
    defineField({
      name: "nextStepsHeading",
      title: "Next Steps Heading",
      type: "string",
      initialValue: "Next Steps",
    }),
    defineField({
      name: "nextStepsItems",
      title: "Next Steps",
      type: "array",
      of: [{ type: "text", rows: 3 }],
      description: "Each item renders as a centered line (no bullet markers).",
    }),
    defineField({ name: "appearance", type: "appearance" }),
  ],
  validation: (Rule) =>
    Rule.custom((value) => {
      const v = value as {
        reflectionBody?: unknown[];
        nextStepsItems?: unknown[];
      };
      const hasReflection = (v?.reflectionBody?.length ?? 0) > 0;
      const hasSteps = (v?.nextStepsItems?.length ?? 0) > 0;
      if (!hasReflection && !hasSteps) {
        return "Add reflection copy and/or at least one next step.";
      }
      return true;
    }),
  preview: {
    select: {
      reflectionHeading: "reflectionHeading",
      nextStepsHeading: "nextStepsHeading",
      steps: "nextStepsItems",
    },
    prepare: ({ reflectionHeading, nextStepsHeading, steps }) => ({
      title: "Reflection / Next Steps",
      subtitle: [reflectionHeading, nextStepsHeading, steps?.length ? `${steps.length} step(s)` : null]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
