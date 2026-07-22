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
  "credit": cardCredits,
  "tags": cardTags,
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

export const RESEARCH_PAGE_QUERY = defineQuery(`*[_type == "researchPage"][0]{
  areas[]{ kicker, body },
  closing,
  paradigms{ label, intro, items[]{ title, body } },
  principles{ label, intro, items[]{ title, body }, conclusionKicker, conclusionBody },
  modalities{ kicker, statement, items, groups[]{ title, items }, footnote },
  manifesto,
  fieldNotes[]{ place, quote, methodology, themes, insight, "image": image.asset->url }
}`);

export const TEACHING_PAGE_QUERY = defineQuery(`*[_type == "teachingPage"][0]{
  intro,
  sections[]{ kicker, body, actionKind, actionText },
  students[]{
    id, title, headline, description, span, tint, lightArt,
    "images": images[].asset->url
  }
}`);

export const BUILD_PAGE_QUERY = defineQuery(`*[_type == "buildPage"][0]{
  intro,
  projects[]{
    id, title, tech, span, tint, lightArt, kicker, subtitle, blurb,
    description, howItWorks, note, supportedTools,
    "images": images[].asset->url
  }
}`);

export const LEADERSHIP_PAGE_QUERY = defineQuery(`*[_type == "leadershipPage"][0]{
  intro, lead, closing, momentsHeading, exploreText, contactText,
  moments[]{ id, label, span, highlight, name, role, testimonial, "image": image.asset->url }
}`);

// "What people are saying" testimonials, ordered — powers the About modal.
export const TESTIMONIALS_QUERY = defineQuery(`*[_type == "testimonial"] | order(orderRank asc){
  name, role, quote, "avatar": photo.asset->url
}`);

export const BLOGS_PAGE_QUERY = defineQuery(`*[_type == "blogsPage"][0]{
  posts[]{ slug, category, meta, title, kicker, description, body[]{ ..., _type == "image" => { "url": asset->url } }, url, coverBg, panelBg, panelText, "cover": cover.asset->url },
  media[]{ slug, format, title, platform, year, source, detail, description, themes, video, "thumb": thumb.asset->url }
}`);
