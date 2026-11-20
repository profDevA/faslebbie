"use client";

import PagePortrait, { PORTRAIT_STICKY_TOP } from "@/components/PagePortrait";
import StudentModal from "@/components/StudentModal";
import TeachingContent from "@/components/TeachingContent";
import TeachingGallery from "@/components/TeachingGallery";
import TeachingWatermark from "@/components/TeachingWatermark";
import ViewToggle from "@/components/ViewToggle";
import type { TeachingContentData } from "@/lib/teachingFromSanity";
import { LISTING_GRID, LISTING_SHELL, STICKY_UNDER_NAV } from "@/lib/navLayout";
import {
  contentDrift,
  portraitDrift,
  revealBlur,
  revealOpacity,
} from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";
import { useScrollTopOnMount } from "@/lib/useScrollTopOnMount";
import { useCallback, useEffect, useState } from "react";
import { EXTRA_STUDENT_IDS } from "@/lib/studentWorksLayout";
import { STUDENT_PROJECTS_PATH, studentProjectPath } from "@/lib/teachingPaths";

export type TeachingView = "philosophy" | "works";
type View = TeachingView;
const VIEWS = ["philosophy", "works"] as const;
/** ".works" reads ".student projects" (Fas, Nov 19 QA). */
const VIEW_LABELS = { works: "student projects" } as const;

// Clean addresses, no query string — see lib/teachingPaths.ts.
function pathFor(view: View, student?: string | null): string {
  if (student) return studentProjectPath(student);
  return view === "works" ? STUDENT_PROJECTS_PATH : "/teaching";
}

function stateFromPath(pathname: string): { view: View; student: string | null } {
  if (!pathname.startsWith(STUDENT_PROJECTS_PATH)) return { view: "philosophy", student: null };
  let seg: string | null =
    pathname.slice(STUDENT_PROJECTS_PATH.length + 1).split("/")[0] || null;
  try {
    seg = seg ? decodeURIComponent(seg) : null;
  } catch {
    /* keep raw */
  }
  return { view: "works", student: seg };
}

/** Address bar only — the App Router keeps usePathname in sync with the History API. */
function setAddress(path: string, push = false) {
  if (typeof window === "undefined" || window.location.pathname === path) return;
  window.history[push ? "pushState" : "replaceState"](null, "", path);
}

export default function TeachingBody({
  content,
  initialView = "philosophy",
  initialStudent = null,
}: {
  content: TeachingContentData;
  initialView?: View;
  initialStudent?: string | null;
}) {
  const { intro, sections, students } = content;

  useScrollTopOnMount();
  const [view, setViewState] = useState<View>(() =>
    initialStudent ? "works" : initialView,
  );
  const [studentId, setStudentId] = useState<string | null>(initialStudent);
  // "See All" is page state only now (no ?all=1); a student hidden behind it
  // opens the full grid.
  const [showAll, setShowAll] = useState(
    Boolean(initialStudent && EXTRA_STUDENT_IDS.has(initialStudent)),
  );
  const { r, pin } = useReveal(view === "philosophy");

  const opacity = revealOpacity(r);
  const blurPx = revealBlur(r);
  const blur = blurPx ? `blur(${blurPx}px)` : undefined;

  const setView = useCallback(
    (next: View) => {
      if (next === view) return;
      setViewState(next);
      setAddress(pathFor(next));
    },
    [view],
  );

  // Back / Forward: read the state back from the path.
  useEffect(() => {
    const syncFromBar = () => {
      const { view: v, student } = stateFromPath(window.location.pathname);
      setViewState(v);
      setStudentId(student);
      if (student && EXTRA_STUDENT_IDS.has(student)) setShowAll(true);
    };
    window.addEventListener("popstate", syncFromBar);
    return () => window.removeEventListener("popstate", syncFromBar);
  }, []);

  const switchView = (next: View) => {
    if (next === view) return;
    setView(next);
    window.scrollTo({ top: 0 });
  };

  const openId =
    studentId && students.some((s) => s.id === studentId) ? studentId : null;

  useEffect(() => {
    if (openId && view !== "works") setView("works");
  }, [openId, view, setView]);

  const seeAllStudents = () => {
    setViewState("works");
    setShowAll(true);
    setAddress(STUDENT_PROJECTS_PATH);
    window.scrollTo({ top: 0 });
  };

  // Opening a student pushes its address (Back closes the popup); Previous /
  // Next inside the popup replace it — same as Build and Research.
  const openStudent = (id: string) => {
    if (EXTRA_STUDENT_IDS.has(id)) setShowAll(true);
    const alreadyOpen = Boolean(studentId);
    setStudentId(id);
    setViewState("works");
    setAddress(pathFor("works", id), !alreadyOpen);
  };

  const closeStudent = () => {
    setStudentId(null);
    setAddress(STUDENT_PROJECTS_PATH);
  };

  const expandAll = () => setShowAll(true);
  const collapseAll = () => setShowAll(false);

  const viewToggle = (
    <ViewToggle views={VIEWS} labels={VIEW_LABELS} value={view} onChange={switchView} />
  );

  return (
    <div className="relative">
      <TeachingWatermark receded={view === "works"} />

      {view === "philosophy" ? (
        <>
          <div className={STICKY_UNDER_NAV}>
            <div
              style={{
                opacity,
                filter: blur,
                pointerEvents: r < 0.7 ? "none" : undefined,
              }}
              className="will-change-[opacity,filter]"
            >
              {viewToggle}
            </div>
            <main className={`relative z-10 ${LISTING_SHELL} ${LISTING_GRID} pb-12 pt-6 max-lg:pt-6 lg:pb-16 lg:pt-20`}>
              <div className={`flex flex-col lg:sticky lg:self-start ${PORTRAIT_STICKY_TOP}`}>
                <h1 className="sr-only">Teaching</h1>
                <PagePortrait
                  style={{ transform: portraitDrift(r) }}
                  className="relative z-10 will-change-transform"
                />
              </div>

              <div
                style={{
                  opacity,
                  filter: blur,
                  transform: contentDrift(r),
                  pointerEvents: r < 0.7 ? "none" : undefined,
                }}
                className="relative z-10 mt-12 will-change-[opacity,filter,transform] lg:mt-0"
              >
                <TeachingContent
                  className="pb-24"
                  intro={intro}
                  sections={sections}
                  materials={content.materials}
                  onSeeAllStudents={seeAllStudents}
                />
              </div>
            </main>
          </div>
          <div aria-hidden className="hidden lg:block" style={{ height: pin }} />
        </>
      ) : (
        <>
          {viewToggle}
          <main className="relative z-10 w-full pb-24 pt-6 max-lg:pt-6 lg:pt-12">
            <TeachingGallery
              students={students}
              onOpenStudent={openStudent}
              showAll={showAll}
              onExpandAll={expandAll}
              onCollapseAll={collapseAll}
            />
          </main>
        </>
      )}

      <StudentModal
        projects={students}
        openId={openId}
        onNavigate={openStudent}
        onClose={closeStudent}
      />
    </div>
  );
}
