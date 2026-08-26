import "server-only";

import type { FilteredResponseQueryOptions } from "next-sanity";
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

/** Avoid crashing SSR when api.sanity.io is briefly unreachable (DNS / timeout). */
async function safeSanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  options?: FilteredResponseQueryOptions,
): Promise<T | null> {
  try {
    return (await client.fetch(query, params, options)) as T;
  } catch (err) {
    console.error("[sanity] fetch failed:", err);
    return null;
  }
}

export async function getAllStudies(): Promise<Study[]> {
  return (await safeSanityFetch<Study[]>(ALL_STUDIES_QUERY, {}, studyOptions)) ?? [];
}

export async function getCategories(): Promise<string[]> {
  return (await safeSanityFetch<string[]>(CATEGORIES_QUERY, {}, studyOptions)) ?? [];
}

export async function getWorkPage(): Promise<WorkPageConfig | null> {
  return safeSanityFetch<WorkPageConfig>(WORK_PAGE_QUERY, {}, workPageOptions);
}

export async function getStudySlugs(): Promise<string[]> {
  return (await safeSanityFetch<string[]>(STUDY_SLUGS_QUERY, {}, studyOptions)) ?? [];
}

export async function getResearchPage(): Promise<SanityResearchPage | null> {
  return safeSanityFetch<SanityResearchPage>(
    RESEARCH_PAGE_QUERY,
    {},
    { next: { revalidate: 60, tags: ["researchPage"] } },
  );
}

export async function getTeachingPage(): Promise<SanityTeachingPage | null> {
  return safeSanityFetch<SanityTeachingPage>(
    TEACHING_PAGE_QUERY,
    {},
    { next: { revalidate: 60, tags: ["teachingPage"] } },
  );
}

export async function getBuildPage(): Promise<SanityBuildPage | null> {
  return safeSanityFetch<SanityBuildPage>(
    BUILD_PAGE_QUERY,
    {},
    { next: { revalidate: 60, tags: ["buildPage"] } },
  );
}

export async function getAboutPage(): Promise<SanityAboutPage | null> {
  return safeSanityFetch<SanityAboutPage>(
    ABOUT_PAGE_QUERY,
    {},
    { next: { revalidate: 60, tags: ["aboutPage"] } },
  );
}

export async function getLeadershipPage(): Promise<SanityLeadershipPage | null> {
  return safeSanityFetch<SanityLeadershipPage>(
    LEADERSHIP_PAGE_QUERY,
    {},
    { next: { revalidate: 60, tags: ["leadershipPage"] } },
  );
}

export async function getBlogsPage(): Promise<SanityBlogsPage | null> {
  return safeSanityFetch<SanityBlogsPage>(
    BLOGS_PAGE_QUERY,
    {},
    { next: { revalidate: 60, tags: ["blogsPage"] } },
  );
}

export async function getTestimonials(): Promise<SanityTestimonial[]> {
  return (
    (await safeSanityFetch<SanityTestimonial[]>(
      TESTIMONIALS_QUERY,
      {},
      { next: { revalidate: 60, tags: ["testimonial"] } },
    )) ?? []
  );
}

export async function getHomePage(): Promise<SanityHomePage | null> {
  return safeSanityFetch<SanityHomePage>(
    HOME_PAGE_QUERY,
    {},
    { next: { revalidate: 60, tags: ["homePage"] } },
  );
}

export async function getSiteSettings(): Promise<SanitySiteSettings | null> {
  return safeSanityFetch<SanitySiteSettings>(
    SITE_SETTINGS_QUERY,
    {},
    { next: { revalidate: 60, tags: ["siteSettings"] } },
  );
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
