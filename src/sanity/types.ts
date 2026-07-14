import type { PortableTextBlock } from "@portabletext/types";

export interface SanityColor {
  hex: string;
  alpha?: number;
}

export type PaddingToken = "none" | "sm" | "md" | "lg" | "xl";
export type AlignToken = "left" | "center" | "right";
export type WidthToken = "narrow" | "default" | "wide" | "full";

export interface Appearance {
  backgroundColor?: SanityColor;
  textColor?: SanityColor;
  paddingTop?: PaddingToken;
  paddingBottom?: PaddingToken;
  contentAlignment?: AlignToken;
  maxWidth?: WidthToken;
}

export interface GalleryImage {
  _key: string;
  image?: string;
  caption?: string;
}

export interface DeviceTab {
  _key: string;
  label: string;
  items?: GalleryImage[];
}

export interface MediaItem {
  _key: string;
  mediaType: "video" | "image" | "prototype";
  videoUrl?: string;
  videoFile?: string;
  image?: string;
  embedUrl?: string;
  caption?: string;
}

export interface StatItem {
  _key: string;
  value: number;
  suffix?: string;
  label: string;
  note?: string;
}

export interface AccordionEntry {
  _key: string;
  title: string;
  body?: PortableTextBlock[];
  defaultOpen?: boolean;
}

interface Base {
  _key: string;
  appearance?: Appearance;
}

export type Section =
  | (Base & {
      _type: "heroSection";
      image?: string;
      imageMobile?: string;
      caption?: string;
      headingOverride?: string;
    })
  | (Base & {
      _type: "overviewSection";
      sectionTitle?: string;
      body?: PortableTextBlock[];
      serviceCategoryLabel?: string;
      serviceList?: string;
      duration?: string;
      team?: string;
      confidentialityNote?: string;
      ctaLabel?: string;
      ctaUrl?: string;
      sideImage?: string;
      sideImageBackgroundColor?: SanityColor;
    })
  | (Base & {
      _type: "accordionSection";
      variant: "centered" | "split";
      sectionTitle?: string;
      sideTitle?: string;
      sideBody?: PortableTextBlock[];
      accordionBackgroundColor?: SanityColor;
      items?: AccordionEntry[];
    })
  | (Base & {
      _type: "proseSection";
      sectionTitle?: string;
      body?: PortableTextBlock[];
    })
  | (Base & {
      _type: "mediaSection";
      sectionTitle?: string;
      body?: PortableTextBlock[];
      items?: MediaItem[];
    })
  | (Base & {
      _type: "gallerySection";
      sectionTitle?: string;
      body?: PortableTextBlock[];
      useDeviceTabs?: boolean;
      showCaptions?: boolean;
      itemsBeforeViewMore?: number;
      loadMoreLabel?: string;
      tabs?: DeviceTab[];
      items?: GalleryImage[];
    })
  | (Base & {
      _type: "showcaseGallery";
      sectionTitle?: string;
      introBody?: PortableTextBlock[];
      items?: GalleryImage[];
    })
  | (Base & {
      _type: "statsSection";
      sectionTitle?: string;
      body?: PortableTextBlock[];
      items?: StatItem[];
    })
  | (Base & {
      _type: "bulletSection";
      sectionTitle?: string;
      items?: string[];
    });

export interface StudyCard {
  slug: string;
  name: string;
  tagline?: string;
  categories: string[];
  image?: string;
  imageLqip?: string;
  heroImage?: string;
  accent?: SanityColor;
  span?: "sm" | "md" | "lg";
}

export interface Study extends StudyCard {
  seo?: { title?: string; description?: string };
  sections: Section[];
}

export interface WorkPageConfig {
  sectionTitle?: string;
  enableTextView?: boolean;
  enableImageView?: boolean;
  loadMoreLabel?: string;
  appearance?: Appearance;
}
