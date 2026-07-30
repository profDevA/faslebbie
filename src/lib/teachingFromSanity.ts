import type { SanityTeachingPage } from "@/sanity/types";
import { proseParagraphs, type ProseRun } from "@/lib/sanityProse";
import {
  exhibitionTiles as fallbackTiles,
  exhibitionTitle as fallbackTitle,
  students as fallbackStudents,
  teachingIntro,
  teachingSections,
  type ExhibitionTile,
  type StudentProject,
  type TeachSection,
  type TeachToken,
} from "@/lib/teaching";

export interface TeachingContentData {
  intro: TeachToken[][];
  sections: TeachSection[];
  students: StudentProject[];
  exhibitionTitle: string;
  exhibitionTiles: ExhibitionTile[];
}

function runToToken(run: ProseRun): TeachToken {
  const m = run.mark;
  if (m?._type === "pill") return { t: "pill", text: run.text };
  if (m?._type === "term") return { t: "term", text: run.text };
  if (m?._type === "ref")
    return { t: "student", id: m.targetId ?? "", text: run.text };
  if (m?._type === "action") {
    const kind = m.kind === "explore-exhibition" ? "exhibition" : "students";
    return { t: "action", kind, text: run.text };
  }
  return { t: "text", text: run.text };
}

const toTokens = (paras: ProseRun[][]): TeachToken[][] =>
  paras.map((runs) => runs.map(runToToken));

export function teachingFromSanity(
  data: SanityTeachingPage | null | undefined,
): TeachingContentData {
  const defaults: TeachingContentData = {
    intro: teachingIntro,
    sections: teachingSections,
    students: fallbackStudents,
    exhibitionTitle: fallbackTitle,
    exhibitionTiles: fallbackTiles,
  };
  if (!data) return defaults;

  const introTokens = toTokens(proseParagraphs(data.intro));
  const intro = introTokens.length ? introTokens : defaults.intro;

  const sections: TeachSection[] = data.sections?.length
    ? data.sections.map((s) => ({
        kicker: s.kicker ?? "",
        paragraphs: toTokens(proseParagraphs(s.body)),
        action: {
          kind: s.actionKind ?? "students",
          text: s.actionText ?? "See all student works",
        },
      }))
    : defaults.sections;

  const students: StudentProject[] = data.students?.length
    ? data.students.map((p, i) => ({
        id: p.id ?? `student-${i}`,
        title: p.title ?? "",
        headline: p.headline ?? "",
        description: p.description ?? "",
        span: p.span ?? "md",
        tint: p.tint ?? "#8f8a82",
        lightArt: p.lightArt,
        images: p.images?.filter(Boolean),
        slides: p.images?.length ? undefined : 4,
      }))
    : defaults.students;

  const exhibitionTitle =
    data.exhibitionTitle?.trim() || defaults.exhibitionTitle;

  const exhibitionTiles: ExhibitionTile[] = data.exhibitionTiles?.length
    ? data.exhibitionTiles.map((t) => ({
        tint: t.tint ?? "#8f8a82",
        image: t.image,
        label: t.label,
        span: t.span ?? "md",
        pos: {
          top: t.posTop ?? 10,
          left: t.posLeft ?? 10,
          w: t.posW ?? 11,
        },
      }))
    : defaults.exhibitionTiles;

  return { intro, sections, students, exhibitionTitle, exhibitionTiles };
}
