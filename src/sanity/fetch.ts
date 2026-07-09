import "server-only";

import { client } from "./client";
import {
  ALL_STUDIES_QUERY,
  CATEGORIES_QUERY,
  STUDY_SLUGS_QUERY,
  WORK_PAGE_QUERY,
} from "./queries";
import type { Study, WorkPageConfig } from "./types";

const options = { next: { revalidate: 60, tags: ["caseStudy"] } };

export async function getAllStudies(): Promise<Study[]> {
  return client.fetch(ALL_STUDIES_QUERY, {}, options) as Promise<Study[]>;
}

export async function getCategories(): Promise<string[]> {
  return client.fetch(CATEGORIES_QUERY, {}, options) as Promise<string[]>;
}

export async function getWorkPage(): Promise<WorkPageConfig | null> {
  return client.fetch(WORK_PAGE_QUERY, {}, options) as Promise<WorkPageConfig | null>;
}

export async function getStudySlugs(): Promise<string[]> {
  return client.fetch(STUDY_SLUGS_QUERY, {}, options) as Promise<string[]>;
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
