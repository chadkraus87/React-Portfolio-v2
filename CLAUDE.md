# CLAUDE.md — React Portfolio v2

## What this project is
A personal developer portfolio. Vite + React 18, deployed to GitHub Pages.
- Live: https://chadkraus87.github.io/React-Portfolio-v2/
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
  exactly one place: `vite.config.js` (`/React-Portfolio-v2/`). GitHub Pages
  can't rewrite server-side, so `public/404.html` encodes the requested route
  into a query string and `index.html` decodes it before React boots. If you
  ever change the base path or move to a custom domain, both of those plus
  `pathSegmentsToKeep` in 404.html need to agree.

## Prerendering (why `npm run build` has a second step)
`npm run build` runs `vite build` then `scripts/prerender.mjs`, which writes a
real `dist/<route>/index.html` for each route plus `sitemap.xml` and
`robots.txt`. Without it, `/portfolio` is served by `404.html` — fine for humans
(the JS redirect fixes it) but a literal HTTP 404, which crawlers drop. The
prerendered files make each route answer 200 and carry its own `<title>`,
description and OG tags.

**When you add a route**, add it to the `routes` array in `scripts/prerender.mjs`
too, or it will 404 for crawlers and lose its per-page metadata.

## Deployment
- Auto-publishing is ON via GitHub Actions (`.github/workflows/publish.yml`).
  Any push to `main` triggers a build + publish to GitHub Pages. Do NOT run
  `npm run deploy` manually.
- After a push, the live site updates in ~1–2 minutes. GitHub caches for a few
  minutes; verify in an incognito window.

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
8. Tell me to check the Actions tab for the green check, then verify in incognito.

## How to make the common updates
- **Add/edit/remove a project** → `src/data/projects.js`. Copy an existing block,
  change the fields. Fields: `title`, `category`, `summary` (1–2 sentence hook,
  always visible — keep it short, it sets the card height), optional `details`
  (longer writeup hidden behind a "More detail" toggle; don't repeat the summary),
  `stack` (array of tech tags), `image` (import at top, reference by variable, or
  `null` for a styled placeholder), `projectLink` and `repoLink` (URL or `null` —
  a null link hides its button), optional `projectLinkLabel` (defaults to
  'View project'; use 'Watch demo' for video links), optional `status`.
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
- `.github/workflows/publish.yml` pins Node 20, which GitHub now flags as deprecated
  (harmless warning). Bumping to Node 22 silences it — do this only if I ask.