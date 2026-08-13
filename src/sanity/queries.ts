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
    "sideVideo": sideVideo.asset->url,
    sideImageFit, sideImageBackgroundColor
  },
  _type == "accordionSection" => {
    variant, sectionTitle, sideTitle, sideBody, accordionBackgroundColor,
    items[]{ _key, title, body, defaultOpen }
  },
  _type == "proseSection" => { sectionTitle, body },
  _type == "coreExperience" => {
    sectionTitle, body,
    "image": image.asset->url,
    "imageMobile": imageMobile.asset->url
  },
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
    sectionTitle, introBody, expandable,
    items[]{ _key, "image": image.asset->url, caption, "expandImage": expandImage.asset->url }
  },
  _type == "motionShowcase" => {
    sectionTitle, intro,
    rows[]{
      _key, device, label, caption,
      items[]{
        _key, mediaType, videoUrl,
        "videoFile": videoFile.asset->url,
        "image": image.asset->url,
        embedUrl, caption
      }
    }
  },
  _type == "highlightReel" => {
    sectionTitle, layout,
    cells[]{ _key, "frames": frames[].asset->url }
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
  from,
  to,
  "categories": coalesce(categories[]->title, []),
  "image": cardThumbnail.asset->url,
  "imageLqip": cardThumbnail.asset->metadata.lqip,
  "heroImage": sections[_type == "heroSection"][0].image.asset->url,
  "creditNames": cardCreditNames,
  "tags": cardTags,
  accent,
  span,
  passwordProtected
`;

const seoProj = `seo{
  title, description, ogImageAlt,
  "ogImage": ogImage.asset->url,
  "ogImageWidth": ogImage.asset->metadata.dimensions.width,
  "ogImageHeight": ogImage.asset->metadata.dimensions.height
}`;

// All studies with full section content, ordered — powers the /work grid + the
// in-page popup (which needs each study's full body ready without a round-trip).
export const ALL_STUDIES_QUERY = defineQuery(`*[_type == "caseStudy"] | order(orderRank asc){
  ${cardProj},
  ${seoProj},
  ${sectionsProj}
}`);

// Lightweight card list (grid only / neighbours).
export const STUDY_CARDS_QUERY = defineQuery(`*[_type == "caseStudy"] | order(orderRank asc){
  ${cardProj}
}`);

export const CATEGORIES_QUERY = defineQuery(`*[_type == "category"] | order(orderRank asc).title`);

export const WORK_PAGE_QUERY = defineQuery(`*[_type == "workPage"][0]{
  sectionTitle, intro, enableTextView, enableImageView,
  toolStackPerRow,
  toolStack[]{
    label,
    "src": logo.asset->url,
    "width": logo.asset->metadata.dimensions.width,
    "height": logo.asset->metadata.dimensions.height
  },
  ${appearanceProj},
  ${seoProj}
}`);

export const HOME_PAGE_QUERY = defineQuery(`*[_type == "homePage"][0]{
  hero, storyHref,
  ${seoProj}
}`);

export const SITE_SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings"][0]{
  logoName, logoSuffix,
  "homePortrait": homePortrait.asset->url,
  "masterPortrait": masterPortrait.asset->url,
  navItems[]{ label, href },
  mobileNavItems[]{ label, href },
  projectNavItems[]{ label, href },
  contactDrawerTitle, contactHeading, contactSubmitLabel,
  contactSuccessTitle, contactSuccessBody, contactSendAnotherLabel,
  "contactPortrait": contactPortrait.asset->url,
  siteTitle, siteDescription, ogTitle, ogDescription, ogImageAlt,
  "favicon": favicon.asset->url,
  "ogImage": ogImage.asset->url,
  "ogImageWidth": ogImage.asset->metadata.dimensions.width,
  "ogImageHeight": ogImage.asset->metadata.dimensions.height
}`);

export const STUDY_SLUGS_QUERY = defineQuery(`*[_type == "caseStudy" && defined(slug.current)].slug.current`);

export const RESEARCH_PAGE_QUERY = defineQuery(`*[_type == "researchPage"][0]{
  areas[]{ kicker, body },
  closing,
  paradigms{ label, intro, items[]{ title, body } },
  principles{ label, intro, items[]{ title, body }, conclusionKicker, conclusionBody },
  modalities{ kicker, statement, items, groups[]{ title, items }, footnote },
  manifesto,
  fieldNotes[]{ place, quote, methodology, themes, insight, "image": image.asset->url },
  ${seoProj}
}`);

export const TEACHING_PAGE_QUERY = defineQuery(`*[_type == "teachingPage"][0]{
  intro,
  sections[]{ kicker, body, actionKind, actionText },
  students[]{
    id, title, headline, description, span, tint, lightArt,
    "images": images[].asset->url
  },
  exhibitionTitle,
  exhibitionTiles[]{
    tint, label, span, posTop, posLeft, posW,
    "image": image.asset->url
  },
  ${seoProj}
}`);

export const BUILD_PAGE_QUERY = defineQuery(`*[_type == "buildPage"][0]{
  intro,
  projects[]{
    id, title, tech, span, tint, lightArt, kicker, subtitle, blurb,
    description, howItWorks, note, supportedTools,
    "images": images[].asset->url
  },
  ${seoProj}
}`);

export const LEADERSHIP_PAGE_QUERY = defineQuery(`*[_type == "leadershipPage"][0]{
  sections[]{
    title,
    static,
    blocks[]{ subheading, body }
  },
  intro, lead, closing, momentsHeading, exploreText, contactText,
  moments[]{ id, label, span, highlight, name, role, testimonial, "image": image.asset->url },
  ${seoProj}
}`);

// About's bio is Portable Text carrying INLINE objects (logo chips, cycling
// tags, a photo). Blocks come back raw, so the photo's asset ref has to be
// resolved to a URL inside `children` — hence the projection into the block's
// children rather than a flat field select.
const aboutProseProj = `{
  ...,
  children[]{
    ...,
    _type == "aboutPhoto" => { "src": image.asset->url }
  }
}`;

export const ABOUT_PAGE_QUERY = defineQuery(`*[_type == "aboutPage"][0]{
  headline,
  "intro": intro[]${aboutProseProj},
  "bio": bio[]${aboutProseProj},
  expansions[]{
    keyword,
    "body": body[]${aboutProseProj}
  },
  links[]{ label, href, passwordProtected, "pdfUrl": pdf.asset->url },
  ${seoProj}
}`);

// Server-only — never project `accessPassword` into client page props.
export const ACCESS_PASSWORD_QUERY = defineQuery(
  `*[_type == "siteSettings"][0]{ accessPassword }`,
);

// "What people are saying" testimonials, ordered — powers the About modal.
export const TESTIMONIALS_QUERY = defineQuery(`*[_type == "testimonial"] | order(orderRank asc){
  name, role, quote, "avatar": photo.asset->url
}`);

export const BLOGS_PAGE_QUERY = defineQuery(`*[_type == "blogsPage"][0]{
  posts[]{ slug, category, meta, title, kicker, description, body[]{ ..., _type == "image" => { "url": asset->url } }, url, coverBg, panelBg, panelText, "cover": cover.asset->url },
  media[]{ slug, format, title, platform, year, source, detail, description, themes, video, "thumb": thumb.asset->url },
  ${seoProj}
}`);
