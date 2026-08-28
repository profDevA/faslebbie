import type { SchemaTypeDefinition } from "sanity";

// objects
import { appearance } from "./objects/appearance";
import { portableText } from "./objects/portableText";
import { accordionItem } from "./objects/accordionItem";
import { galleryItem } from "./objects/galleryItem";
import { deviceTab } from "./objects/deviceTab";
import { statItem } from "./objects/statItem";
import { showcaseItem } from "./objects/showcaseItem";
import { mediaItem } from "./objects/mediaItem";
import { highlightCell } from "./objects/highlightCell";
import { coreExperienceScreen } from "./objects/coreExperienceScreen";
import { motionRow } from "./objects/motionRow";
import { designRef } from "./objects/designRef";
import { researchProse } from "./objects/researchProse";
import { researchExpandProse } from "./objects/researchExpandProse";
import { researchArea } from "./objects/researchArea";
import { researchNumberedItem } from "./objects/researchNumberedItem";
import { researchModalityGroup } from "./objects/researchModalityGroup";
import { researchFieldNote } from "./objects/researchFieldNote";
import { researchParadigms } from "./objects/researchParadigms";
import { researchPrinciples } from "./objects/researchPrinciples";
import { researchModalities } from "./objects/researchModalities";
import { interactiveProse } from "./objects/interactiveProse";
import { workProse } from "./objects/workProse";
import { homeProse } from "./objects/homeProse";
import { navLink } from "./objects/navLink";
import { pageSeo } from "./objects/pageSeo";
import { exhibitionTile } from "./objects/exhibitionTile";
import {
  aboutLogo,
  aboutPhoto,
  aboutProse,
  aboutTyper,
} from "./objects/aboutProse";
import { approachSection } from "./objects/approachSection";
import { aboutExpansion } from "./objects/aboutExpansion";
import { studentProject } from "./objects/studentProject";
import { teachingSection } from "./objects/teachingSection";
import { buildChecklistItem } from "./objects/buildChecklistItem";
import { buildCaseStudyDetail } from "./objects/buildCaseStudyDetail";
import { buildProjectItem } from "./objects/buildProjectItem";
import { blogPostItem } from "./objects/blogPostItem";
import { blogPortableText } from "./objects/blogPortableText";
import { blogBodyImage } from "./objects/blogBodyImage";
import { blogDivider } from "./objects/blogDivider";
import { blogInlineBlocks, blogCallout } from "./objects/blogCallout";
import { blogCodeBlock } from "./objects/blogCodeBlock";
import { blogVideoEmbed } from "./objects/blogVideoEmbed";
import { blogTable, blogTableRow } from "./objects/blogTable";
import { blogCta } from "./objects/blogCta";
import { blogPullQuote } from "./objects/blogPullQuote";
import { mediaEntry } from "./objects/mediaEntry";
import { mediaFeatured } from "./objects/mediaFeatured";
import { publicationItem } from "./objects/publicationItem";
import { toolStackItem } from "./objects/toolStackItem";

// sections
import { heroSection } from "./sections/heroSection";
import { overviewSection } from "./sections/overviewSection";
import { accordionSection } from "./sections/accordionSection";
import { proseSection } from "./sections/proseSection";
import { problemContextSection } from "./sections/problemContextSection";
import { reflectionSection } from "./sections/reflectionSection";
import { coreExperience } from "./sections/coreExperience";
import { desktopMotionShowcase } from "./sections/desktopMotionShowcase";
import { mediaSection } from "./sections/mediaSection";
import { gallerySection } from "./sections/gallerySection";
import { showcaseGallery } from "./sections/showcaseGallery";
import { motionShowcase } from "./sections/motionShowcase";
import { highlightReel } from "./sections/highlightReel";
import { statsSection } from "./sections/statsSection";
import { bulletSection } from "./sections/bulletSection";

// documents
import { caseStudy } from "./documents/caseStudy";
import { category } from "./documents/category";
import { workPage } from "./documents/workPage";
import { researchPage } from "./documents/researchPage";
import { teachingPage } from "./documents/teachingPage";
import { buildPage } from "./documents/buildPage";
import { leadershipPage } from "./documents/leadershipPage";
import { testimonial } from "./documents/testimonial";
import { blogsPage } from "./documents/blogsPage";
import { aboutPage } from "./documents/aboutPage";
import { homePage } from "./documents/homePage";
import { siteSettings } from "./documents/siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  // documents
  caseStudy,
  category,
  homePage,
  workPage,
  researchPage,
  teachingPage,
  buildPage,
  leadershipPage,
  testimonial,
  blogsPage,
  aboutPage,
  siteSettings,
  // sections
  heroSection,
  overviewSection,
  accordionSection,
  proseSection,
  problemContextSection,
  reflectionSection,
  coreExperience,
  mediaSection,
  gallerySection,
  showcaseGallery,
  motionShowcase,
  desktopMotionShowcase,
  highlightReel,
  statsSection,
  bulletSection,
  // objects
  appearance,
  portableText,
  accordionItem,
  galleryItem,
  deviceTab,
  statItem,
  showcaseItem,
  mediaItem,
  highlightCell,
  coreExperienceScreen,
  motionRow,
  designRef,
  researchProse,
  researchExpandProse,
  researchArea,
  researchNumberedItem,
  researchModalityGroup,
  researchFieldNote,
  researchParadigms,
  researchPrinciples,
  researchModalities,
  interactiveProse,
  workProse,
  homeProse,
  navLink,
  pageSeo,
  exhibitionTile,
  aboutProse,
  aboutTyper,
  aboutLogo,
  aboutPhoto,
  aboutExpansion,
  approachSection,
  studentProject,
  teachingSection,
  buildChecklistItem,
  buildCaseStudyDetail,
  buildProjectItem,
  blogPortableText,
  blogInlineBlocks,
  blogBodyImage,
  blogDivider,
  blogCodeBlock,
  blogVideoEmbed,
  blogTable,
  blogTableRow,
  blogCallout,
  blogCta,
  blogPullQuote,
  blogPostItem,
  mediaEntry,
  mediaFeatured,
  publicationItem,
  toolStackItem,
];
