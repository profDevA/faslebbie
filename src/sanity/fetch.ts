import "server-only";

import { buildFromSanity } from "@/lib/buildFromSanity";
import { teachingFromSanity } from "@/lib/teachingFromSanity";
import { client } from "./client";
import {
  ABOUT_PAGE_QUERY,
  ALL_STUDIES_QUERY,
  BLOGS_PAGE_QUERY,
  BUILD_PAGE_QUERY,
  CATEGORIES_QUERY,
  HOME_PAGE_QUERY,
  LEADERSHIP_PAGE_QUERY,
  RESEARCH_PAGE_QUERY,
  SITE_SETTINGS_QUERY,
  STUDY_SLUGS_QUERY,
  TEACHING_PAGE_QUERY,
  TESTIMONIALS_QUERY,
  WORK_PAGE_QUERY,
} from "./queries";
import type {
  SanityAboutPage,
  SanityBlogsPage,
  SanityBuildPage,
  SanityHomePage,
  SanityLeadershipPage,
  SanityResearchPage,
  SanitySiteSettings,
  SanityTeachingPage,
  SanityTestimonial,
  Study,
  WorkPageConfig,
} from "./types";

const studyOptions = { next: { revalidate: 60, tags: ["caseStudy"] } };
const workPageOptions = { next: { revalidate: 60, tags: ["workPage"] } };

export async function getAllStudies(): Promise<Study[]> {
  return client.fetch(ALL_STUDIES_QUERY, {}, studyOptions) as Promise<Study[]>;
}

export async function getCategories(): Promise<string[]> {
  return client.fetch(CATEGORIES_QUERY, {}, studyOptions) as Promise<string[]>;
}

export async function getWorkPage(): Promise<WorkPageConfig | null> {
  return client.fetch(WORK_PAGE_QUERY, {}, workPageOptions) as Promise<WorkPageConfig | null>;
}

export async function getStudySlugs(): Promise<string[]> {
  return client.fetch(STUDY_SLUGS_QUERY, {}, studyOptions) as Promise<string[]>;
}

export async function getResearchPage(): Promise<SanityResearchPage | null> {
  return client.fetch(
    RESEARCH_PAGE_QUERY,
    {},
    { next: { revalidate: 60, tags: ["researchPage"] } },
  ) as Promise<SanityResearchPage | null>;
}

export async function getTeachingPage(): Promise<SanityTeachingPage | null> {
  return client.fetch(
    TEACHING_PAGE_QUERY,
    {},
    { next: { revalidate: 60, tags: ["teachingPage"] } },
  ) as Promise<SanityTeachingPage | null>;
}

export async function getBuildPage(): Promise<SanityBuildPage | null> {
  return client.fetch(
    BUILD_PAGE_QUERY,
    {},
    { next: { revalidate: 60, tags: ["buildPage"] } },
  ) as Promise<SanityBuildPage | null>;
}

export async function getAboutPage(): Promise<SanityAboutPage | null> {
  return client.fetch(
    ABOUT_PAGE_QUERY,
    {},
    { next: { revalidate: 60, tags: ["aboutPage"] } },
  ) as Promise<SanityAboutPage | null>;
}

export async function getLeadershipPage(): Promise<SanityLeadershipPage | null> {
  return client.fetch(
    LEADERSHIP_PAGE_QUERY,
    {},
    { next: { revalidate: 60, tags: ["leadershipPage"] } },
  ) as Promise<SanityLeadershipPage | null>;
}

export async function getBlogsPage(): Promise<SanityBlogsPage | null> {
  return client.fetch(
    BLOGS_PAGE_QUERY,
    {},
    { next: { revalidate: 60, tags: ["blogsPage"] } },
  ) as Promise<SanityBlogsPage | null>;
}

export async function getTestimonials(): Promise<SanityTestimonial[]> {
  return client.fetch(
    TESTIMONIALS_QUERY,
    {},
    { next: { revalidate: 60, tags: ["testimonial"] } },
  ) as Promise<SanityTestimonial[]>;
}

export async function getHomePage(): Promise<SanityHomePage | null> {
  return client.fetch(
    HOME_PAGE_QUERY,
    {},
    { next: { revalidate: 60, tags: ["homePage"] } },
  ) as Promise<SanityHomePage | null>;
}

export async function getSiteSettings(): Promise<SanitySiteSettings | null> {
  return client.fetch(
    SITE_SETTINGS_QUERY,
    {},
    { next: { revalidate: 60, tags: ["siteSettings"] } },
  ) as Promise<SanitySiteSettings | null>;
}

/** Resolve a study + its wrap-around previous/next neighbours by slug. */
export async function findStudy(slug: string) {
  const studies = await getAllStudies();
  const i = studies.findIndex((s) => s.slug === slug);
  if (i === -1) return null;
  const n = studies.length;
  return {
    project: studies[i],
    prev: studies[(i - 1 + n) % n],
    next: studies[(i + 1) % n],
  };
}

export async function getStudentSlugs(): Promise<string[]> {
  const page = await getTeachingPage();
  return teachingFromSanity(page).students.map((s) => s.id);
}

export async function findStudent(id: string) {
  const page = await getTeachingPage();
  const { students } = teachingFromSanity(page);
  const i = students.findIndex((s) => s.id === id);
  if (i === -1) return null;
  const n = students.length;
  return {
    project: students[i],
    students,
    prev: students[(i - 1 + n) % n],
    next: students[(i + 1) % n],
  };
}

export async function getTeachingExhibition() {
  const page = await getTeachingPage();
  const data = teachingFromSanity(page);
  return {
    title: data.exhibitionTitle,
    heading: data.exhibitionHeading,
    intro: data.exhibitionIntro,
    cta: data.exhibitionCta,
    tiles: data.exhibitionTiles,
  };
}

export async function getBuildProjectSlugs(): Promise<string[]> {
  const page = await getBuildPage();
  return buildFromSanity(page).projects.map((p) => p.id);
}

export async function findBuildProject(id: string) {
  const page = await getBuildPage();
  const { projects } = buildFromSanity(page);
  const i = projects.findIndex((p) => p.id === id);
  if (i === -1) return null;
  const n = projects.length;
  return {
    project: projects[i],
    prev: projects[(i - 1 + n) % n],
    next: projects[(i + 1) % n],
  };
}
