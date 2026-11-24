import { defineField, defineType } from "sanity";

// Site Settings: brand (logo + portrait), nav, contact drawer, intro video
// card, SEO / share.
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "brand", title: "Brand", default: true },
    { name: "nav", title: "Navigation" },
    { name: "contact", title: "Contact" },
    { name: "access", title: "Access" },
    { name: "introCard", title: "Intro video card" },
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
      name: "homePortrait",
      title: "Home portrait",
      type: "image",
      group: "brand",
      description:
        "Wider/shorter crop for Home + Contact. Listing pages use Master portrait.",
      options: { hotspot: true },
    }),
    defineField({
      name: "masterPortrait",
      title: "Master portrait (listing pages)",
      type: "image",
      group: "brand",
      description:
        "Tighter head/shoulders crop for About, Work, Research, etc.",
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
      description: "Order can differ from desktop.",
    }),
    defineField({
      name: "projectNavItems",
      title: "Projects dropdown",
      type: "array",
      of: [{ type: "navLink" }],
      group: "nav",
      description: "Case Studies + Build / Playground under the Projects menu.",
      initialValue: [
        { _type: "navLink", label: "Work", href: "/work" },
        { _type: "navLink", label: "Build / Playground", href: "/build" },
      ],
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
      description: "Leave empty to use Home portrait from Brand.",
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

    // --- Access ---
    defineField({
      name: "accessPassword",
      title: "Access password",
      type: "string",
      group: "access",
      description:
        "Shared password for any case study or About link marked password-protected. Leave empty to turn the gate off (toggles stay, but visitors won't be asked).",
    }),

    // --- Intro video card (Fas, Nov 23 call: "exactly like" horizonx.so) ---
    // Floating card at the bottom right of every page. It shows only when
    // both the video and the thumbnail are set.
    defineField({
      name: "introCardVideo",
      title: "Video",
      type: "file",
      group: "introCard",
      options: { accept: "video/mp4,video/webm" },
      description:
        "Your welcome video (MP4 or WebM). It plays inside the card, with sound, when a visitor presses play. The card shows only when this video and the thumbnail are both set.",
    }),
    defineField({
      name: "introCardThumbnail",
      title: "Thumbnail",
      type: "image",
      group: "introCard",
      options: { hotspot: true },
      description:
        "Shown before and after the video (16:9 landscape; the card crops other shapes around the hotspot). The white play button sits on top of it.",
    }),
    defineField({
      name: "introCardKicker",
      title: "Small line",
      type: "string",
      group: "introCard",
      description: 'Small grey line under the thumbnail (e.g. "New here?"). Optional.',
    }),
    defineField({
      name: "introCardText",
      title: "Short description",
      type: "text",
      rows: 2,
      group: "introCard",
      description:
        "One or two short lines in white under the small line. A line break here starts a new line on the card. Optional.",
    }),
    defineField({
      name: "introCardButtonLabel",
      title: "Button label",
      type: "string",
      group: "introCard",
      description:
        "Optional white pill button at the bottom of the card. It shows only when the label and the link are both set.",
    }),
    defineField({
      name: "introCardButtonHref",
      title: "Button link",
      type: "string",
      group: "introCard",
      description:
        'A page on this site ("/about") or a full web address ("https://…", opens in a new tab).',
    }),
    defineField({
      name: "introCardHidden",
      title: "Hide on site",
      type: "boolean",
      group: "introCard",
      initialValue: false,
      description:
        "On: the card is not shown anywhere, and everything above stays here so you can bring it back later.",
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
      initialValue: "Designer · Researcher · Educator",
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
        "Social share image (link previews). Falls back to /og-share.png.",
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
