import { defineField, defineType } from "sanity";

// Site Settings: brand (logo + portrait), nav, contact drawer, SEO / share.
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "brand", title: "Brand", default: true },
    { name: "nav", title: "Navigation" },
    { name: "contact", title: "Contact" },
    { name: "access", title: "Access" },
    { name: "seo", title: "SEO / Share" },
  ],
  fields: [
    defineField({
      name: "logoName",
      title: "Logo / wordmark name",
      type: "string",
      group: "brand",
      description: 'Nav + home watermark first line (e.g. "Fas lebbie").',
      initialValue: "Fas lebbie",
    }),
    defineField({
      name: "logoSuffix",
      title: "Logo / wordmark suffix",
      type: "string",
      group: "brand",
      description: 'Nav + home watermark second line (e.g. "Ph.D.").',
      initialValue: "Ph.D.",
    }),
    defineField({
      name: "masterPortrait",
      title: "Master portrait",
      type: "image",
      group: "brand",
      description:
        "One head/shoulders crop for Home, listing pages, and Contact (Figma 2218:75512).",
      options: { hotspot: true },
    }),
    defineField({
      name: "navItems",
      title: "Desktop nav",
      type: "array",
      of: [{ type: "navLink" }],
      group: "nav",
    }),
    defineField({
      name: "mobileNavItems",
      title: "Mobile nav",
      type: "array",
      of: [{ type: "navLink" }],
      group: "nav",
      description: "Order can differ from desktop (matches the Figma mobile menu).",
    }),
    defineField({
      name: "contactDrawerTitle",
      title: "Drawer title",
      type: "string",
      initialValue: "Contact",
      group: "contact",
    }),
    defineField({
      name: "contactHeading",
      title: "Form heading",
      type: "string",
      initialValue: "Drop Me a Line",
      group: "contact",
    }),
    defineField({
      name: "contactPortrait",
      title: "Contact portrait (optional override)",
      type: "image",
      group: "contact",
      description: "Leave empty to use Master portrait from Brand.",
    }),
    defineField({
      name: "contactSubmitLabel",
      title: "Submit button",
      type: "string",
      initialValue: "Send Message",
      group: "contact",
    }),
    defineField({
      name: "contactSuccessTitle",
      title: "Success title",
      type: "string",
      initialValue: "Thanks — your message is on its way.",
      group: "contact",
    }),
    defineField({
      name: "contactSuccessBody",
      title: "Success body",
      type: "string",
      initialValue: "Fas will get back to you at the email you provided.",
      group: "contact",
    }),
    defineField({
      name: "contactSendAnotherLabel",
      title: "Send-another label",
      type: "string",
      initialValue: "Send another",
      group: "contact",
    }),

    // --- Access (Fas 08/09: NDA case studies + CV/Resume soft gate) ---
    defineField({
      name: "accessPassword",
      title: "Access password",
      type: "string",
      group: "access",
      description:
        "Shared password for any case study or About link marked password-protected. Leave empty to turn the gate off (toggles stay, but visitors won't be asked).",
    }),

    // --- SEO / Share (browser tab + link previews) ---
    defineField({
      name: "siteTitle",
      title: "Site title",
      type: "string",
      group: "seo",
      description: "Browser tab title. Also used for Open Graph if OG title is empty.",
      initialValue: "Fas Lebbie, Ph.D.",
    }),
    defineField({
      name: "siteDescription",
      title: "Site description",
      type: "text",
      rows: 3,
      group: "seo",
      description: "Default meta description and OG description fallback.",
      initialValue:
        "Designer, researcher, educator — using design as a force for systems transition at scale.",
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      type: "image",
      group: "seo",
      description: "Tab icon (SVG or PNG). Falls back to /favicon.svg if empty.",
      options: { accept: "image/svg+xml,image/png,image/x-icon,image/webp" },
    }),
    defineField({
      name: "ogTitle",
      title: "OG title",
      type: "string",
      group: "seo",
      description: "Title when the site is shared. Empty → site title.",
    }),
    defineField({
      name: "ogDescription",
      title: "OG description",
      type: "text",
      rows: 3,
      group: "seo",
      description: "Description when the site is shared. Empty → site description.",
    }),
    defineField({
      name: "ogImage",
      title: "OG image",
      type: "image",
      group: "seo",
      description:
        "Social share image (link previews). Falls back to /portrait-master.png.",
      options: { hotspot: true },
    }),
    defineField({
      name: "ogImageAlt",
      title: "OG image alt",
      type: "string",
      group: "seo",
      initialValue: "Fas Lebbie",
    }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
