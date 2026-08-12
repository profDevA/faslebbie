import type { Metadata } from "next";
import type { SanitySiteSettings } from "@/sanity/types";

const FALLBACK_TITLE = "Fas Lebbie, Ph.D.";
// Figma 2632:1680 share preview.
const FALLBACK_DESCRIPTION = "Designer · Researcher · Educator";
const FALLBACK_FAVICON_LIGHT_SCHEME = "/favicon.png";
/** Figma 2632:1708 — cream circle for dark browser chrome. */
const FALLBACK_FAVICON_DARK_SCHEME = "/favicon-cream.png";
const FALLBACK_APPLE_ICON = "/apple-touch-icon.png";
const FALLBACK_OG_IMAGE = "/og-share.png";
const FALLBACK_OG_ALT = "Fas Lebbie";
const FALLBACK_OG_WIDTH = 620;
const FALLBACK_OG_HEIGHT = 576;

/** Build root metadata from Site Settings, with local fallbacks. */
export function siteMetadataFromSanity(
  data: SanitySiteSettings | null | undefined,
): Metadata {
  const title = data?.siteTitle?.trim() || FALLBACK_TITLE;
  const description = data?.siteDescription?.trim() || FALLBACK_DESCRIPTION;
  const ogTitle = data?.ogTitle?.trim() || title;
  const ogDescription = data?.ogDescription?.trim() || description;
  const ogImage = data?.ogImage?.trim() || FALLBACK_OG_IMAGE;
  const ogAlt = data?.ogImageAlt?.trim() || FALLBACK_OG_ALT;
  const faviconFromSanity = data?.favicon?.trim();
  const faviconLight =
    faviconFromSanity || FALLBACK_FAVICON_LIGHT_SCHEME;

  const ogImageEntry = {
    url: ogImage,
    alt: ogAlt,
    ...(data?.ogImageWidth && data?.ogImageHeight
      ? { width: data.ogImageWidth, height: data.ogImageHeight }
      : { width: FALLBACK_OG_WIDTH, height: FALLBACK_OG_HEIGHT }),
  };

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://faslebbie.com",
    ),
    title,
    description,
    icons: {
      icon: [
        { url: faviconLight, type: "image/png" },
        {
          url: faviconLight,
          type: "image/png",
          media: "(prefers-color-scheme: light)",
        },
        {
          url: FALLBACK_FAVICON_DARK_SCHEME,
          type: "image/png",
          media: "(prefers-color-scheme: dark)",
        },
      ],
      apple: [{ url: FALLBACK_APPLE_ICON, sizes: "180x180" }],
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      siteName: title,
      type: "website",
      images: [ogImageEntry],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
  };
}
