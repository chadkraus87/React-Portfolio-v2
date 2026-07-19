# Chad Kraus — React Portfolio (v2)

Rebuilt July 2026 on **Vite + React 18** (migrated off deprecated Create React App).
Forest green design system matched to the 2026 resume. Deployed to GitHub Pages.

Live: https://chadkraus87.github.io/React-Portfolio-v2/

---

## Quick start

```bash
npm install       # first time only
npm run dev       # local dev server at http://localhost:5173 — hot reloads on save
npm run build     # production build into dist/
npm run deploy    # build + publish to GitHub Pages (gh-pages branch)
```

---

## How to make the 4 most common updates

### 1. Add / edit / remove a project
Everything lives in **`src/data/projects.js`**. Copy an existing entry, change the
fields, save. That's the whole workflow — categories, filter buttons, cards, and
badges all derive from this file automatically.

- Screenshot: drop a `.png`/`.jpg` in `src/assets/images/`, import it at the top
  of `projects.js`, set `image: YourImport`. Keep images under ~200KB
  (1280px wide is plenty).
- No screenshot yet? Set `image: null` — a styled placeholder renders.
- No live link yet? Set `projectLink: null` — the button hides itself.
- Add `status: 'In development'` for a badge on works-in-progress.

### 2. Update your resume
Replace the PDF at `src/assets/files/Chadwick_Kraus_Resume_2026.pdf`
(keep the same filename and you're done; if you rename it, update the one
import line at the top of `src/pages/Resume.jsx`). The embedded viewer and the
Download button both use this bundled file.

### 3. Update your headshot
Replace `src/assets/images/headshot.jpg` with a new square image (~800×800,
JPG, under ~100KB).

### 4. Update bio, tagline, skills, or contact info
All in **`src/data/profile.js`** — name, tagline, hero tags, about paragraphs,
skill groups, email/phone/links. No component edits needed.

---

## Deploying changes

```bash
# 1. Commit your source changes to main
git add -A
git commit -m "Add new project: <name>"
git push origin main

# 2. Publish the built site
npm run deploy
```

`npm run deploy` builds the app and pushes `dist/` to the `gh-pages` branch,
which GitHub Pages serves. Give it a minute or two, then hard-refresh the live
site (Cmd+Shift+R) to see changes.

> Repo layout note: source lives on `main`, the built site lives on `gh-pages`.
> Never edit `gh-pages` by hand — it gets overwritten on every deploy.

---

## Maintenance rhythm (suggested)

- **When you ship a new Claude Code project**: add it to `projects.js`, deploy. ~5 min.
- **Quarterly**: `npm outdated` → `npm update` → `npm run build` to confirm
  nothing broke → deploy.
- **When the resume changes**: swap the PDF, deploy.

This repo is also a good fit for Claude Code: `claude` in the project root, then
"add a project called X to my portfolio data file and deploy" covers most updates.

---

## Architecture

```
src/
├── data/
│   ├── projects.js     ← EDIT THIS to manage portfolio projects
│   └── profile.js      ← EDIT THIS for bio, skills, contact, tagline
├── components/         NavBar, Footer, ProjectCard (+ per-component CSS)
├── pages/              About (home), Portfolio, Resume, Contact
├── assets/             images/ and files/ (resume PDF)
└── index.css           design tokens — change --forest etc. to retheme
```

- **Routing**: HashRouter (URLs like `/#/portfolio`) — required for GitHub Pages,
  which can't rewrite paths for client-side routers.
- **Base path**: `vite.config.js` sets `base: '/React-Portfolio/'`. If you ever
  rename the repo, change that one line and the `homepage` field in `package.json`.
- **Contact form**: GitHub Pages is static (no server), so the form composes an
  email via `mailto:`. For true in-browser submission, create a free Formspree
  form and swap the `send()` function for a `fetch` POST to your endpoint.

## What changed from v1 (Sept 2023)

- CRA (`react-scripts`, deprecated) → Vite 5
- Bootstrap → custom CSS design system (forest green, Bitter + IBM Plex type)
- Fixed: broken `Project.js` component (lowercase `<project>` rendered nothing),
  `class=` vs `className=` warnings, Bootstrap-4 `ml-2` spacing bug, dead-end
  contact form, resume download pointing at an old Google Drive file
- Projects moved from inline JSX arrays into `src/data/projects.js` with
  category filtering
- New headshot + 2026 resume; images compressed (2MB screenshot → 121KB)
