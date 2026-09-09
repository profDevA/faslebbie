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
| All case studies — Core Experience band/popup counts (read-only) | `check-case-study-ce-status.ts` |
| Case study Problem Context + What I Brought (one Sanity section) | `patch-problem-context-sections.ts` |
| Coral §04 Core Experience band tiles | `patch-coral-core-experience-screens.ts` (PNG source: `public/work/coral-health/core-flow/`) |
| Experian Boost §04 Core Experience band (5 phone screens) | `patch-experian-core-experience.ts` (manual upload; PNG/JPG: `public/work/experian-boost/core-flow/01–05-*`) |
| Experian Boost §04 View More popup — 8-tile grid | `patch-experian-core-experience-popup.ts` (Holistic modal `3947:17067` / `3778:130910`; tiles `3947:17071`–`27246` @4×; PNG: `public/work/experian-boost/core-flow/modal/`) |
| Unset legacy popupRowStagger / popupColumns (all case studies) | `patch-unset-ce-popup-stagger-fields.ts` |
| Experian Boost §09 Impact — 13 pts metric (matches Overview lead) | `patch-experian-impact-metrics.ts` |
| Experian Boost §10 Project Highlights — composite board | `patch-experian-highlight-composite.ts` (Figma `3778:130432`; PNG: `public/work/experian-boost/highlights-board.png`; desktop board only — optional `compositeImageMobile` in Studio) |
| Experian Boost §05 Design Process band/panel colors | `patch-experian-design-process.ts` |
| Experian Boost §07 Key Product Experiences — Band layout stacked | `patch-experian-key-product-layout.ts` |
| Acme §04 Core Experience band (4 dark-band preview tiles) | `patch-acme-core-experience.ts` (Figma `3977:11414`–`11411`; PNG: `public/work/acme-lending/band/01–04-*`) |
| Acme §04 View More popup — 3 use-case tabs (live WP) | `patch-acme-core-experience-popup.ts` (Use Case 1–3; downloads from fasandsabrina.com WP uploads; cache: `public/work/acme-lending/use-cases/`) |
| Acme §04 band previewRowStagger only | `patch-acme-ce-stagger-fields.ts` |
| Acme §04 Core Experience band captions only | `patch-acme-core-experience-captions.ts` (labels/descriptions only — no image re-upload) |
| Acme §06 Research Artifacts slider @4× (Figma 3795:154389–646) | `patch-acme-research-artifacts.ts` |
| Acme §08 Key Product Experiences — email mockup band (Figma 3795:152728) | `patch-acme-key-product-experiences.ts` (PNG: `public/work/acme-lending/key-product/email-verification-mockup.png`; drops §07 motionShowcase) |
| Acme §09 Impact — live metric order (33 / 78 / 10) | `patch-acme-impact-metrics.ts` |
| Acme §10 Project Highlights — composite 2×2 board (Figma 3795:152883) | `patch-acme-highlight-reel.ts` (JPG: `public/work/acme-lending/highlights-board.jpg`) |
| Overview copy/media column padding (Figma 56/80 prefilled in Studio) | `patch-case-study-overview-padding-defaults.ts` (superseded by template defaults for horizontal/gap/teal) |
| Overview media column padding → 0 (overwrite stored values) | `patch-overview-media-padding-zero.ts` |
| Case study section appearance (Reflection, Motion, Core Experience popup, etc.) | `patch-case-study-appearance-defaults.ts` |
| All case studies — §04 / §07 layoutVariant unset (Studio radio blank) | `patch-section-layout-variants.ts` |
| Overview horizontal/gap/teal, Reflection #171717, accordion, CE screens, highlight reel, stats/motion/showcase layout, legacy appearance, work page | `patch-case-study-template-defaults.ts` |
| Memory Tubes — Reflection body missing (Next Steps only) | `patch-memory-tubes-reflection.ts` |
| FDX — remove §06 Research Artifacts band | `patch-fdx-remove-research-artifacts.ts` |
| FDX §04 Core Experience — 5 phone tiles (Figma 3737:89837) | `patch-fdx-core-experience.ts` (PNG: `public/work/financial-data-exchange/core-flow/01–05-*`) |
| FDX §07–08 Key Product Experiences — 4 motion bands (Figma 3719:88185–88255) | `patch-fdx-key-product-experiences.ts` (structure + copy + colors; **images often replaced manually in Studio** — export @4×: phone `3719:88188`, desktop `3719:88226`, phone `3719:88247`, desktop `3719:88258`). **Do not re-run after manual uploads.** Shipped Sep 9, 2026 — `docs/meetings/2026-09-09-actions.md` |
| FDX §09 Impact — live metric order (20M+ / 67% / 30+) | `patch-fdx-impact-metrics.ts` |
| Coral §04 Core Experience popup tabs (Mobile/iPad/Desktop) | `patch-coral-core-experience-popup-tabs.ts` |
| Coral section orphan keys (Studio “Unknown fields”) | `patch-coral-unset-section-orphans.ts` |
| Coral §09 Impact metric order + suffix | `patch-coral-impact-metrics.ts` |
| statsSection.body stored as null (Studio portableText error) | `patch-stats-section-unset-null-body.ts` |
| coreExperience.body / popupBody stored as null (Studio portableText error) | `patch-core-experience-unset-null-body.ts` |
| statsSection orphan caption/cta/video keys | `patch-stats-section-unset-orphans.ts` |
| highlightReel orphan body/cta/video/items keys | `patch-highlight-reel-unset-orphans.ts` |
| Coral §10 highlightReel layout=grid | `patch-coral-highlight-layout.ts` |
| Coral §11 Reflection + Next Steps → reflectionSection | `patch-coral-reflection-section.ts` |
| Coral motion rows + artifact images wiped | `patch-coral-restore-motion-artifacts.ts` |
| Coral hero image + highlight reel + accordion/stats wiped | `patch-coral-restore-hero-highlight.ts` |
| Stray empty caseStudy draft (null slug) | `patch-delete-orphan-draft.ts` |
| Coral motionShowcase title fix | `patch-coral-key-product-title.ts` |
| Census §05 Design Process — cream band + navy accordion (Figma 3999:53211) | `patch-census-design-process.ts` — band `#e3e3db`, panel `#194498` |
| Census §07 featured motion — desktop caption bottom-right (Figma 3999:53406) | `patch-census-motion-caption-align.ts` — sets `captionAlign: right` only (no image re-upload) |
| Census §10 Project Highlights — scatter collage boards (Figma 3999:53562 / 3999:55917) | `patch-census-highlight-reel.ts` — navy `#436997`, desktop + mobile composite (PNG: `public/work/2020-us-census-benefit-calculator/highlights/01–02-*`). `--appearance-only` / `--mobile-only` patch band color or mobile board without full re-upload |
| Census §04 Core Experience — 4-tile band (Figma 3999:59093 desktop / 3999:54903 mobile stack) | `patch-census-core-experience.ts` (PNG: `core-flow/01–04-*`; same four tiles on mobile + desktop; row gap 116px). **Do not re-run after manual uploads.** Shipped Sep 9, 2026 |
| Census §04 Core Experience View More — 8-tile flow grid | `patch-census-core-experience-popup.ts` (PNG: `core-flow/modal/00-landing-hero.png` + `01–07-*`; popup bg `#0A2A58`). **`--appearance-only`** updates colors without re-uploading. **Do not re-run full patch after manual uploads.** |
| Census §07–08 Key Product Experiences — 2 motion bands (Figma 3999:52313 / 54687) | `patch-census-key-product-experiences.ts` (structure + copy + colors; **images often replaced manually in Studio** — export @4×: phone `4001:70876`, desktop `3999:61079`). **Do not re-run after manual uploads.** Shipped Sep 9, 2026 — `docs/meetings/2026-09-09-actions.md` |
| Census §09 Impact — live metric order (40B+ / 17% / 500K) | `patch-census-impact-metrics.ts` |
| Census sections wiped by bad Key Product patch | `patch-census-restore-from-history.ts` then re-run `patch-census-key-product-experiences.ts` |
| Drag order broken (Case Studies / Categories / Testimonials) | `patch-order-ranks.ts` |
| **All case studies — password protect** | `patch-case-studies-password-protect-all.ts` (uses Site Settings → Access password) |
| cardCredits → cardCreditNames list | `patch-credits.ts` |
| Approach copy | `patch-approach-final-copy.ts` |
| Research copy | `patch-research-final-copy.ts` |
| Research Paradigms/Principles covers | `patch-research-section-covers.ts` |
| Research artifacts inline book (Figma 3393:3429) | `patch-research-artifacts-chip.ts` |
| Teaching prose / students / slides / exhibition | `patch-teaching-prose.ts`, `patch-teaching-student-extras.ts`, `patch-student-popup-slides.ts`, `patch-exhibition-tiles.ts` |
| Work `.img` titles/order/covers, tool stack | `patch-work-img-titles-order.ts`, `patch-work-img-covers.ts`, `patch-work-tool-stack*.ts` |
| Build listing, covers, popup copy | `patch-build-final-copy.ts`, `patch-build-covers.ts`, `patch-build-project-copy.ts`, `patch-build-case-study-details.ts`, `patch-build-strip-legacy-fields.ts`, `patch-build-leoney-concept.ts`, `patch-build-popup-images-migrate.ts`, `patch-build-output-visuals.ts` |
| Build popup scroll body empty (`caseStudyDetail` missing on all projects) | `patch-build-case-study-details.ts` — safe to re-run; does not touch images |
| About / home / site chrome / SEO / portraits | `patch-about-final-copy.ts`, `patch-about-family-photo.ts`, `patch-about-expansions.ts`, `patch-home-final-copy.ts`, `patch-site-chrome.ts`, `patch-seo-share.ts`, `patch-master-portrait.ts`, `patch-home-portrait.ts` |
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
| **`patch-about-plain-tokens.ts`** | Legacy evening QA — strips `teach` / `monthly` marks; opposite of current About spec (`free monthly` red popup) |

Use **`patch-*`** for single-field or copy updates. Use **`migrate-case-studies-coral-template.ts`** (with `--dry` / `--slug=`) for remaining red case-study template migrations — not the old bulk `migrate-*-redesign.ts` scripts (removed Aug 2026).

See `CLAUDE.md` for page-specific source-of-truth files.

**Do not add `_tmp-*` scripts** — throwaway audits belong in agent sessions, not the repo.
