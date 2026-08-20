import type { SanityTeachingPage } from "@/sanity/types";
import { proseParagraphs, type ProseRun } from "@/lib/sanityProse";
import type {
  ExhibitionTile,
  StudentProject,
  TeachSection,
  TeachToken,
} from "@/lib/teaching";
import { hiResUrl } from "@/sanity/image";

export interface TeachingContentData {
  intro: TeachToken[][];
  sections: TeachSection[];
  students: StudentProject[];
  studentsWorkIntro: string;
  exhibitionTitle: string;
  exhibitionHeading: string;
  exhibitionIntro: string;
  exhibitionCta: string;
  exhibitionTiles: ExhibitionTile[];
}

function runToToken(run: ProseRun): TeachToken {
  const m = run.mark;
  if (m?._type === "expandPill" || m?._type === "pill")
    return {
      t: "pill",
      text: run.text,
      ...(m._type === "expandPill" && m.expansion
        ? { expansion: m.expansion }
        : {}),
    };
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

const empty: TeachingContentData = {
  intro: [],
  sections: [],
  students: [],
  studentsWorkIntro: "",
  exhibitionTitle: "",
  exhibitionHeading: "",
  exhibitionIntro: "",
  exhibitionCta: "",
  exhibitionTiles: [],
};

/** Map the Sanity Teaching singleton. Empty Studio = empty UI. */
export function teachingFromSanity(
  data: SanityTeachingPage | null | undefined,
): TeachingContentData {
  if (!data) return empty;

  const intro = toTokens(proseParagraphs(data.intro));

  const sections: TeachSection[] = (data.sections ?? []).map((s) => ({
    kicker: s.kicker ?? "",
    paragraphs: toTokens(proseParagraphs(s.body)),
    action: {
      kind: s.actionKind ?? "students",
      text: s.actionText ?? "See all student works",
    },
  }));

  const students: StudentProject[] = (data.students ?? []).map((p, i) => {
    const raw = p.images?.filter((u): u is string => Boolean(u)) ?? [];
    const images = raw
      .map((u) => hiResUrl(u, 2400))
      .filter((u): u is string => Boolean(u));
    return {
      id: p.id ?? `student-${i}`,
      title: p.title ?? "",
      headline: p.headline ?? "",
      description: p.description ?? "",
      span: p.span ?? "md",
      tint: p.tint ?? "#8f8a82",
      lightArt: p.lightArt,
      images: images.length ? images : undefined,
      cover: hiResUrl(raw[0], 1200) ?? images[0],
    };
  });

  const exhibitionTitle = data.exhibitionTitle?.trim() ?? "";

  const exhibitionTiles: ExhibitionTile[] = (data.exhibitionTiles ?? []).map(
    (t) => ({
      tint: t.tint ?? "#8f8a82",
      image: t.image,
      label: t.label,
      span: t.span ?? "md",
      pos: {
        x: { anchor: t.posXAnchor ?? "left", pct: t.posX ?? 0 },
        y: { anchor: t.posYAnchor ?? "top", pct: t.posY ?? 0 },
      },
    }),
  );

  return {
    intro,
    sections,
    students,
    studentsWorkIntro: data.studentsWorkIntro?.trim() ?? "",
    exhibitionTitle,
    exhibitionHeading: data.exhibitionHeading?.trim() ?? "",
    exhibitionIntro: data.exhibitionIntro?.trim() ?? "",
    exhibitionCta: data.exhibitionCta?.trim() ?? "",
    exhibitionTiles,
  };
}
