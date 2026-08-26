import type { Metadata } from "next";
import type { SanitySiteSettings } from "@/sanity/types";

const FALLBACK_TITLE = "Fas Lebbie, Ph.D.";
// Figma 2632:1680 share preview.
const FALLBACK_DESCRIPTION = "Designer · Researcher · Educator";
const FALLBACK_FAVICON = "/favicon.svg";
const FALLBACK_OG_IMAGE = "/og-share.png";
const FALLBACK_OG_ALT = "Fas Lebbie";
const FALLBACK_OG_WIDTH = 620;
const FALLBACK_OG_HEIGHT = 576;

function faviconMime(url: string): string {
  if (url.endsWith(".svg")) return "image/svg+xml";
  if (url.endsWith(".ico")) return "image/x-icon";
  return "image/png";
}

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
  const favicon = data?.favicon?.trim() || FALLBACK_FAVICON;
  const faviconType = faviconMime(favicon);

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
        { url: favicon, type: faviconType },
        {
          url: favicon,
          type: faviconType,
          media: "(prefers-color-scheme: light)",
        },
        {
          url: favicon,
          type: faviconType,
          media: "(prefers-color-scheme: dark)",
        },
      ],
      apple: [{ url: favicon, type: faviconType, sizes: "180x180" }],
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
