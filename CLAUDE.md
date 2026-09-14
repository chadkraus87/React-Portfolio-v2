# CLAUDE.md — React Portfolio v2

## What this project is
A personal developer portfolio. Vite + React 19, deployed on Vercel.
- Live: https://chad-kraus-portfolio.vercel.app
- Repo: github.com/chadkraus87/React-Portfolio-v2
- Owner: Chadwick (Chad) Kraus

## Architecture (edit data, not components)
- `src/data/profile.js` — name, title, tagline, bio, experience, skills, certifications
  (objects: `{ name, meta }`; NASM is site-only and shows "Current"), contact.
- `src/data/racks.js` — which rack each project stands in (A01 Software & AI,
  B01 Networks & support; max 5 units each) and the Builder/Operations lenses.
  Every project must be in exactly one rack or the build fails.
- `src/data/stories.js` — first-person case-study and colophon stories (drafts
  until Chad approves the wording).
- `src/data/activity.json` — generated. Refresh with `node scripts/fetch-activity.mjs`
  (unauthenticated GitHub API, so only public repos are ever counted).
  `.github/workflows/refresh-activity.yml` runs it daily and commits to `main`
  only when the numbers change, which redeploys the site. The same job opens,
  updates or closes a "Stale portfolio evidence" GitHub issue
  (`scripts/check-evidence.mjs`). It also runs `scripts/check-uptime.mjs`, which
  records in `src/data/uptime.json` whether each live demo link still answers:
  a demo that stops answering gets an amber power light on the rack, a "Live
  demo not answering since …" chip, and a "Live demo not answering" issue. Each
  site keeps `firstChecked` and its `outages`, which draw the 30-day uptime strip
  on the case study (as of the build date).
- `src/data/changelog.json` — generated on the first of each month by
  `.github/workflows/changelog.yml` (`node scripts/build-changelog.mjs [YYYY-MM …]`)
  from public commits; it is the `/changes` page and the `changes.xml` RSS feed.
  Never edit it by hand: to hide or reword a commit line, edit
  `scripts/changelog-curation.json` and rebuild those months.
- `src/data/projects.js` — all portfolio projects. Each project imports its
  image at the top of the file and references it by variable. Optional `demo` is a
  path to a silent MP4 in `public/demos/` (privacy-review every frame first);
  `demoNote` captions it when names are masked or the data is simulated.
  Every project needs `imageDate`; a demo also needs `demoDate` and
  `demoChapters` (timed captions of what is on screen). The build fails without
  them and warns when evidence is older than the project's `updated` month.
  `architecture` lists the layers drawn on the case study ("How it fits
  together"); every item must come from that project's own details or stack.
- Home is the server room: `src/components/ServerRoom.jsx` renders the racks once,
  `src/lib/serverRoom.js` is the imperative engine (camera, cables, console,
  detail sheet, first-visit tour, anonymous GoatCounter events), and
  `src/lib/rackModel.js` is the pure model the build self-tests.
- `middleware.js` (Vercel Routing Middleware) serves `/?unit=<slug>` the
  prerendered `dist/units/<slug>/index.html` copy of the home page, so a shared
  unit link unfurls with that project's card (`public/og/units/<slug>.jpg`, the
  unit pulled out of its rack). Only known slugs are rewritten. It also serves
  `/portfolio?tool=<slug>` the prerendered `dist/portfolio/tools/<slug>/index.html`
  ("Projects using Supabase"). The known tool slugs live in the generated
  `src/data/toolSlugs.js`: a local `npm run build` rewrites it when the shared tools
  change (commit it); CI and Vercel fail the build if it is stale.
- `src/components/Shortcuts.jsx` — the `?` keyboard shortcuts dialog, also opened
  from the footer. Case studies have "Print case study" with print styles.
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

Project pages are derived automatically from `src/data/projects.js` (parsed,
not imported, because it imports images). **Adding a project needs no prerender
change** — give it a unique `slug` and add it to a rack in `racks.js`. Only a
brand-new top-level route needs adding to the `routes` array by hand. The Notes
section was removed; old `/notes` URLs redirect permanently in `vercel.json`.

## Deployment
- **Vercel, git-connected.** Any push to `main` auto-deploys to production
  (usually under 30 seconds). Nothing to run by hand.
- Project: `chad-kraus-portfolio` under the `chadwick-kraus-projects` team.
  `.vercel/` and `.env*` are gitignored — never commit them.
- `.github/workflows/publish.yml` is frozen to `workflow_dispatch` only. It is
  kept for reference; do not re-enable it, since the Vite base is `/` and
  GitHub Pages served from a repo subpath would 404 on every asset.
- **GitHub Pages is a redirect stub, not a second deployment.** The `gh-pages`
  branch holds three files — `index.html`, `404.html`, `robots.txt` — and serves
  no portfolio content. Both pages carry `noindex, follow`, a `rel=canonical`
  to the Vercel site, a 0s meta refresh and a script that forwards the deep
  path, query and hash. It is kept deliberately so old inbound links land on
  the live site instead of a 404. Do not publish a build to it; there is no
  longer a `deploy` script or `gh-pages` dependency, and adding one back would
  overwrite the stub with a root-based build that 404s on every asset.
- Absolute URLs (og:url, og:image, sitemap, robots) live in `index.html` and
  `scripts/prerender.mjs` — both must be updated together if the domain changes.

## Quality gate
`.github/workflows/ci.yml` runs on every push and pull request, in two jobs:
- `quality`: `npm run build`, then `npm run test:e2e` (Playwright + axe: WCAG 2.2
  AA on every route in both themes, phone-width overflow, the room, console,
  tour, analytics events, shared unit links and previews, captions, architecture,
  reduced motion, theme toggle), then Lighthouse budgets from `lighthouserc.json`.
- `visual`: screenshot comparison against the Linux baselines in
  `e2e/visual.spec.js-snapshots/`, inside the pinned Playwright image. After an
  intentional design change run `npm run test:visual:update` (Docker), look at
  every PNG, and commit them with the change. `sh scripts/update-visual-baselines.sh
  check` runs the same comparison locally without touching the baselines.
CI runs for every Vercel deployment: Vercel sends a `repository_dispatch` event,
`.github/workflows/deployment-checks.yml` calls `ci.yml` against that commit, and
each job reports "Vercel - chad-kraus-portfolio: quality" / ": visual" as a commit
status through `vercel/repository-dispatch/actions/status` (it must stay the first
step of each job). Vercel Deployment Checks must require those two statuses so a
red build never reaches production. Plain GitHub check runs do not count.

The `quality` job also keeps Lighthouse scores over time: `scripts/lighthouse-history.mjs`
appends each run to a `lighthouse-history` artifact (downloaded from the latest
successful production check, one entry per commit, nothing committed) and writes a
trend table to the job summary. It fails when a page's performance score falls more
than 0.10 since the previous production run; the new entry is still saved, so the
next commit compares against it (a drop is flagged once, not blocked forever).

After Vercel promotes a production deployment, `.github/workflows/smoke.yml` runs
`scripts/smoke.mjs` against the live site (every route, the 404, share previews,
RSS, the `/notes` redirect, security headers) and opens or closes a "Production
smoke check failed" issue. It also runs daily. A new top-level route needs adding
to `scripts/smoke.mjs` as well as to `routes` in `scripts/prerender.mjs`.

`deployment-checks.yml` also has a `smoke` job that runs the same script against
the deployment's own URL before promotion. Deployment URLs are behind Vercel
Authentication, so it stays a no-op notice until the project's Protection Bypass
for Automation secret is saved as the GitHub secret
`VERCEL_AUTOMATION_BYPASS_SECRET`; then it reports "Vercel - chad-kraus-portfolio:
smoke", which can be added as a third required Deployment Check. `smoke.mjs` only
sends the secret to `*.vercel.app` addresses.

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
3. `npm run build` — confirm it passes, then `npm run test:e2e`.
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
  ('Live' | 'In progress' | 'Private'), `updated` ('YYYY-MM') and `imageDate`
  ('YYYY-MM' the screenshot was captured). A demo adds `demo`, `demoDate`,
  `demoChapters` and optionally `demoNote`.
- **Change bio / title / tagline / experience / skills / certifications / contact** →
  `src/data/profile.js`. Certifications are `{ name, meta }` objects.
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
- **Deferred until Google drops the old Pages URL.** `chadkraus87.github.io/
  React-Portfolio-v2/` now serves a redirect stub whose `robots.txt` allows
  crawling, so Google can finally read the `noindex` and the canonical. Once
  Search Console shows that URL dropped or consolidated, revisit — in this
  order — retiring the old Search Console property, deleting the second
  `google-site-verification` token from `index.html`, and optionally disabling
  Pages entirely. None of that happens before de-indexing is confirmed; the
  redirect stays indefinitely for now.
- Social cards (`public/og-image.png`, `public/og/`) are regenerated with
  `/usr/bin/python3 scripts/make-og-images.py` whenever project copy changes.