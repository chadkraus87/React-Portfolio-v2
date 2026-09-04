# Chad Kraus — Portfolio

Personal portfolio: ten shipped projects across AI tooling, infrastructure
consoles, and systems games.

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
> routing or 404 behaviour — see `src/data/notes.js` for the write-up.

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
| Projects (cards, pages, filters, badges) | `src/data/projects.js` |
| Bio, tagline, skills, contact | `src/data/profile.js` |
| Writing / notes | `src/data/notes.js` |
| Resume PDF | `src/assets/files/` |
| Design tokens (colours, type) | `src/index.css` |

**Adding a project** needs no code change beyond `projects.js`: give it a unique
`slug` and its `/projects/<slug>` page, sitemap entry and metadata are generated
at build time. Field documentation is at the top of that file.

**Adding a note** works the same way. The `/notes` route and its nav link only
appear once `notes` has at least one entry, so the site never shows an empty
writing section.

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
├── data/          projects.js · profile.js · notes.js  ← edit these
├── components/    NavBar, Footer, ProjectCard, Analytics
├── pages/         About · Portfolio · ProjectDetail · Notes · Resume · Contact · NotFound
├── lib/           shared formatting helpers
├── assets/        images/ and files/
└── index.css      design tokens
scripts/
├── prerender.mjs        runs after vite build; emits per-route HTML, sitemap, robots, 404
└── make-og-images.py    run manually; regenerates social cards
```

- **Routing** — BrowserRouter with real paths. `basename` comes from
  `import.meta.env.BASE_URL`, so the base path is defined once in
  `vite.config.js`.
- **Prerendering** — `scripts/prerender.mjs` derives project and note pages from
  the data files (parsed, not imported, since those modules import images).
- **Analytics** — GoatCounter, with `no_onload` set so `src/components/
  Analytics.jsx` can record one pageview per client-side route.
- **Contact** — posts to Formspree; `FORM_ENDPOINT` in `src/pages/Contact.jsx`
  is the only wiring. Falls back to `mailto:` if unset.
- **Headers** — `vercel.json` sets a CSP scoped to the origins this site
  actually uses, plus HSTS, `nosniff`, frame-deny and a permissions policy.

---

## History

- **Sept 2026** — moved from GitHub Pages to Vercel; React 19 + react-router 8.
- **Aug 2026** — real paths and prerendering, replacing hash routing.
- **July 2026** — rebuilt on Vite + React after Create React App was deprecated.
