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
import { designRef } from "./objects/designRef";
import { researchProse } from "./objects/researchProse";
import { researchArea } from "./objects/researchArea";
import { researchNumberedItem } from "./objects/researchNumberedItem";
import { researchModalityGroup } from "./objects/researchModalityGroup";
import { researchFieldNote } from "./objects/researchFieldNote";
import { researchParadigms } from "./objects/researchParadigms";
import { researchPrinciples } from "./objects/researchPrinciples";
import { researchModalities } from "./objects/researchModalities";
import { interactiveProse } from "./objects/interactiveProse";
import { studentProject } from "./objects/studentProject";
import { teachingSection } from "./objects/teachingSection";
import { buildProjectItem } from "./objects/buildProjectItem";
import { leadershipMoment } from "./objects/leadershipMoment";
import { blogPostItem } from "./objects/blogPostItem";
import { mediaEntry } from "./objects/mediaEntry";

// sections
import { heroSection } from "./sections/heroSection";
import { overviewSection } from "./sections/overviewSection";
import { accordionSection } from "./sections/accordionSection";
import { proseSection } from "./sections/proseSection";
import { mediaSection } from "./sections/mediaSection";
import { gallerySection } from "./sections/gallerySection";
import { showcaseGallery } from "./sections/showcaseGallery";
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

export const schemaTypes: SchemaTypeDefinition[] = [
  // documents
  caseStudy,
  category,
  workPage,
  researchPage,
  teachingPage,
  buildPage,
  leadershipPage,
  testimonial,
  blogsPage,
  // sections
  heroSection,
  overviewSection,
  accordionSection,
  proseSection,
  mediaSection,
  gallerySection,
  showcaseGallery,
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
  designRef,
  researchProse,
  researchArea,
  researchNumberedItem,
  researchModalityGroup,
  researchFieldNote,
  researchParadigms,
  researchPrinciples,
  researchModalities,
  interactiveProse,
  studentProject,
  teachingSection,
  buildProjectItem,
  leadershipMoment,
  blogPostItem,
  mediaEntry,
];
