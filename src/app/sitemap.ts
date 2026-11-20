import type { MetadataRoute } from "next";

import { mediaFeaturedSlug } from "@/lib/blogs";
import { blogsFromSanity } from "@/lib/blogsFromSanity";
import { buildFromSanity } from "@/lib/buildFromSanity";
import { teachingFromSanity } from "@/lib/teachingFromSanity";
import { STUDENT_PROJECTS_PATH, studentProjectPath } from "@/lib/teachingPaths";
import { researchSectionOrder } from "@/lib/research";
import { researchFromSanity } from "@/lib/researchFromSanity";
import { SITE_URL } from "@/lib/siteUrl";
import { getBlogsPage, getBuildPage, getResearchPage, getSitemapStudies, getTeachingPage } from "@/sanity/fetch";

// /sitemap.xml — every page and every popup address, so search engines can
// find them (Fas, Nov 16 evening: "there's no URL for them so no one can find
// them… Google SEO… they were failing"). Built from Sanity, so new case
// studies, blog posts and talks appear on their own (refreshed every 60 s).
//
// Left out on purpose:
//  - password-protected case studies (NDA work; only open studies are listed)
//  (Build projects and student projects are listed since Nov 20 —
//  /build/<project> and /teaching/student-projects/<student> are real pages.)
//  - ?view= variants of listing pages (same page)

export const revalidate = 60;

const url = (path: string) => `${SITE_URL}${path}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [studies, blogsPage, researchPage, buildPage, teachingPage] = await Promise.all([
    getSitemapStudies(),
    getBlogsPage(),
    getResearchPage(),
    getBuildPage(),
    getTeachingPage(),
  ]);
  const blogs = blogsFromSanity(blogsPage);
  const research = researchFromSanity(researchPage);
  const buildProjects = buildFromSanity(buildPage).projects.map((p) => ({
    url: url(`/build/${encodeURIComponent(p.id)}`),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));
  const studentProjects = [
    { url: url(STUDENT_PROJECTS_PATH), changeFrequency: "monthly" as const, priority: 0.6 },
    ...teachingFromSanity(teachingPage).students.map((s) => ({
      url: url(studentProjectPath(s.id)),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];

  const pages: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    { url: url("/about"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/about/testimonials"), changeFrequency: "monthly", priority: 0.5 },
    { url: url("/work"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/build"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/approach"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/research"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/teaching"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/teaching/exhibition"), changeFrequency: "yearly", priority: 0.5 },
    { url: url("/blogs"), changeFrequency: "weekly", priority: 0.8 },
  ];

  const researchSections = researchSectionOrder
    .filter((id) => research.sections[id])
    .map((id) => ({ url: url(`/research/${id}`), changeFrequency: "yearly" as const, priority: 0.6 }));

  // Each field note: /research/field-notes/<n> (Nov 18).
  const fieldNotes = research.sections["field-notes"];
  const notes =
    fieldNotes?.kind === "field-notes"
      ? fieldNotes.notes.map((_, i) => ({
          url: url(`/research/field-notes/${i + 1}`),
          changeFrequency: "yearly" as const,
          priority: 0.5,
        }))
      : [];

  const caseStudies = studies
    .filter((s) => !s.passwordProtected)
    .map((s) => ({
      url: url(`/work/${encodeURIComponent(s.slug)}`),
      lastModified: s._updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const posts = blogs.posts.map((p) => ({
    url: url(`/blogs/${encodeURIComponent(p.slug)}`),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  const media = [
    ...(blogs.mediaFeatured ? [mediaFeaturedSlug(blogs.mediaFeatured)] : []),
    ...blogs.media.map((m) => m.slug),
  ]
    .filter(Boolean)
    .map((slug) => ({
      url: url(`/blogs/media/${encodeURIComponent(slug)}`),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    }));

  return [...pages, ...buildProjects, ...studentProjects, ...researchSections, ...notes, ...caseStudies, ...posts, ...media];
}
