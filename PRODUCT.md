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
- Many arrive on a deep link — a single project case study — rather than the
  home page, and may never see the racks or the Background section.
- The resume PDF travels into applicant tracking systems and interview loops
  independently of the site.
- Some visitors will click through to a live project and use it. Several
  projects are publicly reachable and are evaluated as running software.

## Capabilities and Constraints

Current surfaces: Home (`/`) — the interactive server room (two 3D racks),
then a projects index, Operations, Background, and a colophon; Projects
(`/portfolio`) with lens filters; per-project case studies
(`/projects/<slug>`); Resume (`/resume`); Contact (`/contact`); and a 404.
Ten projects are published. The Notes section was removed in September 2026;
every old `/notes` URL permanently redirects (see `vercel.json`), and the two
project stories now live on the PetCenza and CoachRhythm case studies.

- **Content is data, not markup.** Projects, racks, stories, and profile facts live in
  `src/data/*.js`. Content work edits data files; components change only for
  structural or design work.
- **Every route is prerendered** by `scripts/prerender.mjs` into a real static
  file with its own title, description, and OG tags. Project pages are derived
  from `projects.js` automatically — a new entry needs a unique `slug` and a
  place in exactly one rack in `src/data/racks.js` (the build fails otherwise).
  Only a brand-new top-level route requires touching the prerender script.
- **Stack:** Vite + React 19 + react-router, no CSS framework and no UI
  library. Plain CSS with tokens in `src/index.css` and a stylesheet per
  component or page.
- **Hosting:** Vercel, git-connected; a push to `main` deploys production. No
  server runtime — the contact form posts to a third-party endpoint
  (Formspree) with a `mailto:` fallback. Analytics is GoatCounter, driven
  per-route from `src/components/Analytics.jsx`.
- **Absolute URLs** (og:url, og:image, sitemap, robots) are duplicated in
  `index.html` and `scripts/prerender.mjs` and must move together.
- Projects are grouped by rack and lens in `src/data/racks.js`: rack A01
  Software & AI (Builder lens) and rack B01 Networks & support (Operations
  lens). TechOps sits in rack B01 and belongs to both lenses. Five units per
  rack is the physical limit of the design.
- Commit activity is public GitHub data only, fetched unauthenticated by
  `scripts/fetch-activity.mjs` into `src/data/activity.json` — a private repo
  can never appear, and a project with no public repo shows as such.
- Every screenshot and demo carries its capture date, and is flagged on the site
  when it predates the project's last update. Demos carry timed captions of what
  is on screen; masked names and simulated data are captioned as such.
- Recruiter conveniences: `/?unit=<slug>` links open the room with one project
  pulled out, and `hire` in the console opens a printable one-page snapshot.
- A light theme is available for bright rooms and shared screens; dark remains
  the default and the brand.
- Shared unit links unfurl with that project's own title and social card.
- A 20-second first-visit tour is offered once per browser and can be skipped.
- Each case study draws its architecture as ordered layers. Every item comes
  from the project's own write-up; the diagram never adds a claim.
- A `/?from=` link (for example from LinkedIn) records which pages that visit opened, as
  anonymous counts only. The value is kept for the session in the browser, never in a
  cookie, and the parameter is removed from the address so shared links stay clean.
- Analytics are GoatCounter pageviews plus anonymous interaction counts (unit
  pulls, port signals, `hire`, copied links, printing, sound, tour). No cookies,
  no personal data.
- A daily job opens a GitHub issue when evidence falls behind a project update,
  and checks every live demo link: one that stops answering is flagged on the
  rack and case study, and in a GitHub issue, until it answers again.
- `/changes` lists what changed each month, generated from public commits only.
  Commit subjects appear as written in the public repositories.
- Case studies print cleanly for interview packets; `?` shows keyboard shortcuts.
- `/status` shows every live demo's recorded uptime; private projects are named as
  not checked rather than shown as up.
- Project filters live in the address, so a recruiter can share "everything Chad
  built with Supabase", and the shared link previews as exactly that.
- `/accessibility` claims only checks that actually run, and lists what they miss.
- An outage on `/status` can carry a short, true note about what happened.
- `/status` also names the hosted services (not build tools) behind more than one live
  demo, so a single outage's reach is honest and visible.
- Search, the rack timeline and `/api/status` expose data the site already had; nothing new
  is collected. The public pack leaves out the phone number.
- The interview pack puts that same proof on paper; `/now` shows what's moving without
  anyone writing status updates, and only Chad writes its note.
- Interview mode gives a recruiter a guided, 4-stop walk whose every claim comes from
  the project data; the weekly digest summarises commits and uptime without new data.
- Production is smoke-checked after each release; failures open a GitHub issue.
- Chad curates the change log (`scripts/changelog-curation.json`), and it has an RSS
  feed. Commit counts always include every commit.
- Each case study offers "Ask about this project", which starts a contact message
  about it. Demos respect the visitor's Save-Data setting.
- Project `status` is one of `Live`, `In progress`, or `Private`, paired with an
  `updated` month. Currency is part of the evidence.

Undecided / open: the old GitHub Pages URL now serves a redirect stub — noindex,
canonical to the live site, and a forwarding script — rather than a stale mirror.
It stays until Search Console shows the old URL dropped or consolidated, and is
not formally retired before then.

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

**Not declared binding:** the visual identity was explicitly left off the
non-negotiable list. The forest-green system, then C2 — Editorial Spatial,
have both been replaced by the Server Room system (Thermal palette, September
2026). DESIGN.md is the current design authority. The principle stands: the visual system is the
current implementation, not a locked brand commitment, and a future redesign
may replace it subject to the parity constraint above.

## Evidence on Hand

Real, in the repository:

- Ten shipped projects with screenshots in `src/assets/images/`: Jarvis,
  Meridian, PetCenza, TechOps Command Center, CoachRhythm, Greenline, HomeLab
  Commander, DeskDaemon, Stack City, Packet & Pine. Most are publicly reachable;
  status and last-updated month are recorded per project.
- Four first-person stories in `src/data/stories.js`, rewritten from the old
  notes in Chad's voice (directing Claude Code, owning the judgement calls):
  two on case studies, two in the home page colophon. Marked draft until Chad
  signs off on the wording.
- Demo recordings in `public/demos/` for Meridian, PetCenza, HomeLab
  Commander, and TechOps Command Center. Jarvis keeps its screenshot only.
- The 2026 resume PDF (`src/assets/files/`), generated from
  `resume-src/resume.data.mjs`.
- A headshot (`src/assets/images/headshot.jpg`) and an OG card in `public/`.
- Certifications: Google IT Support Professional Certificate; Full-Stack Web
  Development, The University of Texas at Austin; NASM CPT + Certified
  Nutrition Coach. NASM is shown on the site only, as "Current" with no date,
  and deliberately left off the resume — the one sanctioned parity exception.
  Training and nutrition are an identifier, never a section or rack of their own.
- Named Rockbot work: a business case covering 2,000+ devices on end-of-life
  firmware and the customer upgrade program built around it; an AI voice model
  for call-center overflow; the escalation team's KPI dashboard; chairing weekly
  bug triage; the onboarding package new escalation engineers train from.

Absent, and not to be invented: testimonials, client logos, press coverage,
traffic or usage numbers, awards, revenue, and team size. Every project now
ships a genuine screenshot; Meridian's is a capture of its Lodge view.

## Product Principles

1. **Answer the screener in the first viewport.** A visitor deciding in under a
   minute should already know what he ships and which roles he fits.
2. **Both halves stay first-class.** Building and operations each keep a full
   surface. Neither is compressed into a caption for the other.
3. **Evidence over adjectives.** Named projects, live links, real failures, and
   dated status carry the argument. Superlatives do not.
4. **Currency is a feature.** Status badges and updated months are part of the
   proof; stale content actively costs credibility with this audience.
5. **Every entry point is a front door.** Deep-linked project case studies are
   judged alone and must stand alone.

## Accessibility & Inclusion

WCAG 2.2 AA is the working standard, checked by axe on every route in both
themes on every push (`.github/workflows/ci.yml`). The recruiter audience skews
toward shared screens, phones, and quick scanning, so legible type sizing,
visible focus, and real contrast are practical requirements, not just compliance
targets. Silent demos carry captions and a written list of what is on screen.
