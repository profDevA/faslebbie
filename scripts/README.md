# Sanity scripts

Run from `frontend/`:

```bash
npx sanity exec scripts/<name>.ts --with-user-token
```

Patch-only copy and seed data live in `scripts/data/` (not imported by page components).

## Fonts

Body prose = **Reckless Neue Regular (400)** — same weight as expanded grey-pill copy.
Re-download from WP: `pwsh scripts/download-wp-fonts.ps1`. Or copy from local
`wp-content/themes/twentynineteen/fonts-new/` if you have the WordPress export.

## Safe to run (targeted patches)

| When | Script |
|------|--------|
| Case study media wiped by bad patch | `restore-case-study-sections-from-history.ts` then `patch-problem-context-sections.ts` |
| Coral overview / Problem Context / Reflection / Next Steps wiped | `patch-coral-restore-from-history.ts` |
| Coral Studio validation (missing image, variant, ctaUrl, draft sync) | `patch-coral-fix-studio-validation.ts` |
| All case studies — Studio validation / appearance strings | `patch-case-study-studio-validation.ts`, `patch-appearance-legacy-strings.ts` |
| Draft out of sync after template migration | `sync-case-study-drafts-from-published.ts` |
| Red case studies → Coral master template | `migrate-case-studies-coral-template.ts` (run `parse-case-study-collab-doc.mjs` first to refresh `data/caseStudyCollabCopy.json`) |
| Coral media audit (read-only) | `check-coral-media.ts` |
| Case study Problem Context + What I Brought (one Sanity section) | `patch-problem-context-sections.ts` |
| Coral §04 Core Experience band tiles | `patch-coral-core-experience-screens.ts` (PNG source: `public/work/coral-health/core-flow/`) |
| Acme §04 Core Experience band captions | `patch-acme-core-experience-captions.ts` |
| Overview copy/media column padding (Figma 56/80 prefilled in Studio) | `patch-case-study-overview-padding-defaults.ts` (superseded by template defaults for horizontal/gap/teal) |
| Case study section appearance (Reflection, Motion, Core Experience popup, etc.) | `patch-case-study-appearance-defaults.ts` |
| Overview horizontal/gap/teal, Reflection #171717, accordion, CE screens, highlight reel, stats/motion/showcase layout, legacy appearance, work page | `patch-case-study-template-defaults.ts` |
| FDX — remove §06 Research Artifacts band | `patch-fdx-remove-research-artifacts.ts` |
| Coral §04 Core Experience popup tabs (Mobile/iPad/Desktop) | `patch-coral-core-experience-popup-tabs.ts` |
| Coral section orphan keys (Studio “Unknown fields”) | `patch-coral-unset-section-orphans.ts` |
| Coral §09 Impact metric order + suffix | `patch-coral-impact-metrics.ts` |
| statsSection.body stored as null (Studio portableText error) | `patch-stats-section-unset-null-body.ts` |
| statsSection orphan caption/cta/video keys | `patch-stats-section-unset-orphans.ts` |
| highlightReel orphan body/cta/video/items keys | `patch-highlight-reel-unset-orphans.ts` |
| Coral §10 highlightReel layout=grid | `patch-coral-highlight-layout.ts` |
| Coral §11 Reflection + Next Steps → reflectionSection | `patch-coral-reflection-section.ts` |
| Coral motion rows + artifact images wiped | `patch-coral-restore-motion-artifacts.ts` |
| Coral hero image + highlight reel + accordion/stats wiped | `patch-coral-restore-hero-highlight.ts` |
| Stray empty caseStudy draft (null slug) | `patch-delete-orphan-draft.ts` |
| Coral motionShowcase title fix | `patch-coral-key-product-title.ts` |
| Drag order broken (Case Studies / Categories / Testimonials) | `patch-order-ranks.ts` |
| cardCredits → cardCreditNames list | `patch-credits.ts` |
| Approach copy | `patch-approach-final-copy.ts` |
| Research copy | `patch-research-final-copy.ts` |
| Research Paradigms/Principles covers | `patch-research-section-covers.ts` |
| Research artifacts inline book (Figma 3393:3429) | `patch-research-artifacts-chip.ts` |
| Teaching prose / students / slides / exhibition | `patch-teaching-prose.ts`, `patch-teaching-student-extras.ts`, `patch-student-popup-slides.ts`, `patch-exhibition-tiles.ts` |
| Work `.img` titles/order/covers, tool stack | `patch-work-img-titles-order.ts`, `patch-work-img-covers.ts`, `patch-work-tool-stack*.ts` |
| Build listing, covers, popup copy | `patch-build-final-copy.ts`, `patch-build-covers.ts`, `patch-build-project-copy.ts`, `patch-build-case-study-details.ts`, `patch-build-strip-legacy-fields.ts`, `patch-build-leoney-concept.ts`, `patch-build-popup-images-migrate.ts`, `patch-build-output-visuals.ts` |
| About / home / site chrome / SEO / portraits | `patch-about-final-copy.ts`, `patch-about-plain-tokens.ts`, `patch-about-family-photo.ts`, `patch-about-expansions.ts`, `patch-home-final-copy.ts`, `patch-site-chrome.ts`, `patch-seo-share.ts`, `patch-master-portrait.ts`, `patch-home-portrait.ts` |
| Blogs / media / publications | `patch-blogs-publications.ts`, `patch-books-covers.ts`, `patch-media-redesign.ts`, `patch-blog-footers.ts` |
| Testimonial photos only | `patch-testimonial-photos.ts` |

Copy data modules (imported by patches, not run directly): `approach-final-copy-data.ts`, `about-expansions-data.ts`, `data/*`, `seed/*`.

**Legacy section types** (`proseSection`, `bulletSection`, `mediaSection`, `gallerySection`) stay in the schema and frontend for unmigrated case studies but are **hidden from the Studio section picker**. Migrate per slug to `problemContextSection`, `reflectionSection`, `desktopMotionShowcase`, etc., then remove renderers when usage hits zero.

Shared helper: `lib/lexorank-order.ts` — use LexoRank for `orderRank`, never `"00001"`-style strings.

## Do not re-run for routine edits

| Script | Why |
|--------|-----|
| **`migrate-pages.ts`** | Wipes Build covers, 14 student carousels, 12 exhibition photos |
| **`migrate-research.ts`** | Re-uploads field-note images |

Use **`patch-*`** for single-field or copy updates. Use **`migrate-case-studies-coral-template.ts`** (with `--dry` / `--slug=`) for remaining red case-study template migrations — not the old bulk `migrate-*-redesign.ts` scripts (removed Aug 2026).

See `CLAUDE.md` for page-specific source-of-truth files.

**Do not add `_tmp-*` scripts** — throwaway audits belong in agent sessions, not the repo.
