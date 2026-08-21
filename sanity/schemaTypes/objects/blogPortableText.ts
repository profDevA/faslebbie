import { defineArrayMember, defineType } from "sanity";
import { blogTextBlockMember } from "./blogEditorShared";

/**
 * Blog modal article body — general-purpose editor.
 * + blocks: Image, Video, Code, Table, Callout, Pull quote, CTA, Divider.
 */
export const blogPortableText = defineType({
  name: "blogPortableText",
  title: "Blog article body",
  type: "array",
  of: [
    blogTextBlockMember(),
    defineArrayMember({ type: "blogBodyImage" }),
    defineArrayMember({ type: "blogVideoEmbed" }),
    defineArrayMember({ type: "blogCodeBlock" }),
    defineArrayMember({ type: "blogTable" }),
    defineArrayMember({ type: "blogCallout" }),
    defineArrayMember({ type: "blogPullQuote" }),
    defineArrayMember({ type: "blogCta" }),
    defineArrayMember({ type: "blogDivider" }),
    defineArrayMember({
      type: "image",
      title: "Image (legacy)",
      options: { hotspot: true },
    }),
  ],
});
