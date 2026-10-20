# faslebbie.com — Fas Lebbie portfolio

Next.js 16 (App Router, TypeScript, Tailwind v4, Turbopack) with Sanity v6.
The Sanity Studio is embedded in the app at `/studio`.

Project knowledge (rules, per-case-study notes, meeting notes) lives one level
up in `../CLAUDE.md` and `../docs/` — those are **not** in this git repo.

## Commands

```bash
npm install
npm run dev      # dev server (Turbopack) — http://localhost:3000
npm run build    # production build (~2.5 min)
npm run start    # serve the production build
npx tsc --noEmit
npx eslint src sanity
```

## Environment

Create `.env.local` (dev) / `.env.production` (server). Names only — get the
values from the team:

| Variable | Used for |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION` | Sanity project (public) |
| `SANITY_API_READ_TOKEN` | Server-side reads — the dataset is private |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Contact form (`/api/contact`) |
| `NEXT_PUBLIC_SITE_URL` (optional) | Canonical / OG base URL; defaults to `https://faslebbie.com` |

## Layout

| Path | What |
|---|---|
| `src/app/` | Routes: `/`, `/about`, `/approach`, `/research`, `/teaching`, `/blogs`, `/build`, `/casestudies`, `/studio`, `/api/*` |
| `src/components/CaseStudyView.tsx` + `caseStudyView/` | Case-study renderer (all section types) |
| `src/sanity/` | Client, GROQ queries (`queries.ts`), types, image helpers |
| `src/lib/*FromSanity.ts` | Map Sanity documents to page props |
| `sanity/schemaTypes/` | Studio schema (documents, objects, sections) |
| `scripts/` | One-off Sanity migrate / patch scripts — **read `scripts/README.md` first; they write to production** |
| `public/work/` | Source media for the patch scripts (Figma / WP exports) |

## Sanity

- Studio: `/studio` on any running instance. Schema changes ship with the app
  — there is no separate `sanity schema deploy`.
- Section projections in `src/sanity/queries.ts` list fields explicitly: add a
  new schema field to the query or it won't reach the site.
- Patch scripts: `npx sanity exec scripts/<name>.ts --with-user-token`.

## Deploy

- **Preview:** `faslebbieportfolio.vercel.app`, auto-deploys from `main`.
- **Production (`faslebbie.com`):** EC2 (Ubuntu, nginx + pm2 `fasportfolio`),
  deployed by hand:

  ```bash
  cd ~/faslebbie
  git pull
  rm -rf .next
  npm run build
  pm2 restart 0 --update-env
  ```

Sanity content changes reach both hosts without a redeploy (60s revalidate).
