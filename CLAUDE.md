# CLAUDE.md — React Portfolio v2

## What this project is
A personal developer portfolio. Vite + React 19, deployed on Vercel.
- Live: https://chad-kraus-portfolio.vercel.app
- Repo: github.com/chadkraus87/React-Portfolio-v2
- Owner: Chadwick (Chad) Kraus

## Architecture (edit data, not components)
- `src/data/profile.js` — name, title, tagline, bio, skills, certifications, contact.
- `src/data/projects.js` — all portfolio project cards. Each project imports its
  image at the top of the file and references it by variable. Categories drive the
  filter buttons automatically; reuse exact existing category strings
  (e.g. 'AI & Claude Code') so projects group instead of spawning new filters.
- `src/assets/images/` — screenshots/headshot. `src/assets/files/` — resume PDF.
- `src/pages/` and `src/components/` — layout/design. Only touch when I ask for a
  design or structural change, not for content updates.
- Routing is BrowserRouter with real paths (`/portfolio`, not `/#/portfolio`).
  `basename` reads from `import.meta.env.BASE_URL`, so the base path lives in
  exactly one place: `vite.config.js` (now `/`, since Vercel serves from the
  domain root). The old GitHub Pages 404-redirect hack is gone — Vercel serves
  the prerendered files directly and uses `dist/404.html` for unknown paths.

## Prerendering (why `npm run build` has a second step)
`npm run build` runs `vite build` then `scripts/prerender.mjs`, which writes a
real `dist/<route>/index.html` for each route plus `sitemap.xml` and
`robots.txt`. Without it every route would fall through to `404.html`. The
prerendered files make each route answer 200 and carry its own `<title>`,
description and OG tags — which one shared `index.html` cannot do.

Project and note pages are derived automatically from `src/data/projects.js`
and `src/data/notes.js` (parsed, not imported, because those files import
images). **Adding a project or note needs no prerender change** — just give it
a unique `slug`. Only a brand-new top-level route needs adding to the `routes`
array by hand.

## Deployment
- **Vercel, git-connected.** Any push to `main` auto-deploys to production
  (usually under 30 seconds). Nothing to run by hand.
- Project: `chad-kraus-portfolio` under the `chadwick-kraus-projects` team.
  `.vercel/` and `.env*` are gitignored — never commit them.
- `.github/workflows/publish.yml` is frozen to `workflow_dispatch` only. It is
  kept for reference; do not re-enable it, since the Vite base is `/` and
  GitHub Pages served from a repo subpath would 404 on every asset.
- The old GitHub Pages URL still serves its last build. Retire or redirect it
  once nothing points there.
- Absolute URLs (og:url, og:image, sitemap, robots) live in `index.html` and
  `scripts/prerender.mjs` — both must be updated together if the domain changes.

## Non-negotiable working rules
1. **Always `git pull origin main` before making any changes.** I sometimes edit
   on github.com directly, so the local copy is often behind. Start every session
   with a pull to avoid divergence/merge conflicts.
2. **Never push without my explicit approval.** Make changes locally, run the
   verification steps below, show me a summary, and WAIT for me to say "push it"
   (or similar) before running git push. No exceptions.
3. **Before every push, run `npm run build` and confirm it succeeds.** The build
   catches the mistakes that have bitten us — missing/misnamed image imports,
   syntax errors. Never push a build that fails.
4. **Image imports must match the real filename exactly**, including capitalization
   and extension. When I add a project image, confirm the file exists in
   `src/assets/images/` and that the import line matches it character-for-character.
5. **Match commit style:** short title + a brief bullet list of what changed.
   Keep messages clean (no stray characters).

## Standard workflow for any update
1. `git pull origin main`
2. Make the requested edits (favor the data files).
3. `npm run build` — confirm it passes.
4. Optionally `npm run dev` so I can preview locally.
5. Summarize the changes and the exact commit message you'll use.
6. **Stop and wait for my approval.**
7. On approval: `git add -A`, `git commit`, `git push origin main`.
8. Vercel auto-deploys the push; confirm the new production deployment is Ready,
   then verify in an incognito window.

## How to make the common updates
- **Add/edit/remove a project** → `src/data/projects.js`. Copy an existing block,
  change the fields. Full field list is documented at the top of that file:
  `id`, `slug` (its `/projects/<slug>` page), `title`, `category`, `tagline`
  (short differentiator strip), `summary` (always visible on the card),
  optional `details` (the write-up on its own page), `stack`, `image`,
  `projectLink` / `projectLinkLabel` / `repoLink`, `status`
  ('Live' | 'In progress' | 'Private') and `updated` ('YYYY-MM').
- **Change bio / title / tagline / skills / certifications / contact** →
  `src/data/profile.js`. Edit the text between quotes; skills and certifications are
  simple arrays.
- **Swap the resume** → replace the PDF in `src/assets/files/` and update the import
  in `src/pages/Resume.jsx` if the filename changed.
- **Swap the headshot** → replace `src/assets/images/headshot.jpg` (square crop,
  ~640px, keep it small). The hero frame is sized to the photo; keep it square to
  avoid distortion.
- **Add a project image** → put the file in `src/assets/images/`, import it at the
  top of `projects.js`, reference by variable. Filename and import must match exactly.

## Recurring maintenance (do when I ask)
- Keep the portfolio current as I ship new Claude Code projects — adding them is the
  main ongoing task.
- Quarterly: `npm outdated`, then update dependencies, then `npm run build` to
  confirm nothing broke, then propose a push.
- Optimize new images before committing (aim under ~150KB; resize large screenshots
  to ~1400px wide).

## Security note
This portfolio intentionally omits repo/live links for some projects (e.g. Jarvis
is private for security). Never add links to a project unless I explicitly provide
them.

## Known housekeeping
- The old GitHub Pages URL (`chadkraus87.github.io/React-Portfolio-v2/`) still
  serves its last build. Decide whether to retire it or leave it as a stale
  mirror; it cannot redirect server-side.
- A Google Search Console property exists for the old GitHub Pages URL. The new
  Vercel domain needs its own property — the verification meta tag in
  `index.html` carries over, so verifying it should succeed immediately.