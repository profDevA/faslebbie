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
  expandImage?: string;
}

export interface MotionRow {
  _key: string;
  device?: "mobile" | "tablet" | "desktop";
  label?: string;
  caption?: string;
  items?: MediaItem[];
}

export interface HighlightCell {
  _key: string;
  frames?: string[];
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
      sideVideo?: string;
      sideImageFit?: "cover" | "contain";
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
      _type: "coreExperience";
      sectionTitle?: string;
      body?: PortableTextBlock[];
      image?: string;
      imageMobile?: string;
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
      expandable?: boolean;
      items?: GalleryImage[];
    })
  | (Base & {
      _type: "motionShowcase";
      sectionTitle?: string;
      intro?: PortableTextBlock[];
      rows?: MotionRow[];
    })
  | (Base & {
      _type: "highlightReel";
      sectionTitle?: string;
      layout?: "grid" | "single";
      cells?: HighlightCell[];
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
  /** Before/after framing — shown in the hero and on the .img card. */
  from?: string;
  to?: string;
  categories: string[];
  image?: string;
  imageLqip?: string;
  heroImage?: string;
  creditNames?: string[];
  tags?: string[];
  accent?: SanityColor;
  span?: "sm" | "md" | "lg";
  /** When true, Work opens the access password gate first (Fas 08/09). */
  passwordProtected?: boolean;
}

export interface SanityPageSeo {
  title?: string;
  description?: string;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageAlt?: string;
}

export interface Study extends StudyCard {
  seo?: SanityPageSeo;
  sections: Section[];
}

export interface WorkPageConfig {
  sectionTitle?: string;
  /** Work ".txt" narrative as Portable Text (workProse marks). */
  intro?: PortableTextBlock[];
  enableTextView?: boolean;
  enableImageView?: boolean;
  loadMoreLabel?: string;
  appearance?: Appearance;
  seo?: SanityPageSeo;
}

export interface SanityNavLink {
  label?: string;
  href?: string;
}

export interface SanityHomePage {
  hero?: PortableTextBlock[];
  storyHref?: string;
  seo?: SanityPageSeo;
}

export interface SanitySiteSettings {
  logoName?: string;
  logoSuffix?: string;
  masterPortrait?: string;
  navItems?: SanityNavLink[];
  mobileNavItems?: SanityNavLink[];
  contactDrawerTitle?: string;
  contactHeading?: string;
  contactPortrait?: string;
  contactSubmitLabel?: string;
  contactSuccessTitle?: string;
  contactSuccessBody?: string;
  contactSendAnotherLabel?: string;
  siteTitle?: string;
  siteDescription?: string;
  favicon?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageAlt?: string;
}

// --- Research page (raw Sanity shape) -------------------------------------
// Hero prose / closing / manifesto come back as Portable Text blocks; the
// interactive marks (highlight / sectionLink / link) live in each block's
// markDefs. `src/lib/researchFromSanity.ts` maps this into the render shapes.
export interface SanityResearchArea {
  kicker?: string;
  body?: PortableTextBlock[];
}

export interface SanityNumberedItem {
  title?: string;
  body?: string;
}

export interface SanityResearchPage {
  areas?: SanityResearchArea[];
  closing?: PortableTextBlock[];
  paradigms?: {
    label?: string;
    intro?: string;
    items?: SanityNumberedItem[];
  };
  principles?: {
    label?: string;
    intro?: string;
    items?: SanityNumberedItem[];
    conclusionKicker?: string;
    conclusionBody?: string;
  };
  modalities?: {
    kicker?: string;
    statement?: string;
    items?: string[];
    groups?: { title?: string; items?: string[] }[];
    footnote?: string;
  };
  manifesto?: PortableTextBlock[];
  fieldNotes?: {
    place?: string;
    quote?: string;
    methodology?: string;
    themes?: string;
    insight?: string;
    image?: string;
  }[];
  seo?: SanityPageSeo;
}

// --- Teaching / Build / Leadership (raw Sanity shapes) ---------------------
// Prose fields come back as Portable Text; the interactive marks (pill /
// expandPill / term / ref / action / link) live in each block's markDefs. The
// `lib/*FromSanity.ts` mappers turn these into each page's token dialect and
// fall back to the in-code copy when a field is empty.
export type SpanTier = "sm" | "md" | "lg";

export interface SanityStudentProject {
  id?: string;
  title?: string;
  headline?: string;
  description?: string;
  span?: SpanTier;
  tint?: string;
  lightArt?: boolean;
  images?: string[];
}

export interface SanityTeachingSection {
  kicker?: string;
  body?: PortableTextBlock[];
  actionKind?: "students" | "exhibition";
  actionText?: string;
}

export interface SanityExhibitionTile {
  tint?: string;
  image?: string;
  label?: string;
  span?: SpanTier;
  posTop?: number;
  posLeft?: number;
  posW?: number;
}

export interface SanityTeachingPage {
  intro?: PortableTextBlock[];
  sections?: SanityTeachingSection[];
  students?: SanityStudentProject[];
  exhibitionTitle?: string;
  exhibitionTiles?: SanityExhibitionTile[];
  seo?: SanityPageSeo;
}

export interface SanityBuildProject {
  id?: string;
  title?: string;
  tech?: string[];
  span?: SpanTier;
  tint?: string;
  lightArt?: boolean;
  kicker?: string;
  subtitle?: string;
  blurb?: string;
  description?: string;
  howItWorks?: string[];
  note?: string;
  supportedTools?: string[];
  images?: string[];
}

export interface SanityBuildPage {
  intro?: PortableTextBlock[];
  projects?: SanityBuildProject[];
  seo?: SanityPageSeo;
}

export interface SanityLeadershipMoment {
  id?: string;
  label?: string;
  span?: SpanTier;
  highlight?: boolean;
  name?: string;
  role?: string;
  testimonial?: string;
  image?: string;
}

export interface SanityLeadershipPage {
  intro?: PortableTextBlock[];
  lead?: PortableTextBlock[];
  closing?: PortableTextBlock[];
  momentsHeading?: string;
  exploreText?: string;
  contactText?: string;
  moments?: SanityLeadershipMoment[];
  seo?: SanityPageSeo;
}

export interface SanityAboutExpansion {
  keyword?: string;
  body?: PortableTextBlock[];
}

export interface SanityAboutLink {
  label?: string;
  href?: string;
  /** CDN URL when a PDF was uploaded on the About link (CV / Resume). */
  pdfUrl?: string | null;
  /** When true, About opens the access password gate before the link. */
  passwordProtected?: boolean;
}

export interface SanityAboutPage {
  bio?: PortableTextBlock[];
  expansions?: SanityAboutExpansion[];
  links?: SanityAboutLink[];
  seo?: SanityPageSeo;
}

export interface SanityTestimonial {
  name: string;
  role: string | null;
  quote: string;
  avatar: string | null;
}

export interface SanityBlogPostItem {
  slug?: string;
  category?: string;
  meta?: string;
  title?: string;
  kicker?: string;
  description?: string;
  body?: (PortableTextBlock | { _type: "image"; url?: string | null })[];
  url?: string;
  cover?: string | null;
  coverBg?: string;
  panelBg?: string;
  panelText?: string;
}

export interface SanityMediaEntry {
  slug?: string;
  format?: string;
  title?: string;
  platform?: string;
  year?: string;
  source?: string;
  detail?: string;
  description?: string;
  themes?: string[];
  video?: string | null;
  thumb?: string | null;
}

export interface SanityBlogsPage {
  posts?: SanityBlogPostItem[];
  media?: SanityMediaEntry[];
  seo?: SanityPageSeo;
}
