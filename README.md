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
