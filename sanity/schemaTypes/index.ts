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

export const schemaTypes: SchemaTypeDefinition[] = [
  // documents
  caseStudy,
  category,
  workPage,
  researchPage,
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
];
