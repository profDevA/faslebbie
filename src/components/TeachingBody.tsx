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
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { EXTRA_STUDENT_IDS } from "@/lib/studentWorksLayout";

type View = "philosophy" | "works";
const VIEWS = ["philosophy", "works"] as const;

function resolveView(v: string | null | undefined): View {
  if (v === "works" || v === "img") return "works";
  return "philosophy";
}

function liveSearchParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export default function TeachingBody({
  content,
  initialView,
  initialStudent,
  initialAll,
}: {
  content: TeachingContentData;
  initialView?: string | null;
  initialStudent?: string | null;
  initialAll?: boolean;
}) {
  const { intro, sections, students } = content;

  const router = useRouter();
  const pathname = usePathname();
  const [view, setViewState] = useState<View>(() => {
    if (initialStudent || initialAll) return "works";
    return resolveView(initialView);
  });
  const [studentId, setStudentId] = useState<string | null>(
    initialStudent ?? null,
  );
  const [showAll, setShowAll] = useState(Boolean(initialAll));
  const { r, pin } = useReveal(view === "philosophy");

  const opacity = revealOpacity(r);
  const blurPx = revealBlur(r);
  const blur = blurPx ? `blur(${blurPx}px)` : undefined;

  const replaceQuery = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = liveSearchParams();
      mutate(params);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const setView = useCallback(
    (next: View) => {
      if (next === view) return;
      setViewState(next);
      replaceQuery((params) => params.set("view", next));
    },
    [replaceQuery, view],
  );

  useEffect(() => {
    const syncFromBar = () => {
      const params = liveSearchParams();
      setViewState(resolveView(params.get("view")));
      setStudentId(params.get("student"));
      setShowAll(params.get("all") === "1");
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
    replaceQuery((params) => {
      params.set("view", "works");
      params.set("all", "1");
    });
    window.scrollTo({ top: 0 });
  };

  const openStudent = (id: string) => {
    const expand = EXTRA_STUDENT_IDS.has(id);
    if (expand) setShowAll(true);
    setStudentId(id);
    setViewState("works");
    replaceQuery((params) => {
      params.set("view", "works");
      params.set("student", id);
      if (expand) params.set("all", "1");
    });
  };

  const closeStudent = () => {
    setStudentId(null);
    replaceQuery((params) => {
      params.delete("student");
    });
  };

  const expandAll = () => {
    setShowAll(true);
    replaceQuery((params) => {
      params.set("view", "works");
      params.set("all", "1");
    });
  };

  const collapseAll = () => {
    setShowAll(false);
    replaceQuery((params) => {
      params.set("view", "works");
      params.delete("all");
    });
  };

  const viewToggle = (
    <ViewToggle views={VIEWS} value={view} onChange={switchView} />
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
            <main className={`relative z-10 ${LISTING_SHELL} ${LISTING_GRID} pb-12 pt-8 lg:pb-16 lg:pt-20`}>
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
          <main className="relative z-10 w-full pb-24 pt-8 lg:pt-12">
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
        onClose={closeStudent}
      />
    </div>
  );
}
