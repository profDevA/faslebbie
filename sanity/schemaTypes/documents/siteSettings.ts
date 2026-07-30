import { defineField, defineType } from "sanity";

// Global chrome: nav labels + contact drawer copy. One document for the whole site.
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "nav", title: "Navigation", default: true },
    { name: "contact", title: "Contact" },
  ],
  fields: [
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
      title: "Portrait",
      type: "image",
      group: "contact",
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
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
