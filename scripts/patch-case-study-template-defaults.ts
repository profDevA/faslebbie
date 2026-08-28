/**
 * Prefill remaining Coral template defaults on case studies:
 * - Overview horizontal padding, column gap, side panel teal
 * - Reflection band #171717 (fixes migration #000000)
 * - Accordion panel white
 * - Core Experience screen aspect sizes
 * - Problem Context page appearance (page-template slugs)
 * - Motion mediaItem type → image when only stills uploaded
 * - Highlight reel grid/single matte colors + insets
 * - Core Experience per-screen card appearance (white tile)
 * - Stats metric grid gaps + title/body margins
 * - Showcase artifact slider gap
 * - Motion showcase band + row layout defaults
 * - Legacy section appearance (prose / bullet / media)
 * - Work page appearance shell
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-case-study-template-defaults.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-case-study-template-defaults.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

import {
  ACCORDION_PANEL_BACKGROUND,
  CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS,
  CORE_EXPERIENCE_BAND_MOBILE_DEFAULTS,
  CORE_EXPERIENCE_SCREEN_APPEARANCE,
  HIGHLIGHT_REEL_GRID_DEFAULTS,
  HIGHLIGHT_REEL_SINGLE_DEFAULTS,
  MOTION_ROW_DEFAULTS,
  MOTION_SHOWCASE_BAND_DEFAULTS,
  OVERVIEW_COLUMN_GAP,
  OVERVIEW_COPY_COLUMN_PAD,
  OVERVIEW_COPY_COLUMN_PAD_PAGE,
  OVERVIEW_MEDIA_COLUMN_PAD,
  OVERVIEW_MEDIA_COLUMN_PAD_PAGE,
  OVERVIEW_SIDE_TEAL,
  PAGE_TEMPLATE_SLUGS,
  REFLECTION_DEFAULTS,
  SHOWCASE_ARTIFACT_DEFAULTS,
  STATS_BAND_DEFAULTS,
  WORK_PAGE_APPEARANCE_DEFAULTS,
} from "../src/lib/caseStudyDefaults";
import {
  PROBLEM_CONTEXT_PAGE_APPEARANCE_DEFAULTS,
  REFLECTION_APPEARANCE_DEFAULTS,
  SECTION_APPEARANCE_DEFAULTS,
  mergeAppearanceDefaults,
  sanityColor,
} from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const slugArg = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];

type Section = Record<string, unknown> & { _key: string; _type: string };

function isUnset(v: unknown): v is null | undefined {
  return v === null || v === undefined;
}

function hexOf(color: unknown): string | undefined {
  if (!color || typeof color !== "object") return undefined;
  const hex = (color as { hex?: string }).hex;
  return typeof hex === "string" ? hex.toLowerCase() : undefined;
}

function patchOverview(section: Section, notes: string[]) {
  const next = { ...section };
  const set = (key: string, value: unknown) => {
    if (!isUnset(next[key])) return;
    next[key] = value;
    notes.push(`${key}→${value}`);
  };

  set("copyPaddingTop", OVERVIEW_COPY_COLUMN_PAD.paddingTop);
  set("copyPaddingBottom", OVERVIEW_COPY_COLUMN_PAD.paddingBottom);
  set("copyPaddingLeft", OVERVIEW_COPY_COLUMN_PAD_PAGE.paddingLeft);
  set("copyPaddingRight", OVERVIEW_COPY_COLUMN_PAD_PAGE.paddingRight);
  set("mediaPaddingTop", OVERVIEW_MEDIA_COLUMN_PAD.paddingTop);
  set("mediaPaddingBottom", OVERVIEW_MEDIA_COLUMN_PAD.paddingBottom);
  set("mediaPaddingLeft", OVERVIEW_MEDIA_COLUMN_PAD_PAGE.paddingLeft);
  set("mediaPaddingRight", OVERVIEW_MEDIA_COLUMN_PAD_PAGE.paddingRight);
  set("columnGap", OVERVIEW_COLUMN_GAP);
  if (isUnset(next.sideImageBackgroundColor)) {
    next.sideImageBackgroundColor = sanityColor(OVERVIEW_SIDE_TEAL);
    notes.push(`sideImageBackgroundColor→${OVERVIEW_SIDE_TEAL}`);
  }
  return next;
}

function patchReflection(section: Section, notes: string[]) {
  const next = { ...section };
  const appearance = (next.appearance ?? {}) as Record<string, unknown>;
  const bgHex = hexOf(appearance.backgroundColor);
  const needsBg =
    isUnset(appearance.backgroundColor) ||
    bgHex === "#000000" ||
    bgHex === "#000";
  const { next: merged, changed } = mergeAppearanceDefaults(
    appearance,
    REFLECTION_APPEARANCE_DEFAULTS,
  );
  if (needsBg) {
    merged.backgroundColor = sanityColor(REFLECTION_DEFAULTS.backgroundColor);
    if (!changed.includes("backgroundColor")) changed.push("backgroundColor");
    if (!merged.textColor) {
      merged.textColor = sanityColor("#ffffff");
      changed.push("textColor");
    }
  }
  if (changed.length) {
    next.appearance = merged;
    notes.push(`appearance: ${changed.join(", ")}`);
  }
  return next;
}

function patchAccordion(section: Section, notes: string[]) {
  const next = { ...section };
  if (isUnset(next.accordionBackgroundColor)) {
    next.accordionBackgroundColor = sanityColor(ACCORDION_PANEL_BACKGROUND);
    notes.push(`accordionBackgroundColor→${ACCORDION_PANEL_BACKGROUND}`);
  }
  return next;
}

function patchProblemContext(section: Section, pageTemplate: boolean, notes: string[]) {
  if (!pageTemplate) return section;
  const { next: appearance, changed } = mergeAppearanceDefaults(
    section.appearance as Record<string, unknown> | undefined,
    PROBLEM_CONTEXT_PAGE_APPEARANCE_DEFAULTS,
  );
  if (!changed.length) return section;
  notes.push(`appearance: ${changed.join(", ")}`);
  return { ...section, appearance };
}

function patchCoreExperience(section: Section, notes: string[]) {
  const next = { ...section };
  const desktop = section.layoutVariant === "desktopGrid";
  const dims = desktop
    ? CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS
    : CORE_EXPERIENCE_BAND_MOBILE_DEFAULTS;
  const screens = (next.previewScreens ?? []) as Section[];
  let screenNotes = 0;

  if (screens.length) {
    next.previewScreens = screens.map((sc) => {
      const patched = { ...sc };
      if (isUnset(patched.imageWidth)) {
        patched.imageWidth = dims.imageAspectWidth;
        screenNotes++;
      }
      if (isUnset(patched.imageHeight)) {
        patched.imageHeight = dims.imageAspectHeight;
        screenNotes++;
      }
      const { next: appearance, changed } = mergeAppearanceDefaults(
        patched.appearance as Record<string, unknown> | undefined,
        {
          tileBackgroundColor: sanityColor(
            CORE_EXPERIENCE_SCREEN_APPEARANCE.tileBackgroundColor,
          ),
        },
      );
      if (changed.length) {
        patched.appearance = appearance;
        screenNotes++;
      }
      return patched;
    });
  }
  if (screenNotes) notes.push(`previewScreens: ${screenNotes} field(s)`);
  return next;
}

function patchHighlightReel(section: Section, notes: string[]) {
  const next = { ...section };
  const set = (key: string, value: unknown) => {
    if (!isUnset(next[key])) return;
    next[key] = value;
    notes.push(`${key}→${typeof value === "object" ? "…" : value}`);
  };

  if (section.layout === "single") {
    set(
      "singleCardMatteColor",
      sanityColor(HIGHLIGHT_REEL_SINGLE_DEFAULTS.cardMatteColor),
    );
    set("singleCardPadding", HIGHLIGHT_REEL_SINGLE_DEFAULTS.cardPadding);
  } else {
    set(
      "gridCellMatteColor",
      sanityColor(HIGHLIGHT_REEL_GRID_DEFAULTS.cellMatteColor),
    );
    set(
      "gridCellInsetVerticalPercent",
      HIGHLIGHT_REEL_GRID_DEFAULTS.cellInsetVerticalPercent,
    );
    set(
      "gridCellInsetHorizontalPercent",
      HIGHLIGHT_REEL_GRID_DEFAULTS.cellInsetHorizontalPercent,
    );
    set("gridGap", HIGHLIGHT_REEL_GRID_DEFAULTS.gridGap);
  }
  return next;
}

function patchMotionShowcase(section: Section, notes: string[]) {
  const next = { ...section };
  const set = (key: string, value: unknown) => {
    if (!isUnset(next[key])) return;
    next[key] = value;
    notes.push(`${key}→${value}`);
  };

  set("titleMarginBottom", MOTION_SHOWCASE_BAND_DEFAULTS.titleMarginBottom);
  set(
    "titleMarginBottomDesktop",
    MOTION_SHOWCASE_BAND_DEFAULTS.titleMarginBottomDesktop,
  );
  set("introMarginBottom", MOTION_SHOWCASE_BAND_DEFAULTS.introMarginBottom);

  const rows = (next.rows ?? []) as Section[];
  let rowFixes = 0;
  if (rows.length) {
    next.rows = rows.map((row) => {
      const patched = { ...row };
      if (isUnset(patched.rowWidthPercent)) {
        patched.rowWidthPercent = MOTION_ROW_DEFAULTS.rowWidthPercent;
        rowFixes++;
      }
      if (isUnset(patched.itemGapPercent)) {
        patched.itemGapPercent = MOTION_ROW_DEFAULTS.itemGapPercent;
        rowFixes++;
      }
      if (isUnset(patched.captionMarginTop)) {
        patched.captionMarginTop = MOTION_ROW_DEFAULTS.captionMarginTop;
        rowFixes++;
      }
      if (isUnset(patched.tileBackgroundColor)) {
        patched.tileBackgroundColor = sanityColor(
          MOTION_ROW_DEFAULTS.tileBackgroundColor,
        );
        rowFixes++;
      }
      const items = (patched.items ?? []) as Section[];
      if (items.length) {
        patched.items = items.map((item) => {
          const hasVideo = !!item.videoFile || !!item.videoUrl;
          const hasImage = !!item.image;
          const type = item.mediaType;
          if (type === "image") return item;
          if ((type === "video" || isUnset(type)) && hasImage && !hasVideo) {
            return { ...item, mediaType: "image" };
          }
          if (isUnset(type)) return { ...item, mediaType: "image" };
          return item;
        });
      }
      return patched;
    });
  }
  if (rowFixes) notes.push(`motionRow: ${rowFixes} field(s)`);
  return next;
}

function patchStats(section: Section, notes: string[]) {
  const next = { ...section };
  const set = (key: string, value: unknown) => {
    if (!isUnset(next[key])) return;
    next[key] = value;
    notes.push(`${key}→${value}`);
  };
  set("metricGridGap", STATS_BAND_DEFAULTS.metricGridGap);
  set("metricGridGapDesktop", STATS_BAND_DEFAULTS.metricGridGapDesktop);
  set("titleMarginBottom", STATS_BAND_DEFAULTS.titleMarginBottom);
  set("titleMarginBottomDesktop", STATS_BAND_DEFAULTS.titleMarginBottomDesktop);
  set("bodyMarginBottom", STATS_BAND_DEFAULTS.bodyMarginBottom);
  return next;
}

function patchShowcase(section: Section, notes: string[]) {
  const next = { ...section };
  if (section.expandable && isUnset(next.sliderGap)) {
    next.sliderGap = SHOWCASE_ARTIFACT_DEFAULTS.sliderGap;
    notes.push(`sliderGap→${SHOWCASE_ARTIFACT_DEFAULTS.sliderGap}`);
  }
  return next;
}

function patchSectionAppearance(section: Section, notes: string[]) {
  const defaults = SECTION_APPEARANCE_DEFAULTS[section._type];
  if (!defaults) return section;
  const { next: appearance, changed } = mergeAppearanceDefaults(
    section.appearance as Record<string, unknown> | undefined,
    defaults,
  );
  if (!changed.length) return section;
  notes.push(`appearance: ${changed.join(", ")}`);
  return { ...section, appearance };
}

function patchSections(sections: Section[], slug: string) {
  const pageTemplate = PAGE_TEMPLATE_SLUGS.includes(
    slug as (typeof PAGE_TEMPLATE_SLUGS)[number],
  );
  const notes: string[] = [];
  let changed = false;

  const next = sections.map((s) => {
    const sectionNotes: string[] = [];
    let patched = s;

    if (s._type === "overviewSection") {
      patched = patchOverview(s, sectionNotes);
    } else if (s._type === "reflectionSection") {
      patched = patchReflection(s, sectionNotes);
    } else if (s._type === "accordionSection") {
      patched = patchAccordion(s, sectionNotes);
    } else if (s._type === "problemContextSection") {
      patched = patchProblemContext(s, pageTemplate, sectionNotes);
    } else if (s._type === "coreExperience") {
      patched = patchCoreExperience(s, sectionNotes);
    } else if (s._type === "motionShowcase") {
      patched = patchMotionShowcase(s, sectionNotes);
    } else if (s._type === "highlightReel") {
      patched = patchHighlightReel(s, sectionNotes);
    } else if (s._type === "statsSection") {
      patched = patchStats(s, sectionNotes);
    } else if (s._type === "showcaseGallery") {
      patched = patchShowcase(s, sectionNotes);
    } else if (
      s._type === "proseSection" ||
      s._type === "bulletSection" ||
      s._type === "mediaSection"
    ) {
      patched = patchSectionAppearance(s, sectionNotes);
    }

    if (sectionNotes.length) {
      changed = true;
      notes.push(`${s._type}: ${sectionNotes.join(" | ")}`);
    }
    return patched;
  });

  return { sections: next, notes, changed };
}

async function main() {
  const filter = slugArg
    ? `*[_type == "caseStudy" && slug.current == $slug]{ _id, "slug": slug.current }`
    : `*[_type == "caseStudy"]{ _id, "slug": slug.current }`;
  const params = slugArg ? { slug: slugArg } : {};
  const docs: { _id: string; slug: string }[] = await client.fetch(filter, params);

  if (slugArg && !docs.length) {
    console.error(`No case study with slug "${slugArg}"`);
    process.exit(1);
  }

  let patched = 0;

  for (const { _id, slug } of docs) {
    const doc = await client.getDocument(_id);
    if (!doc?.sections?.length) continue;

    const { sections, notes, changed } = patchSections(
      doc.sections as Section[],
      slug,
    );
    if (!changed) continue;

    console.log(`→ ${slug} (${_id})`);
    for (const n of notes) console.log(`   ${n}`);
    patched++;

    if (!DRY) await client.patch(_id).set({ sections }).commit();
  }

  console.log(`\n${DRY ? "(dry run) " : ""}${patched} case study doc(s) patched`);

  const workPage = await client.fetch<{ _id: string } | null>(
    `*[_type == "workPage"][0]{ _id }`,
  );
  if (workPage?._id) {
    const doc = await client.getDocument(workPage._id);
    const { next: appearance, changed } = mergeAppearanceDefaults(
      doc?.appearance as Record<string, unknown> | undefined,
      WORK_PAGE_APPEARANCE_DEFAULTS,
    );
    if (changed.length) {
      console.log(`→ workPage: appearance: ${changed.join(", ")}`);
      if (!DRY) await client.patch(workPage._id).set({ appearance }).commit();
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
