import { defineQuery } from "next-sanity";

const appearanceProj = `appearance{
  backgroundColor, textColor, paddingTop, paddingBottom, contentAlignment, maxWidth
}`;

// Resolve every section variant's fields, turning asset refs into plain URLs so
// the renderer works with strings (matching the previous data model).
const sectionsProj = `sections[]{
  _type,
  _key,
  ${appearanceProj},
  _type == "heroSection" => {
    "image": image.asset->url,
    "imageMobile": imageMobile.asset->url,
    caption,
    headingOverride
  },
  _type == "overviewSection" => {
    sectionTitle, body, serviceCategoryLabel, serviceList, duration, team,
    confidentialityNote, ctaLabel, ctaUrl,
    "sideImage": sideImage.asset->url,
    sideImageBackgroundColor
  },
  _type == "accordionSection" => {
    variant, sectionTitle, sideTitle, sideBody, accordionBackgroundColor,
    items[]{ _key, title, body, defaultOpen }
  },
  _type == "proseSection" => { sectionTitle, body },
  _type == "mediaSection" => {
    sectionTitle, body,
    items[]{
      _key, mediaType, videoUrl,
      "videoFile": videoFile.asset->url,
      "image": image.asset->url,
      embedUrl, caption
    }
  },
  _type == "gallerySection" => {
    sectionTitle, body, useDeviceTabs, showCaptions, itemsBeforeViewMore, loadMoreLabel,
    tabs[]{ _key, label, items[]{ _key, "image": image.asset->url, caption } },
    items[]{ _key, "image": image.asset->url, caption }
  },
  _type == "showcaseGallery" => {
    sectionTitle, introBody,
    items[]{ _key, "image": image.asset->url, caption }
  },
  _type == "statsSection" => {
    sectionTitle, body, items[]{ _key, value, suffix, label, note }
  },
  _type == "bulletSection" => { sectionTitle, items }
}`;

const cardProj = `
  "slug": slug.current,
  "name": title,
  tagline,
  "categories": coalesce(categories[]->title, []),
  "image": cardThumbnail.asset->url,
  "imageLqip": cardThumbnail.asset->metadata.lqip,
  "heroImage": sections[_type == "heroSection"][0].image.asset->url,
  accent,
  span
`;

// All studies with full section content, ordered — powers the /work grid + the
// in-page popup (which needs each study's full body ready without a round-trip).
export const ALL_STUDIES_QUERY = defineQuery(`*[_type == "caseStudy"] | order(orderRank asc){
  ${cardProj},
  seo,
  ${sectionsProj}
}`);

// Lightweight card list (grid only / neighbours).
export const STUDY_CARDS_QUERY = defineQuery(`*[_type == "caseStudy"] | order(orderRank asc){
  ${cardProj}
}`);

export const CATEGORIES_QUERY = defineQuery(`*[_type == "category"] | order(orderRank asc).title`);

export const WORK_PAGE_QUERY = defineQuery(`*[_type == "workPage"][0]{
  sectionTitle, enableTextView, enableImageView, loadMoreLabel,
  ${appearanceProj}
}`);

export const STUDY_SLUGS_QUERY = defineQuery(`*[_type == "caseStudy" && defined(slug.current)].slug.current`);
