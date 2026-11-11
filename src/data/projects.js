// ---------------------------------------------------------------------------
// PROJECTS DATA — this is the only file you edit to add, remove, or reorder
// portfolio projects. Copy an existing entry, change the fields, done.
//
// Fields:
//   id          unique number (any order, just don't repeat)
//   slug        URL segment for the project's own page (/projects/<slug>).
//               Must be unique and URL-safe. The prerender step reads this
//               file, so the page, its metadata and its sitemap entry are
//               generated automatically — nothing else to register.
//   title       project name
//   category    'AI & Claude Code' | 'Infrastructure & Ops' | 'Games & Simulation'
//               (add a new category string and it appears as a filter
//               automatically)
//   tagline     3–6 word differentiator shown as a mono strip under the title.
//               This is the scannable bit — what makes THIS project different,
//               not what it is. Keep it short or it wraps.
//   summary     the hook — 1–2 sentences, ALWAYS visible on the card. Keep it
//               short; this is what sets every card's height in the grid.
//   answers     optional "What it answers" paragraph on the case study. Defaults
//               to the summary; set it when the case study should say more.
//   results     optional { text, asOf } outcome line in the case study's Proof section,
//               labelled with its asOf month so a fixed number never reads as live data.
//   details     optional deeper writeup, shown on the project's own page and
//               linked from the card as "Full write-up". Omit it for small
//               projects. Do not repeat the summary — details continues from
//               where the summary stopped.
//   stack       array of short tech labels shown as tags
//   image       import at the top, or null for a styled placeholder
//   demo        optional path to a silent looping MP4 in public/demos/, shown in
//               place of the screenshot on the case study and in the rack sheet
//   architecture [{ layer, items: [...] }, ...] how the project fits together,
//               in order, drawn on its case study. Take every item from the
//               project's own details or stack; never add a claim here.
//   imageDate   'YYYY-MM' the screenshot was captured. Shown on the case study;
//               the build fails without it and warns when it predates `updated`.
//   demoDate    'YYYY-MM' a demo was recorded (required with `demo`)
//   demoChapters [[seconds, text], ...] captions for a demo, first at 0 (required
//               with `demo`). Describe only what is actually on screen.
//   demoNote    optional one-line caption under a demo, e.g. when names are
//               masked or the data shown is simulated. Say so; never imply it's real.
//   projectLink live URL, or null (button hides itself)
//   projectLinkLabel optional button text — defaults to 'View project'. Use
//               'Watch demo' when the link goes to a walkthrough video rather
//               than a running deployment.
//   signIn      true when the live app opens on a sign-in screen. Its link is then
//               labelled as such and the recorded demo becomes the primary action.
//   repoLink    GitHub URL, or null (button hides itself)
//   linkNote    optional one-line explanation shown on the project page when
//               BOTH links are null. Defaults to the private-infrastructure
//               wording; set it when that reason is not the real one.
//   status      short state badge: 'Live' (publicly reachable), 'In progress'
//               (actively built, no public deploy) or 'Private'
//               (deployed, but not publicly linked). Omit to hide the badge.
//   updated      'YYYY-MM' of the last meaningful change. Rendered as
//               "Aug 2026" next to the status so a visitor can tell at a
//               glance whether the work is current.
// ---------------------------------------------------------------------------

import Jarvis from '../assets/images/JarvisDashboard.jpg';
import TechOps from '../assets/images/TechOpsDashboard.jpg';
import CoachRhythm from '../assets/images/CoachRhythmDashboard.jpg';
import HomeLabCommander from '../assets/images/HomeLabCommander.jpg';
import DeskDaemon from '../assets/images/DeskDaemon.jpg';
import StackCity from '../assets/images/StackCity.jpg';
import PacketAndPine from '../assets/images/PacketAndPine.jpg';
// Real capture of Meridian's Lodge view — the spatial map where each cabin is a
// department and the agents move between them.
import Meridian from '../assets/images/MeridianLodge.jpg';
import LeonidaLoft from '../assets/images/LeonidaLoft.jpg';

export const projects = [
  // ---- AI & Claude Code -------------------------------------------------
  {
    id: 12,
    slug: 'jarvis',
    title: 'Jarvis',
    category: 'AI & Claude Code',
    status: 'Private',
    updated: '2026-08',
    tagline: 'Local-first · permission-gated · on-device voice',
    summary:
      'A local-first, permission-gated personal AI assistant running entirely on home infrastructure, with voice interaction, natural-language memory, full calendar and email management, and a searchable knowledge base via RAG.',
    details:
      'Wake-phrase detection runs on the Mac Mini itself, so audio never leaves the machine, and dictation drops straight into the vault inbox. The console is reached over a private Tailscale link rather than an exposed port. Every connector is deny-by-default and requires an explicit permission grant; anything destructive requires human confirmation before it executes, and the audit log and permission state are first-class panels in the interface rather than buried in config. Built end-to-end with Claude Code across a full day-long session, including a real security audit that caught and fixed an OAuth CSRF gap and a container timezone bug.',
    stack: ['FastAPI', 'Docker Compose', 'Chroma (Vector DB)', 'Claude API', 'Google OAuth2', 'Tailscale'],
    architecture: [
      { layer: "Private access", items: ["Console reached over a private Tailscale link", "No port exposed to the internet"] },
      { layer: "On the Mac Mini", items: ["FastAPI services in Docker Compose", "Wake-phrase detection on the device, so audio never leaves it", "Chroma vector database behind the searchable knowledge base"] },
      { layer: "Guardrails", items: ["Every connector is deny-by-default and needs an explicit grant", "Destructive actions wait for human confirmation", "Audit log and permission state are panels in the interface"] },
      { layer: "Outside services", items: ["Google OAuth2 for calendar and email", "Claude API"] },
    ],
    image: Jarvis,
    imageDate: '2026-09',
    projectLink: null, // intentionally not linked — private for security reasons
    repoLink: null, // intentionally not linked — private for security reasons
  },
  {
    id: 14,
    slug: 'meridian',
    title: 'Meridian',
    category: 'AI & Claude Code',
    status: 'In progress',
    updated: '2026-09',
    tagline: 'Nineteen agents · hash-chained audit trail',
    summary:
      'A local-first AI workforce that runs on your own machine. A Chief of Staff reads the request, decides whether it needs specialists, assigns the work with acceptance criteria, and comes back with one answer and a readiness verdict.',
    details:
      'Nineteen specialists each hold their own identity, expertise and memory, and they are allowed to disagree: if Security finds a critical flaw or QA finds a failing test, the Chief of Staff reports NOT READY rather than smoothing it over. Anything that reaches outside the machine, spends money, or cannot be undone stops in an Approval Inbox with the exact payload shown before it runs. Memory carries provenance (where a fact came from, when, and how confident it is), so speculation is never stored as fact. The audit trail is append-only and hash-chained, which means a modified or deleted record breaks the chain and is detectable rather than silent. Everything except model inference stays on the machine, running in Docker across an API, a worker, an MCP server and a web console.',
    stack: ['Next.js 16', 'TypeScript', 'Docker Compose', 'MCP', 'pnpm monorepo', 'Playwright'],
    architecture: [
      { layer: "Web console", items: ["Next.js 16 console on your own machine", "Approval Inbox shows the exact payload before anything runs"] },
      { layer: "Agents", items: ["Nineteen specialists, each with its own identity, expertise and memory", "A Chief of Staff reports NOT READY when Security or QA finds a problem"] },
      { layer: "Local runtime", items: ["Docker: an API, a worker, an MCP server and the web console", "pnpm monorepo"] },
      { layer: "Records", items: ["Memory carries provenance: source, time and confidence", "Append-only, hash-chained audit trail"] },
      { layer: "Outside the machine", items: ["Model inference only; everything else stays local"] },
    ],
    image: Meridian,
    imageDate: '2026-09',
    demo: '/demos/meridian.mp4',
    demoDate: '2026-09',
    demoChapters: [
      [0, "The Lodge view: each cabin is a room agents work in, from Engineering and Research & Analysis to Product & Design and Growth & Revenue."],
      [5, "Agents move around the Lodge in real time."],
      [9, "A live timeline runs along the bottom of the view."],
    ],
    projectLink: null, // local-first — runs on your own machine, no hosted instance
    repoLink: null, // repo is private
    linkNote:
      'There is no hosted instance to link. Meridian is built to run on your own machine, behind your own sign-in, so a public demo would defeat the point.',
  },
  {
    id: 19,
    slug: 'leonida-loft',
    title: 'Leonida Loft',
    category: 'AI & Claude Code',
    status: 'Live',
    updated: '2026-11',
    tagline: 'AI-run video desk · nothing publishes without a human',
    summary:
      "An AI-run video desk where nothing publishes without a human. It researches, writes, fact-checks, narrates and renders short videos on one Mac, then schedules them to YouTube, Instagram, TikTok, Facebook and Threads once I approve them. It runs Leonida Loft, an independent, unofficial GTA VI fan channel.",
    answers:
      "An AI-run video desk where nothing publishes without a human. It researches, writes, fact-checks, narrates and renders short videos on one Mac, then schedules them to YouTube, Instagram, TikTok, Facebook and Threads once I approve them. It runs Leonida Loft, an independent, unofficial GTA VI fan channel, and has published 260+ videos at about 5 a day since September 2026.",
    details:
      "One local Node 24 process serves the dashboard, runs a durable job worker and a scheduler, and keeps everything in a single SQLite file. n8n runs alongside it only for optional watches (source page changes, backups, disk and render health, posting reminders) that raise dashboard alerts; they can't post, approve or write to the database. The desk tracks official sources, keeps a knowledge base where every fact carries its category, confidence, source and status, scores story opportunities, writes scripts, checks every claim, narrates, renders with Remotion and FFmpeg, runs QC and hands over a finished video to approve. The editorial core is deterministic: claims, rights, spoilers and scoring never depend on a model. AI proposes and writes, code decides what passes, and Claude Code is the default AI provider, so writing costs no API charges. Approval is enforced in the database, where the approvals table only accepts a human actor, and every post must pass a preflight check for its slot before it goes out to YouTube, Instagram, TikTok, Facebook or Threads. The dashboard binds to loopback, every change carries a per-page form token, and secrets live in the macOS Keychain, never in the database or the logs. leonidaloft.com is built from the published videos and their sources and served from Cloudflare Pages. Leonida Loft is not affiliated with Rockstar Games or Take-Two Interactive.",
    stack: ['TypeScript', 'Node.js', 'Hono', 'SQLite', 'Remotion', 'FFmpeg', 'Claude Code', 'Cloudflare Pages'],
    architecture: [
      { layer: "Runtime", items: ["One local Node 24 process: dashboard, durable job worker and scheduler", "Everything in a single SQLite file", "n8n alongside it only for optional watches that raise dashboard alerts"] },
      { layer: "Research", items: ["Tracks official sources", "Knowledge base where every fact carries its category, confidence, source and status"] },
      { layer: "Production", items: ["Scores story opportunities, writes scripts and checks every claim", "Narrates, renders with Remotion and FFmpeg, and runs QC"] },
      { layer: "Editorial core", items: ["Claims, rights, spoilers and scoring never depend on a model", "Claude Code is the default AI provider"] },
      { layer: "Approval", items: ["The approvals table only accepts a human actor", "Every post passes a preflight check for its slot"] },
      { layer: "Security", items: ["Dashboard bound to loopback, with a per-page form token on every change", "Secrets in the macOS Keychain, never in the database or the logs"] },
      { layer: "Publishing", items: ["YouTube, Instagram, TikTok, Facebook and Threads", "leonidaloft.com on Cloudflare Pages"] },
    ],
    image: LeonidaLoft,
    imageDate: '2026-11',
    projectLink: 'https://leonidaloft.com/',
    projectLinkLabel: 'Visit leonidaloft.com',
    results: { text: '260+ videos published since September 15, 2026, at about 5 a day, across YouTube, Instagram, TikTok, Facebook and Threads.', asOf: 'November 2026' },
    repoLink: null, // repo is private
  },
  {
    id: 13,
    slug: 'techops-command-center',
    title: 'TechOps Command Center',
    category: 'AI & Claude Code',
    status: 'Live',
    updated: '2026-08',
    tagline: 'One model drives every panel',
    summary:
      'An interactive incident-response simulator. Trigger a realistic outage across a simulated fifteen-service infrastructure, then investigate the logs, metrics and dependency map to find the root cause and restore service.',
    details:
      'Everything on screen comes from one underlying model, so the story always holds together. The charts, the logs, the dependency map and the customer complaints agree with each other because they are all computed from the same source rather than written separately. Failures spread the way they do in real systems: losing a cache makes things slow, losing a database makes them stop. One rule produces both, with no script per scenario. Nothing is random either, so an incident unfolds identically every time. That’s also what lets an investigation survive a page refresh while storing almost nothing. Eight scenarios each teach a different shape of problem, and a wrong answer explains which evidence rules it out instead of just marking you incorrect. An optional guided mode walks newcomers through it, and any finished incident can be replayed second by second to watch the failure spread. Backed by 187 automated tests that run on every push.',
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS v4', 'Recharts', 'Vitest', 'Playwright'],
    architecture: [
      { layer: "One model", items: ["A single deterministic model of fifteen services", "Charts, logs, dependency map and complaints all computed from it"] },
      { layer: "Failure rules", items: ["Failures spread by dependency: a lost cache slows, a lost database stops", "One rule for every scenario, no per-scenario scripts"] },
      { layer: "Scenarios", items: ["Eight scenarios, each a different shape of problem", "Wrong answers explain which evidence rules them out"] },
      { layer: "Interface", items: ["Next.js 16, Tailwind CSS v4, Recharts", "Optional guided mode", "Second-by-second replay of finished incidents"] },
      { layer: "Verification", items: ["187 automated tests (Vitest, Playwright) on every push"] },
    ],
    image: TechOps,
    imageDate: '2026-08',
    demo: '/demos/techops-command-center.mp4',
    demoDate: '2026-09',
    demoChapters: [
      [0, "Simulation Center: eight incident scenarios, each tagged with severity and difficulty."],
      [5, "Each scenario lists the expected impact, customer impact and affected systems before you start it."],
    ],
    projectLink: 'https://techops-command-center.vercel.app/',
    repoLink: 'https://github.com/chadkraus87/techops-command-center',
  },
  {
    id: 1,
    slug: 'coachrhythm',
    title: 'CoachRhythm',
    category: 'AI & Claude Code',
    status: 'Live',
    updated: '2026-08',
    tagline: 'Safety filter runs before the model',
    summary:
      'A programming assistant for personal trainers that turns a client intake (injuries, available equipment, and goals) into a complete training plan.',
    details:
      'Exercises are screened against each client\'s logged injuries by a deterministic filter that runs before the model is prompted, so the AI only ever programs from an already-filtered pool. Safety never depends on the model following instructions. Its output then clears a second deterministic pass that re-checks movement balance, pull-to-push volume, recovery spacing, rep ranges and progression, with no LLM anywhere in the verification path; a failed check feeds one automatic retry, and plans that still fail are stored as flagged drafts rather than presented as finished. Trainers work from a 543-exercise library tagged by movement pattern, equipment and contraindication, extensible with their own movements. Multi-tenant isolation is enforced in Postgres row-level security and proven by a two-tenant test suite rather than assumed.',
    stack: ['Next.js 15', 'TypeScript', 'Supabase (Postgres RLS)', 'Claude API', 'Playwright'],
    architecture: [
      { layer: "Trainer app", items: ["Next.js 15 + TypeScript", "Logged injuries per client", "543-exercise library tagged by movement pattern, equipment and contraindication"] },
      { layer: "Safety filter", items: ["Deterministic contraindication filter runs before the model", "The model only sees an already-filtered pool"] },
      { layer: "Generation", items: ["Claude API programs from the filtered pool"] },
      { layer: "Verification", items: ["Deterministic checks: movement balance, pull-to-push volume, recovery spacing, rep ranges, progression", "One automatic retry; plans that still fail save as flagged drafts"] },
      { layer: "Data", items: ["Supabase Postgres with row-level security per tenant", "Two-tenant isolation test suite"] },
    ],
    image: CoachRhythm,
    imageDate: '2026-08',
    demo: '/demos/coachrhythm.mp4',
    demoNote: "From a real coaching account. Client names other than Chad's are masked.",
    demoDate: '2026-09',
    demoChapters: [
      [0, "Gym floor dashboard: active clients, plans built and the QA pass rate. Client names are masked."],
      [5, "Exercise library by training category; custom exercises carry safety tags."],
      [13, "Build a plan: choose a client and workout type. Unsafe and unavailable exercises are removed before generation."],
    ],
    projectLink: 'https://coachrhythm.vercel.app/',
    projectLinkLabel: 'Live app (sign-in required)',
    signIn: true,
    repoLink: 'https://github.com/chadkraus87/traincraft',
  },

  // ---- Infrastructure & Ops ---------------------------------------------
  {
    id: 15,
    slug: 'homelab-commander',
    title: 'HomeLab Commander',
    category: 'Infrastructure & Ops',
    status: 'Live',
    updated: '2026-08',
    tagline: 'Hosted demo · local-first ops console',
    summary:
      'A local-first operations console for a homelab: discover devices, watch services, map the network, and work an incident from first alert to root cause without leaving one screen.',
    details:
      'The hosted demo is deliberately not the real thing, and says so: Vercel cannot reach a visitor\'s private network, so the public build runs a complete simulated lab on deterministic telemetry, keeps every edit inside that browser tab, and never writes to a shared database. Run it locally and it gains the parts that must touch your own network: discovery across approved ranges only, read-only Docker inventory, provider health, TLS expiry and Wake-on-LAN, each behind an explicit boundary rather than enabled by default. A guided outage scenario walks an incident across the command center and device views and can be replayed through to recovery, which makes it demonstrable without an audience needing a homelab of their own. Accessibility is checked in CI with axe rather than by eye.',
    stack: ['Next.js', 'TypeScript', 'React Flow', 'Recharts', 'Playwright + axe', 'Docker'],
    architecture: [
      { layer: "Hosted demo", items: ["Complete simulated lab on deterministic telemetry", "Edits stay in the browser tab; no shared database"] },
      { layer: "Local mode", items: ["Discovery across approved ranges only", "Read-only Docker inventory, provider health, TLS expiry, Wake-on-LAN", "Each behind an explicit boundary, off by default"] },
      { layer: "Interface", items: ["Next.js + TypeScript", "React Flow network map, Recharts telemetry"] },
      { layer: "Incident flow", items: ["Guided outage across the command center and device views", "Replayable through to recovery"] },
      { layer: "Verification", items: ["Playwright with axe accessibility checks in CI"] },
    ],
    image: HomeLabCommander,
    imageDate: '2026-09',
    demo: '/demos/homelab-commander.mp4',
    demoDate: '2026-09',
    demoChapters: [
      [0, "Hosted showcase running a simulated outage, with a guided tour that starts at the command center."],
      [7, "Network health, active alerts and recent activity for the simulated lab."],
    ],
    projectLink: 'https://home-lab-commander.vercel.app/?scenario=outage&tour=1',
    projectLinkLabel: 'Open demo',
    repoLink: 'https://github.com/chadkraus87/home-lab-commander',
  },
  {
    id: 16,
    slug: 'deskdaemon',
    title: 'Desk Daemon',
    category: 'AI & Claude Code',
    status: 'Live',
    updated: '2026-11',
    tagline: 'The IT guy for your AI · checked before trusted',
    summary:
      "The IT guy for your AI. I make real builds with Claude and Claude Code and check what they can touch before I trust them. I test tools, skills and repos before I recommend them, and I build things for your own home, family and money, like who's on your Wi-Fi or whether your stuff is really backed up.",
    answers:
      "Most AI advice skips the question an IT person asks first: what can this touch, and should I trust it? Desk Daemon is where I answer that. I'm a network IT specialist, and I make real builds with Claude and Claude Code, checking what each tool can reach before I trust it. That means testing tools, skills and repos before I recommend them, and building things for your own home, family and money, like who's on your Wi-Fi or whether your stuff is really backed up. The site holds beginner tutorials, free guides, honest tool reviews and the builds behind the videos.",
    details:
      "Astro with plain CSS, one accent colour, and contrast measured against WCAG 2.1 AA rather than assumed. Every outbound link goes through a /go/<slug> redirect that can only reach destinations listed in one file, and clicks are counted server-side with no cookies. The Content-Security-Policy allows scripts and styles from the site's own origin only (no inline scripts, no CDN, no unsafe-*), which is why GSAP is vendored rather than loaded. Motion is CSS and native view transitions, with GSAP only on the home page and the gear filter, and every effect falls back cleanly with JavaScript off, reduced motion on, or GSAP blocked. Email signup sits behind a provider-agnostic function with a honeypot and a rate limit, and photos have their GPS metadata stripped at build. 190 Vitest unit tests and 385 Playwright tests, including axe accessibility scans, run in CI on every push to main and every pull request.",
    stack: ['Astro', 'TypeScript', 'Plain CSS', 'GSAP', 'Vitest', 'Playwright + axe', 'Vercel'],
    architecture: [
      { layer: "Build", items: ["Astro with plain CSS and one accent colour", "Contrast measured against WCAG 2.1 AA, not assumed", "GSAP vendored, because the CSP allows no CDN"] },
      { layer: "Outbound links", items: ["/go/<slug> redirects, limited to destinations listed in one file", "Clicks counted server-side, with no cookies"] },
      { layer: "Content-Security-Policy", items: ["Scripts and styles from the site's own origin only", "No inline scripts, no CDN, no unsafe-*"] },
      { layer: "Motion", items: ["CSS and native view transitions", "GSAP only on the home page and the gear filter", "Every effect falls back with JavaScript off, reduced motion on, or GSAP blocked"] },
      { layer: "Signup and photos", items: ["Provider-agnostic function with a honeypot and a rate limit", "GPS metadata stripped from photos at build"] },
      { layer: "Tests", items: ["190 Vitest unit tests", "385 Playwright tests, including axe accessibility scans", "Both run in CI on every push to main and every pull request"] },
      { layer: "Hosting", items: ["Vercel"] },
    ],
    image: DeskDaemon,
    imageDate: '2026-11',
    projectLink: 'https://deskdaemon.com/',
    repoLink: null, // repo is private
  },

  // ---- Games & Simulation -----------------------------------------------
  {
    id: 17,
    slug: 'stack-city',
    title: 'Stack City',
    category: 'Games & Simulation',
    status: 'Live',
    updated: '2026-08',
    tagline: 'Architecture as a city-builder · no accounts',
    summary:
      'Software architecture as a city-building game. Every building is a real infrastructure concept, every glowing packet is a user request, and each placement moves capacity, latency, availability, operating cost and user satisfaction.',
    details:
      'Traffic arrives in waves and the city either holds or it does not. Add a cache and latency and database pressure visibly fall, skip a load balancer and the queue backs up in front of you. Missions set concrete targets, like sustaining a request rate under an error budget. An optional six-step guided first run explains telemetry, construction, routing and bottlenecks before the opening wave. There are no accounts, API keys, ads or paid services: state is local-first, so the game opens and plays immediately. Built with Codex.',
    stack: ['Next.js', 'React 19', 'TypeScript', 'Drizzle', 'Tailwind CSS'],
    architecture: [
      { layer: "Simulation", items: ["Traffic arrives in waves", "Caches, load balancers and databases change latency, pressure and queues"] },
      { layer: "Missions", items: ["Concrete targets, like a request rate under an error budget", "Optional six-step guided first run"] },
      { layer: "State", items: ["Local-first: no accounts, API keys, ads or paid services"] },
      { layer: "Stack", items: ["Next.js, React 19, TypeScript", "Drizzle, Tailwind CSS"] },
    ],
    image: StackCity,
    imageDate: '2026-09',
    projectLink: 'https://stack-city-eight.vercel.app',
    projectLinkLabel: 'Play live',
    repoLink: 'https://github.com/chadkraus87/stack-city',
  },
  {
    id: 18,
    slug: 'packet-and-pine',
    title: 'Packet & Pine',
    category: 'Games & Simulation',
    status: 'Live',
    updated: '2026-11',
    tagline: '62 missions · networking taught through play',
    // From Chad's current description (November 2026); the older write-up with its
    // mission counts was retired with it.
    summary:
      'Browser game that turns real networking and infrastructure concepts into a 62-mission campaign, with illustrated and 3D gameplay and guided lessons. Missions follow the same loop as real troubleshooting: observe, form a hypothesis, make a safe change, verify, and roll back. Built with Codex, with local-first saves, responsive accessibility, security hardening, and comprehensive automated testing.',
    stack: ['TypeScript', 'Three.js', 'Vite', 'Playwright', 'Vercel'],
    architecture: [
      { layer: "Campaign", items: ["62 missions built on real networking and infrastructure concepts", "Illustrated and 3D gameplay with guided lessons"] },
      { layer: "Troubleshooting loop", items: ["Observe, form a hypothesis, make a safe change", "Verify, and roll back"] },
      { layer: "Engineering", items: ["Local-first saves", "Responsive accessibility and security hardening", "Comprehensive automated testing (Playwright)"] },
      { layer: "Platform", items: ["TypeScript, Three.js and Vite", "Deployed on Vercel"] },
    ],
    image: PacketAndPine,
    imageDate: '2026-11',
    demo: '/demos/packet-and-pine.mp4',
    demoDate: '2026-11',
    demoChapters: [
      [0, "Firewatch Ridge in the illustrated view, with the mission \"The Signal Beyond the Ridge\" open."],
      [1, "The Packet Scope reads the ridge relay: degraded, with a poor −88 dBm Wi-Fi signal."],
      [4, "A beacon sweep finds the strongest carrier at 38° NE, with 34% packet loss."],
      [10, "At the dish, the old paint mark (22° N) is tried first. The signal rises briefly, then fades."],
      [13, "The measured carrier, 38° NE, is chosen instead."],
      [15, "The Scope checks the ridge packet path again."],
      [18, "Reply from 192.168.30.2 in 24 ms with 0% packet loss, and the ridge is back in the mesh."],
    ],
    demoNote: 'Recorded on a local build, from a save parked at the start of this mission.',
    projectLink: 'https://packet-and-pine.vercel.app',
    projectLinkLabel: 'Play live',
    repoLink: null, // repo is private
  },
];
