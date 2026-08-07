import type { Metadata } from "next";
import type { SanitySiteSettings } from "@/sanity/types";

const FALLBACK_TITLE = "Fas Lebbie, Ph.D.";
const FALLBACK_DESCRIPTION =
  "Designer, researcher, educator — using design as a force for systems transition at scale.";
const FALLBACK_FAVICON = "/favicon.svg";
const FALLBACK_OG_IMAGE = "/portrait-master.png";
const FALLBACK_OG_ALT = "Fas Lebbie";

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

  const ogImageEntry = {
    url: ogImage,
    alt: ogAlt,
    ...(data?.ogImageWidth && data?.ogImageHeight
      ? { width: data.ogImageWidth, height: data.ogImageHeight }
      : { width: 1111, height: 1000 }),
  };

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://faslebbie.com",
    ),
    title,
    description,
    icons: {
      icon: [{ url: favicon }],
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
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
