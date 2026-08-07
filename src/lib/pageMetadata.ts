import type { Metadata } from "next";

export interface PageSeoInput {
  title?: string | null;
  description?: string | null;
  ogImage?: string | null;
  ogImageWidth?: number | null;
  ogImageHeight?: number | null;
  ogImageAlt?: string | null;
}

/** Merge page-level SEO over fallbacks (usually site defaults). */
export function pageMetadataFromSanity(
  seo: PageSeoInput | null | undefined,
  fallback: {
    title: string;
    description?: string;
    ogImage?: string;
    ogImageAlt?: string;
  },
): Metadata {
  const title = seo?.title?.trim() || fallback.title;
  const description = seo?.description?.trim() || fallback.description;
  const ogImage = seo?.ogImage?.trim() || fallback.ogImage;
  const ogAlt = seo?.ogImageAlt?.trim() || fallback.ogImageAlt || title;

  const meta: Metadata = { title };
  if (description) meta.description = description;

  if (ogImage || description) {
    meta.openGraph = {
      title,
      ...(description ? { description } : {}),
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                alt: ogAlt,
                ...(seo?.ogImageWidth && seo?.ogImageHeight
                  ? {
                      width: seo.ogImageWidth,
                      height: seo.ogImageHeight,
                    }
                  : {}),
              },
            ],
          }
        : {}),
    };
    meta.twitter = {
      card: "summary_large_image",
      title,
      ...(description ? { description } : {}),
      ...(ogImage ? { images: [ogImage] } : {}),
    };
  }

  return meta;
}
