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
| Case study Problem Context + What I Brought (one Sanity section) | `patch-problem-context-sections.ts` |
| Coral §08 mediaSection → desktopMotionShowcase | `patch-coral-desktop-motion-section.ts` |
| Coral motion rows + artifact images wiped | `patch-coral-restore-motion-artifacts.ts` |
| Coral hero image + highlight reel + accordion/stats wiped | `patch-coral-restore-hero-highlight.ts` |
| Stray empty caseStudy draft (null slug) | `patch-delete-orphan-draft.ts` |
| Coral motionShowcase title fix | `patch-coral-key-product-title.ts` |
| Drag order broken (Case Studies / Categories / Testimonials) | `patch-order-ranks.ts` |
| Approach copy | `patch-approach-final-copy.ts` |
| Research copy | `patch-research-final-copy.ts` |
| Research Paradigms/Principles covers | `patch-research-section-covers.ts` |
| Research artifacts inline book (Figma 3393:3429) | `patch-research-artifacts-chip.ts` |
| Teaching prose / students / slides / exhibition | `patch-teaching-prose.ts`, `patch-teaching-student-extras.ts`, `patch-student-popup-slides.ts`, `patch-exhibition-tiles.ts` |
| Work `.img` titles/order/covers, tool stack | `patch-work-img-titles-order.ts`, `patch-work-img-covers.ts`, `patch-work-tool-stack*.ts` |
| Build listing, covers, popup copy | `patch-build-final-copy.ts`, `patch-build-covers.ts`, `patch-build-project-copy.ts`, `patch-build-case-study-details.ts`, `patch-build-strip-legacy-fields.ts`, `patch-build-leoney-concept.ts`, `patch-build-popup-images-migrate.ts`, `patch-build-output-visuals.ts` |
| About / home / site chrome / SEO / portraits | `patch-about-final-copy.ts`, `patch-about-plain-tokens.ts`, `patch-about-family-photo.ts`, `patch-home-final-copy.ts`, `patch-site-chrome.ts`, `patch-seo-share.ts`, `patch-master-portrait.ts`, … |
| Blogs / media / publications | `patch-blogs-publications.ts`, `patch-books-covers.ts`, `patch-media-redesign.ts`, `patch-blog-footers.ts` |
| Testimonial photos only | `patch-testimonial-photos.ts` |

Copy data modules (imported by patches, not run directly): `approach-final-copy-data.ts`, `about-expansions-data.ts`, `seed/*`.

Shared helper: `lib/lexorank-order.ts` — use LexoRank for `orderRank`, never `"00001"`-style strings.

## Do not re-run for routine edits

| Script | Why |
|--------|-----|
| **`migrate-pages.ts`** | Wipes Build covers, 14 student carousels, 12 exhibition photos |
| **`migrate-research.ts`** | Re-uploads field-note images |
| **`migrate-to-sanity.ts`**, **`migrate-blogs.ts`**, **`migrate-about.ts`**, **`migrate-testimonials.ts`** | Full re-seed from local data |
| **`migrate-*-redesign.ts`**, **`migrate-build-images.ts`** | One-time case-study / asset bulk imports |

Use **`patch-*`** for single-field or copy updates. See `CLAUDE.md` for page-specific source-of-truth files.

## Archive / one-off (already applied)

Case-study fixes, early migrations, and dev utilities kept for history — only re-run if you know why (`fix-coral-dupes.ts`, `patch-coral-colors.ts`, `patch-fromto.ts`, `patch-lost-copy.ts`, `migrate-coral-redesign.ts`, etc.).
