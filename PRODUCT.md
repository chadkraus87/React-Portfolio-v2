# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary visitor is a hiring manager or technical recruiter evaluating
Chadwick (Chad) Kraus as a candidate. They arrive mid-screen — from a resume,
a LinkedIn profile, a referral, or a job application — with a specific role in
mind and limited time, and they are deciding whether to advance him to a
conversation.

Two role families matter equally, and the site must serve both without
subordinating either:

- **Builder roles** — AI/software engineering, AI tooling, applied product work.
  These visitors weigh the ten shipped projects and the writing.
- **Operations roles** — Tier 2/3 escalation engineering, QA operations,
  technical operations, technical support leadership. These visitors weigh the
  Rockbot record and the resume.

Secondary visitors: peers and other builders who arrive via a project rather
than via a job.

## Product Purpose

A personal portfolio that gets Chad through a hiring screen. Success is
explicitly **advancement, not contact**: the visitor reads enough to pass him
forward in a process they were already running. A direct email is a bonus, not
the measure. The site therefore has to answer a screener's questions faster
than they can form them — what has he shipped, is it real, is it current, and
which of the two role families is he credible in.

## Positioning

The hybrid is the pitch, not a compromise between two half-careers. The claim
is that operations work and building work compound: years of Tier 2/3
escalations teach which failure modes are worth engineering against, and
shipping the software teaches what Engineering is actually weighing when he
escalates.

That claim is load-bearing in the work itself, and the projects are the
evidence for it — access enforced in Postgres row-level security rather than in
the UI, deterministic safety filters that run before a model rather than
instructions given to one, audit trails, explicit confirmation on destructive
actions, real test suites. A portfolio of comparable projects built by someone
without the support background could not truthfully make the same argument.

Neither half is supporting material for the other. Any design or content change
that reduces one to a footnote breaks the positioning.

## Operating Context

- Visitors are mid-evaluation and often on a shared screen or a phone between
  meetings. Scanning precedes reading.
- Many arrive on a deep link — a single project page or note — rather than the
  home page, and may never see the About page.
- The resume PDF travels into applicant tracking systems and interview loops
  independently of the site.
- Some visitors will click through to a live project and use it. Several
  projects are publicly reachable and are evaluated as running software.

## Capabilities and Constraints

Current surfaces: About (`/`, the home route), Portfolio (`/portfolio`) with
category filters, per-project pages (`/projects/<slug>`), Resume (`/resume`),
Contact (`/contact`), and Writing (`/notes`, `/notes/<slug>`), which appears
only once at least one note is published. Ten projects and four notes are
published today. A 404 route exists.

- **Content is data, not markup.** Projects, notes, and profile facts live in
  `src/data/*.js`. Content work edits data files; components change only for
  structural or design work.
- **Every route is prerendered** by `scripts/prerender.mjs` into a real static
  file with its own title, description, and OG tags. Project and note pages are
  derived from the data files automatically — a new entry needs only a unique
  `slug`. Only a brand-new top-level route requires touching the prerender
  script.
- **Stack:** Vite + React 19 + react-router, no CSS framework and no UI
  library. Plain CSS with tokens in `src/index.css` and a stylesheet per
  component or page.
- **Hosting:** Vercel, git-connected; a push to `main` deploys production. No
  server runtime — the contact form posts to a third-party endpoint
  (Formspree) with a `mailto:` fallback. Analytics is GoatCounter, driven
  per-route from `src/components/Analytics.jsx`.
- **Absolute URLs** (og:url, og:image, sitemap, robots) are duplicated in
  `index.html` and `scripts/prerender.mjs` and must move together.
- Project categories today are `AI & Claude Code`, `Infrastructure & Ops`, and
  `Games & Simulation`; the filter row is generated from the data, so category
  strings must be reused exactly rather than re-typed.
- Project `status` is one of `Live`, `In progress`, or `Private`, paired with an
  `updated` month. Currency is part of the evidence.

Undecided / open: the old GitHub Pages URL still serves a stale mirror and has
not been formally retired.

## Brand Commitments

Three constraints are binding on all future work:

1. **Resume/site parity.** The site and the resume PDF must tell the same story
   with the same facts. Changing one requires changing the other. The PDF is
   generated from `resume-src/resume.data.mjs`, which also produces the DOCX, so
   the two documents cannot drift from each other — but they can drift from the
   site, and that is the failure to prevent.
2. **No fabricated claims.** Every metric, project, certification, credential,
   and testimonial must be real. No invented numbers, logos, customers, press,
   or quotes to fill out a layout. A section with no true content is left out.
3. **Private-project link policy.** Some projects intentionally ship without a
   repo or live link (Jarvis is private for security). Links are added only when
   Chad supplies them — never inferred, guessed, or restored from a previous
   version.

The name and voice are established: first person, plain, specific, and
unembellished; failures are described as readily as successes.

**Not declared binding:** the incumbent forest-green visual identity
(pine/forest/moss with Bitter + IBM Plex, matched to the resume PDF) was
explicitly left off the non-negotiable list. It is the incumbent implementation
and current design authority, not a locked brand commitment — a future redesign
may replace it, subject to the parity constraint above.

## Evidence on Hand

Real, in the repository:

- Ten shipped projects with screenshots in `src/assets/images/`: Jarvis,
  Meridian, PetCenza, TechOps Command Center, CoachRhythm, Greenline, HomeLab
  Commander, DeskDaemon, Stack City, Packet & Pine. Most are publicly reachable;
  status and last-updated month are recorded per project.
- Four published notes in `src/data/notes.js` — first-person technical
  write-ups of real bugs and real design decisions.
- The 2026 resume PDF (`src/assets/files/`), generated from
  `resume-src/resume.data.mjs`.
- A headshot (`src/assets/images/headshot.jpg`) and an OG card in `public/`.
- Certifications: Google IT Support Professional Certificate; Full-Stack Web
  Development, The University of Texas at Austin; NASM CPT + Certified
  Nutrition Coach.
- Named Rockbot work: a business case covering 2,000+ devices on end-of-life
  firmware and the customer upgrade program built around it; an AI voice model
  for call-center overflow; the escalation team's KPI dashboard; chairing weekly
  bug triage; the onboarding package new escalation engineers train from.

Absent, and not to be invented: testimonials, client logos, press coverage,
traffic or usage numbers, awards, revenue, and team size. Meridian has a
placeholder title card rather than a real screenshot.

## Product Principles

1. **Answer the screener in the first viewport.** A visitor deciding in under a
   minute should already know what he ships and which roles he fits.
2. **Both halves stay first-class.** Building and operations each keep a full
   surface. Neither is compressed into a caption for the other.
3. **Evidence over adjectives.** Named projects, live links, real failures, and
   dated status carry the argument. Superlatives do not.
4. **Currency is a feature.** Status badges and updated months are part of the
   proof; stale content actively costs credibility with this audience.
5. **Every entry point is a front door.** Deep-linked project and note pages are
   judged alone and must stand alone.

## Accessibility & Inclusion

No project-specific standard has been established. The recruiter audience skews
toward shared screens, phones, and quick scanning, so legible type sizing,
visible focus, and real contrast are practical requirements rather than
compliance targets.
