import { defineQuery } from "next-sanity";

import { SANITY_IMAGE_PROJ } from "./image";

const img = SANITY_IMAGE_PROJ;

const appearanceProj = `appearance{
  backgroundColor, textColor, paddingTop, paddingBottom, contentAlignment, maxWidth
}`;

// Image fields keep crop/hotspot — resolveSanityImages() in fetch.ts applies them.
const sectionsProj = `sections[]{
  _type,
  _key,
  ${appearanceProj},
  _type == "heroSection" => {
    "image": image${img},
    "imageMobile": imageMobile${img},
    caption,
    headingOverride
  },
  _type == "overviewSection" => {
    sectionTitle, body, serviceCategoryLabel, serviceList, duration, team,
    confidentialityNote, ctaLabel, ctaUrl,
    "sideImage": sideImage${img},
    "sideVideo": sideVideo.asset->url,
    sideImageFit, sideImageBackgroundColor
  },
  _type == "accordionSection" => {
    variant, sectionTitle, sideTitle, sideBody, accordionBackgroundColor,
    items[]{ _key, title, body, defaultOpen }
  },
  _type == "proseSection" => { sectionTitle, body },
  _type == "problemContextSection" => {
    problemHeading, problemBody, broughtHeading, broughtBody, supportingCopy
  },
  _type == "reflectionSection" => {
    reflectionHeading, reflectionBody, nextStepsHeading, nextStepsItems
  },
  _type == "coreExperience" => {
    sectionTitle, body,
    "image": image${img},
    "imageMobile": imageMobile${img}
  },
  _type == "mediaSection" => {
    sectionTitle, body,
    items[]{
      _key, mediaType, videoUrl,
      "videoFile": videoFile.asset->url,
      "image": image${img},
      "posterImage": posterImage${img},
      embedUrl, caption
    }
  },
  _type == "desktopMotionShowcase" => {
    sectionTitle, body, caption, ctaLabel, ctaUrl,
    videoUrl,
    "videoFile": videoFile.asset->url,
    "posterImage": posterImage${img}
  },
  _type == "gallerySection" => {
    sectionTitle, body, useDeviceTabs, showCaptions, itemsBeforeViewMore, loadMoreLabel,
    tabs[]{ _key, label, items[]{ _key, "image": image${img}, caption } },
    items[]{ _key, "image": image${img}, caption }
  },
  _type == "showcaseGallery" => {
    sectionTitle, introBody, expandable,
    items[]{ _key, "image": image${img}, caption, "expandImage": expandImage${img} }
  },
  _type == "motionShowcase" => {
    sectionTitle, intro,
    rows[]{
      _key, device, label, caption,
      "posterImage": posterImage${img},
      items[]{
        _key, mediaType, videoUrl,
        "videoFile": videoFile.asset->url,
        "image": image${img},
        "posterImage": posterImage${img},
        embedUrl, caption
      }
    }
  },
  _type == "highlightReel" => {
    sectionTitle, layout,
    cells[]{
      _key, caption,
      "videoFile": videoFile.asset->url,
      videoUrl,
      "posterImage": posterImage${img},
      "frames": frames[]${img}
    }
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
  "image": cardThumbnail${img},
  "imageLqip": cardThumbnail.asset->metadata.lqip,
  "heroImage": sections[_type == "heroSection"][0].image${img},
  "creditNames": cardCreditNames,
  "tags": cardTags,
  accent,
  span,
  passwordProtected
`;

const studyPdfProj = `
  "fullCaseStudyPdfUrl": fullCaseStudyPdf.asset->url,
  fullCaseStudyLabel,
  fullCaseStudyIntro
`;

const seoProj = `seo{
  title, description, ogImageAlt,
  "ogImage": ogImage${img},
  "ogImageWidth": ogImage.asset->metadata.dimensions.width,
  "ogImageHeight": ogImage.asset->metadata.dimensions.height
}`;

// All studies with full section content, ordered — powers the /work grid + the
// in-page popup (which needs each study's full body ready without a round-trip).
export const ALL_STUDIES_QUERY = defineQuery(`*[_type == "caseStudy" && !(_id in path("drafts.**"))] | order(orderRank asc){
  ${cardProj},
  ${studyPdfProj},
  ${seoProj},
  ${sectionsProj}
}`);

// Lightweight card list (grid only / neighbours).
export const STUDY_CARDS_QUERY = defineQuery(`*[_type == "caseStudy" && !(_id in path("drafts.**"))] | order(orderRank asc){
  ${cardProj}
}`);

export const CATEGORIES_QUERY = defineQuery(`*[_type == "category"] | order(orderRank asc).title`);

export const WORK_PAGE_QUERY = defineQuery(`*[_type == "workPage"][0]{
  sectionTitle, intro, enableTextView, enableImageView,
  toolStackPerRow,
  toolStack[]{
    label,
    "src": logo${img},
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
  "homePortrait": homePortrait${img},
  "masterPortrait": masterPortrait${img},
  navItems[]{ label, href },
  mobileNavItems[]{ label, href },
  projectNavItems[]{ label, href },
  contactDrawerTitle, contactHeading, contactSubmitLabel,
  contactSuccessTitle, contactSuccessBody, contactSendAnotherLabel,
  "contactPortrait": contactPortrait${img},
  siteTitle, siteDescription, ogTitle, ogDescription, ogImageAlt,
  "favicon": favicon${img},
  "ogImage": ogImage${img},
  "ogImageWidth": ogImage.asset->metadata.dimensions.width,
  "ogImageHeight": ogImage.asset->metadata.dimensions.height
}`);

export const STUDY_SLUGS_QUERY = defineQuery(`*[_type == "caseStudy" && !(_id in path("drafts.**")) && defined(slug.current)].slug.current`);

const researchProseProj = `{
  ...,
  children[]{
    ...,
    _type == "aboutPhoto" => { "src": image${img}, alt }
  }
}`;

export const RESEARCH_PAGE_QUERY = defineQuery(`*[_type == "researchPage"][0]{
  areas[]{ kicker, "body": body[]${researchProseProj} },
  "closing": closing[]${researchProseProj},
  paradigms{ label, intro, "image": image${img}, items[]{ title, body } },
  principles{ label, intro, "image": image${img}, items[]{ title, body }, conclusionKicker, conclusionBody },
  modalities{ kicker, statement, items, groups[]{ title, items }, footnote },
  manifesto,
  fieldNotes[]{ place, quote, methodology, themes, insight, "image": image${img} },
  ${seoProj}
}`);

export const TEACHING_PAGE_QUERY = defineQuery(`*[_type == "teachingPage"][0]{
  intro,
  sections[]{ kicker, body, actionKind, actionText },
  students[]{
    id, title, headline, description, span, tint, lightArt,
    "images": images[]${img}
  },
  studentsWorkIntro,
  exhibitionTitle,
  exhibitionHeading,
  exhibitionIntro,
  exhibitionCta,
  exhibitionTiles[]{
    tint, label, span, posX, posXAnchor, posY, posYAnchor,
    "image": image${img}
  },
  ${seoProj}
}`);

export const BUILD_PAGE_QUERY = defineQuery(`*[_type == "buildPage"][0]{
  intro,
  projects[]{
    id, title, tech, span, tint, lightArt, kicker, subtitle, blurb,
    caseStudyDetail{
      statusLabel, trigger, observation, hypothesis, value, experiment, statusBody,
      checklist[]{ done, text },
      whoFor, howItWorks, insights
    },
    "images": images[]${img},
    "outputVisual": outputVisual${img},
    "conceptPreview": conceptPreview${img}
  },
  ${seoProj}
}`);

export const LEADERSHIP_PAGE_QUERY = defineQuery(`*[_type == "leadershipPage"][0]{
  sections[]{
    title,
    static,
    blocks[]{ subheading, body }
  },
  contactText,
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
    _type == "aboutPhoto" => { "src": image${img} }
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
  name, role, quote, "avatar": photo${img}
}`);

export const BLOGS_PAGE_QUERY = defineQuery(`*[_type == "blogsPage"][0]{
  posts[]{ slug, category, meta, title, kicker, description, body[]{
    ...,
    markDefs[]{ ... },
    _type == "image" => { "url": asset${img}, alt },
    _type == "blogBodyImage" => {
      "url": image${img},
      alt,
      caption,
      size,
      align
    },
    _type == "blogDivider" => { style },
    _type == "blogCodeBlock" => { language, filename, code },
    _type == "blogVideoEmbed" => { url, caption, aspect },
    _type == "blogCta" => { label, href, style, blank },
    _type == "blogPullQuote" => { quote, attribution, cite },
    _type == "blogTable" => {
      caption,
      headerRow,
      rows[]{ cells[] }
    },
    _type == "blogCallout" => {
      tone,
      title,
      body[]{ ..., markDefs[]{ ... } }
    }
  }, url, publishedAt, authorName, "authorAvatar": authorAvatar${img}, coverBg, panelBg, panelText, "cover": cover${img} },
  currentProjects[]{ title, tag, year, href, "cover": cover${img} },
  books[]{ title, tag, year, href, "cover": cover${img} },
  journals[]{ title, tag, year, href, "cover": cover${img} },
  mediaFeatured{
    title, listingBlurb, tag, comingSoonTitle, comingSoonBody,
    earlyAccessLabel, earlyAccessUrl,
    "heroImage": heroImage${img}
  },
  media[]{ slug, format, title, platform, year, source, detail, description, themes, video, "videoFile": videoFile.asset->url, "thumb": thumb${img} },
  ${seoProj}
}`);
