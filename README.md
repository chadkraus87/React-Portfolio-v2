# Chad Kraus — Portfolio

Personal portfolio: ten shipped projects, racked as units in an interactive
server room — software and AI in one rack, networks and support in the other.

**Live: https://chad-kraus-portfolio.vercel.app**

Vite + React 19, deployed on Vercel. Every route is prerendered to a real static
file, so each page returns 200 with its own title, description and social card
rather than being handed to a client-side router.

---

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # vite build + prerender into dist/
npm run preview   # serve dist/ locally
npm run test:e2e  # accessibility + behaviour checks against dist/ (build first)
npm run test:visual:update  # regenerate screenshot baselines in Docker
sh scripts/update-visual-baselines.sh check  # compare against them without updating
```

> `npm run preview` has SPA fallback, so an unmatched path returns `index.html`
> with a 200. Production does not behave that way. Don't use it to verify
> routing or 404 behaviour.

---

## Deploying

Pushing to `main` auto-deploys to production via Vercel, usually in under 30
seconds. There is no manual publish step.

The `gh-pages` branch holds a redirect from the old GitHub Pages URL and is
excluded from Vercel builds in `vercel.json`. `.github/workflows/publish.yml` is
frozen to `workflow_dispatch` and should stay that way — the Vite base is now
`/`, which GitHub Pages cannot serve from a repo subpath.

---

## Making changes

Almost everything is data, not components.

| To change | Edit |
| --- | --- |
| Projects (rows, case studies, badges, demo video) | `src/data/projects.js` |
| Which rack / lens a project belongs to | `src/data/racks.js` |
| Case-study and colophon stories | `src/data/stories.js` |
| Public commit activity | `node scripts/fetch-activity.mjs` → `src/data/activity.json` (also runs daily in GitHub Actions) |
| Bio, experience, skills, certifications, contact | `src/data/profile.js` |
| Resume PDF | `src/assets/files/` |
| Design tokens (colours, type) | `src/index.css` |

**Adding a project** needs a `projects.js` entry with a unique `slug` and a place
in one rack in `racks.js` (five units per rack; the build fails if a project is
unracked). Its `/projects/<slug>` page, sitemap entry and metadata are generated
at build time. Field documentation is at the top of `projects.js`.

**Demo videos** are silent H.264 MP4s in `public/demos/`, referenced by a
project's `demo` field. They pause off-screen, never autoplay under reduced
motion, and always show a pause control. `demoNote` adds a caption when client
names are masked or the data shown is simulated.

**Social cards** are generated locally and committed:

```bash
/usr/bin/python3 scripts/make-og-images.py
```

That writes the site card (`public/og-image.png`) and one per project
(`public/og/<slug>.jpg`). It is deliberately not part of `npm run build` —
Vercel's build image has Node but not Pillow, and the cards only change when
project copy does.

---

## Architecture

```
src/
├── data/          projects · racks · stories · profile · activity.json  ← edit these
├── components/    ServerRoom, Monitor, Spark, NavBar, Footer, Analytics
├── pages/         Home · Portfolio · ProjectDetail · Resume · Contact · NotFound
├── lib/           serverRoom.js (engine) · rackModel.js (pure model) · helpers
├── assets/        images/ and files/
└── index.css      Server Room design tokens (Thermal palette)
public/demos/      demo recordings
scripts/
├── prerender.mjs        runs after vite build; checks racks, self-tests the rack model, emits per-route HTML, sitemap, robots, 404
├── fetch-activity.mjs   run manually; public GitHub commit counts
└── make-og-images.py    run manually; regenerates social cards
e2e/site.spec.js         Playwright + axe checks (npm run test:e2e)
lighthouserc.json        Lighthouse budgets enforced in CI
e2e/visual.spec.js       screenshot comparisons against Linux baselines
middleware.js            Vercel Routing Middleware: share previews for ?unit= links
```

- **Routing** — BrowserRouter with real paths. `basename` comes from
  `import.meta.env.BASE_URL`, so the base path is defined once in
  `vite.config.js`.
- **Prerendering** — `scripts/prerender.mjs` derives project pages from
  `projects.js` (parsed, not imported, since it imports images).
- **Server room** — `ServerRoom.jsx` renders the markup once; `serverRoom.js`
  mounts an imperative engine (CSS 3D camera, canvas cables and dust, KVM
  console, detail sheet) from one effect with full cleanup. Reduced motion
  turns the scroll dive, signals and ambient animation off.
- **Redirects** — the removed `/notes` URLs 301 to their new homes in `vercel.json`.
- **Build readout** — `vite.config.js` injects the build time and commit
  (`__BUILD__`), shown on rack B01's base and in the footer.
- **Route changes** — React Router view transitions wipe the new page in behind a
  signal trace; reduced motion turns both off.
- **Rack sound** — optional Web Audio sounds (`src/lib/rackSound.js`), off by
  default and remembered per browser.
- **Shareable units** — pulling a unit writes `?unit=<slug>` into the address;
  opening that address pulls the unit out. Case studies link back with "Show in
  the rack".
- **Operator snapshot** — `hire` in the console opens a printable one-page
  summary built from `profile.js`, with the resume PDF one click away.
- **Demo captions** — `demoChapters` drive timed captions over each silent demo
  and a "What's on screen" list beneath it (`src/lib/demoCaptions.js`).
- **Evidence dates** — every screenshot and demo shows when it was captured, and
  is flagged when it predates the project's last update.
- **Light theme** — opt-in from the nav, saved per browser, applied before first
  paint by `public/theme.js`. The server room and other hardware stay dark.
- **CI** — `.github/workflows/ci.yml` runs the build, the Playwright + axe suite
  and Lighthouse budgets (`quality`), and screenshot comparison in the pinned
  Playwright image (`visual`), on pull requests and on every Vercel deployment,
  reporting both to Vercel Deployment Checks (`deployment-checks.yml`).
- **Share previews** — `middleware.js` serves `/?unit=<slug>` a prerendered copy
  of the home page carrying that project's title and social card.
- **Architecture** — each case study draws the project's layers from the
  `architecture` field, taken from its own details and stack.
- **First-visit tour** — a 20-second, skippable walk through pulling a unit,
  firing a port and the `hire` command, offered once per browser.
- **Analytics** — GoatCounter pageviews plus anonymous events for unit pulls,
  port signals, `hire`, copied links, printing, sound and the tour. No cookies.
- **Stale evidence** — the daily Action opens a GitHub issue when a screenshot or
  demo predates its project's last update, and closes it when fixed.
- **Demo uptime** — the same daily Action checks every live demo link
  (`scripts/check-uptime.mjs`); one that stops answering turns its rack power
  light amber, shows a warning chip, and opens an issue until it answers again.
- **What changed** — `/changes`, rebuilt from public commits on the first of each
  month by `.github/workflows/changelog.yml`.
- **Keyboard shortcuts** — press `?` anywhere, or use the footer button.
- **Change log curation and RSS** — `scripts/changelog-curation.json` hides or
  rewords commit lines; `/changes.xml` is an RSS feed of the log.
- **Uptime strip** — case studies with a live demo show 30 days of its uptime
  record, derived from recorded outages.
- **Ask about this project** — links to `/contact?project=<slug>`, which starts the
  message about that project (only real slugs count).
- **Demo status** — `/status` shows every live demo's uptime strip in one place.
- **Shareable filters** — `/portfolio?lens=builder&tool=supabase` keeps the lens and
  tool filters in the address; case study tools link to their filtered list.
- **Accessibility statement** — `/accessibility` lists the checks CI actually runs,
  what is built in, and the known limitations.
- **Smoke check** — after each production promotion (and daily)
  `.github/workflows/smoke.yml` checks the live site and opens an issue on failure.
- **Lighthouse trend** — CI keeps scores across runs as an artifact and shows the
  change since the previous production run in the job summary.
- **Data saver** — with Save-Data on, demos show their screenshot until the
  visitor chooses "Load demo video".
- **Print case study** — a clean single-column print of any case study, with the
  demo's screenshot and its "What's on screen" list.
- **Analytics** — GoatCounter, with `no_onload` set so `src/components/
  Analytics.jsx` can record one pageview per client-side route.
- **Contact** — posts to Formspree; `FORM_ENDPOINT` in `src/pages/Contact.jsx`
  is the only wiring. Falls back to `mailto:` if unset.
- **Headers** — `vercel.json` sets a CSP scoped to the origins this site
  actually uses, plus HSTS, `nosniff`, frame-deny and a permissions policy.

---

## History

- **Sept 2026** — Server Room redesign; Notes removed with redirects; demo videos.
- **Sept 2026** — moved from GitHub Pages to Vercel; React 19 + react-router 8.
- **Aug 2026** — real paths and prerendering, replacing hash routing.
- **July 2026** — rebuilt on Vite + React after Create React App was deprecated.
