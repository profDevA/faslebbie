# Sanity scripts

Run from `frontend/`:

```bash
npx sanity exec scripts/<name>.ts --with-user-token
```

## Safe to run (targeted patches)

| When | Script |
|------|--------|
| Drag order broken (Case Studies / Categories / Testimonials) | `patch-order-ranks.ts` |
| Approach copy | `patch-approach-final-copy.ts` |
| Research copy | `patch-research-final-copy.ts` |
| Teaching prose / students / slides / exhibition | `patch-teaching-prose.ts`, `patch-teaching-student-extras.ts`, `patch-student-popup-slides.ts`, `patch-exhibition-tiles.ts` |
| Work `.img` titles/order/covers, tool stack | `patch-work-img-titles-order.ts`, `patch-work-img-covers.ts`, `patch-work-tool-stack*.ts` |
| Build listing, covers, popup copy | `patch-build-final-copy.ts`, `patch-build-covers.ts`, `patch-build-project-copy.ts`, `patch-build-leoney-concept.ts` |
| About / home / site chrome / SEO / portraits | `patch-about-final-copy.ts`, `patch-about-family-photo.ts`, `patch-home-final-copy.ts`, `patch-site-chrome.ts`, `patch-seo-share.ts`, `patch-master-portrait.ts`, … |
| Blogs / media / publications | `patch-blogs-publications.ts`, `patch-media-redesign.ts`, `patch-blog-footers.ts` |
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
