// ---------------------------------------------------------------------------
// PROJECTS DATA — this is the only file you edit to add, remove, or reorder
// portfolio projects. Copy an existing entry, change the fields, done.
//
// Fields:
//   id          unique number (any order, just don't repeat)
//   slug        URL segment for the project's own page (/projects/<slug>).
//               Must be unique and URL-safe. ALSO add it to the `projects`
//               array in scripts/prerender.mjs or the page will 404 for
//               crawlers and lose its per-page metadata.
//   title       project name
//   category    'AI & Claude Code' | 'Infrastructure & Ops' | 'Games & Simulation'
//               (add a new category string and it appears as a filter
//               automatically)
//   tagline     3–6 word differentiator shown as a mono strip under the title.
//               This is the scannable bit — what makes THIS project different,
//               not what it is. Keep it short or it wraps.
//   summary     the hook — 1–2 sentences, ALWAYS visible on the card. Keep it
//               short; this is what sets every card's height in the grid.
//   details     optional deeper writeup, hidden behind a "More detail" toggle.
//               Omit it entirely for small projects. Do not repeat the summary
//               here — details continues from where the summary stopped.
//   stack       array of short tech labels shown as tags
//   image       import at the top, or null for a styled placeholder
//   projectLink live URL, or null (button hides itself)
//   projectLinkLabel optional button text — defaults to 'View project'. Use
//               'Watch demo' when the link goes to a walkthrough video rather
//               than a running deployment.
//   repoLink    GitHub URL, or null (button hides itself)
//   status      short state badge: 'Live' (publicly reachable), 'In progress'
//               (actively built, no public deploy) or 'Private'
//               (deployed, but not publicly linked). Omit to hide the badge.
//   updated      'YYYY-MM' of the last meaningful change. Rendered as
//               "Aug 2026" next to the status so a visitor can tell at a
//               glance whether the work is current.
// ---------------------------------------------------------------------------

import Jarvis from '../assets/images/JarvisDashboard.jpg';
import PetCenza from '../assets/images/PetCenzaDashboard.jpg';
import TechOps from '../assets/images/TechOpsDashboard.jpg';
import CoachRhythm from '../assets/images/CoachRhythmDashboard.jpg';
import Greenline from '../assets/images/GreenlineDashboard.jpg';
import HomeLabCommander from '../assets/images/HomeLabCommander.jpg';
import DeskDaemon from '../assets/images/DeskDaemon.jpg';
import StackCity from '../assets/images/StackCity.jpg';
import PacketAndPine from '../assets/images/PacketAndPine.jpg';
// Placeholder title card — swap for a real screenshot when one exists.
import Meridian from '../assets/images/Meridian.jpg';

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
      'A local-first, permission-gated personal AI assistant running entirely on home infrastructure — voice interaction, natural-language memory, full calendar and email management, and a searchable knowledge base via RAG.',
    details:
      'Wake-phrase detection runs on the Mac Mini itself, so audio never leaves the machine, and dictation drops straight into the vault inbox. The console is reached over a private Tailscale link rather than an exposed port. Every connector is deny-by-default and requires an explicit permission grant; anything destructive requires human confirmation before it executes, and the audit log and permission state are first-class panels in the interface rather than buried in config. Built end-to-end with Claude Code across a full day-long session, including a real security audit that caught and fixed an OAuth CSRF gap and a container timezone bug.',
    stack: ['FastAPI', 'Docker Compose', 'Chroma (Vector DB)', 'Claude API', 'Google OAuth2', 'Tailscale'],
    image: Jarvis,
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
      'Nineteen specialists each hold their own identity, expertise and memory, and they are allowed to disagree: if Security finds a critical flaw or QA finds a failing test, the Chief of Staff reports NOT READY rather than smoothing it over. Anything that reaches outside the machine, spends money, or cannot be undone stops in an Approval Inbox with the exact payload shown before it runs. Memory carries provenance — where a fact came from, when, and how confident it is — so speculation is never stored as fact. The audit trail is append-only and hash-chained, which means a modified or deleted record breaks the chain and is detectable rather than silent. Everything except model inference stays on the machine, running in Docker across an API, a worker, an MCP server and a web console.',
    stack: ['Next.js 16', 'TypeScript', 'Docker Compose', 'MCP', 'pnpm monorepo', 'Playwright'],
    image: Meridian,
    projectLink: null, // local-first — runs on your own machine, no hosted instance
    repoLink: null, // repo is private
  },
  {
    id: 2,
    slug: 'petcenza',
    title: 'PetCenza',
    category: 'AI & Claude Code',
    status: 'Live',
    updated: '2026-08',
    tagline: 'Offline-first · sharing enforced in Postgres',
    summary:
      'A household pet health record built to answer one question the moment it opens: does anything need attention today? Tracks boosters, medication refills, vet visits, and weight history across every pet in the home, then rolls the day into a single medication round — what to give, to whom, right now.',
    details:
      'Dosing is derived from the frequency text transcribed off a prescription label, so it reads plain English, the Latin abbreviations vets still write (BID, TID, QID) and interval notation like q12h; anything it cannot place is surfaced in its own section rather than dropped, because a missed dose matters more than a tidy list. Sharing is enforced in the database rather than the client — row-level security on all 26 tables, per-pet viewer/editor/co-owner roles, TOTP multi-factor auth, and magic-byte upload validation that quarantines mismatched uploads. Vets get a separate read-only link that expires and needs no account. Security review ran as part of the build rather than a pass at the end, and it drove concrete hardening: the rate limiter moved onto a spoof-resistant header after live testing proved the obvious one rotated per request and defeated the limit entirely, and SECURITY DEFINER helper functions were introduced to break recursive RLS policy evaluation. It is offline-first by design — a persisted query cache serves reads with no connection, and an IndexedDB outbox replays mutations once the device reconnects. Backed by 101 unit tests, 6 Playwright E2E specs, and a SQL-level RLS isolation suite. Built with Claude Code.',
    stack: [
      'React 18 + TypeScript',
      'Supabase (Postgres RLS)',
      'TanStack Query',
      'Deno Edge Functions',
      'Zod + React Hook Form',
      'PWA / Offline-first',
      'Vitest + Playwright',
    ],
    image: PetCenza,
    projectLink: 'https://pawchart-zeta.vercel.app/',
    repoLink: 'https://github.com/chadkraus87/petcenza',
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
      'Everything on screen comes from one underlying model, so the story always holds together — the charts, the logs, the dependency map and the customer complaints agree with each other because they are all computed from the same source rather than written separately. Failures spread the way they do in real systems: losing a cache makes things slow, losing a database makes them stop, all from a single rule rather than a script per scenario. Nothing is random either, so an incident unfolds identically every time — which is also what lets an investigation survive a page refresh while storing almost nothing. Eight scenarios each teach a different shape of problem, and a wrong answer explains which evidence rules it out instead of just marking you incorrect. An optional guided mode walks newcomers through it, and any finished incident can be replayed second by second to watch the failure spread. Backed by 187 automated tests that run on every push.',
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS v4', 'Recharts', 'Vitest', 'Playwright'],
    image: TechOps,
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
      'A programming assistant for personal trainers that turns a client intake — injuries, available equipment, and goals — into a complete training plan.',
    details:
      'Exercises are screened against each client\'s logged injuries by a deterministic filter that runs before the model is prompted, so the AI only ever programs from an already-filtered pool — safety never depends on the model following instructions. Its output then clears a second deterministic pass that re-checks movement balance, pull-to-push volume, recovery spacing, rep ranges and progression, with no LLM anywhere in the verification path; a failed check feeds one automatic retry, and plans that still fail are stored as flagged drafts rather than presented as finished. Trainers work from a 543-exercise library tagged by movement pattern, equipment and contraindication, extensible with their own movements. Multi-tenant isolation is enforced in Postgres row-level security and proven by a two-tenant test suite rather than assumed. Built end-to-end with Claude Code.',
    stack: ['Next.js 15', 'TypeScript', 'Supabase (Postgres RLS)', 'Claude API', 'Playwright'],
    image: CoachRhythm,
    projectLink: 'https://coachrhythm.vercel.app/',
    repoLink: 'https://github.com/chadkraus87/traincraft',
  },
  {
    id: 3,
    slug: 'greenline',
    title: 'Greenline',
    category: 'AI & Claude Code',
    status: 'Live',
    updated: '2026-08',
    tagline: 'Daily cash runway · offline PWA',
    summary:
      'A private monthly budget built around the question that actually matters mid-month: what is genuinely left to spend? Projects a daily cash runway from scheduled bills and income, then scores the month as you spend against it.',
    details:
      'Bills, income, expenses, budgets, goals, reserves and debt each keep their own ledger, and the calendar puts every scheduled flow on a date so a shortfall shows up weeks before it lands — receipts scan straight into an expense. Data is scoped per account by row-level security across 12 tables, and the deployment ships a real CSP with HSTS and frame-deny rather than framework defaults. Installable and offline-capable as a PWA. Built with Claude Code.',
    stack: ['React + TypeScript', 'Supabase (Postgres RLS)', 'Vite', 'Recharts', 'PWA / Offline', 'Vitest + Playwright'],
    image: Greenline,
    projectLink: 'https://greenline-chadwick-kraus-projects.vercel.app/',
    repoLink: 'https://github.com/chadkraus87/greenline',
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
      'A local-first operations console for a homelab — discover devices, watch services, map the network, and work an incident from first alert to root cause without leaving one screen.',
    details:
      'The hosted demo is deliberately not the real thing, and says so: Vercel cannot reach a visitor\'s private network, so the public build runs a complete simulated lab on deterministic telemetry, keeps every edit inside that browser tab, and never writes to a shared database. Run it locally and it gains the parts that must touch your own network — discovery across approved ranges only, read-only Docker inventory, provider health, TLS expiry and Wake-on-LAN — each behind an explicit boundary rather than enabled by default. A guided outage scenario walks an incident across the command center and device views and can be replayed through to recovery, which makes it demonstrable without an audience needing a homelab of their own. Accessibility is checked in CI with axe rather than by eye.',
    stack: ['Next.js', 'TypeScript', 'React Flow', 'Recharts', 'Playwright + axe', 'Docker'],
    image: HomeLabCommander,
    projectLink: 'https://home-lab-commander.vercel.app/?scenario=outage&tour=1',
    projectLinkLabel: 'Open demo',
    repoLink: 'https://github.com/chadkraus87/home-lab-commander',
  },
  {
    id: 16,
    slug: 'deskdaemon',
    title: 'DeskDaemon',
    category: 'Infrastructure & Ops',
    status: 'Live',
    updated: '2026-09',
    tagline: 'Astro · zero client-side JavaScript',
    summary:
      'The link-in-bio and gear site for @deskdaemon — the workstation, the home lab, and the tools behind the videos. Built deliberately without a client-side framework.',
    details:
      'Astro with static output by default; exactly three routes render on demand — the home page, so the email signup still returns a real result with JavaScript disabled, the /go/[slug] redirects, and the subscribe handler. Everything else is prerendered at build time. Styling is plain CSS with custom properties: no Tailwind, no UI kit. Inter and JetBrains Mono are self-hosted as latin-subset woff2 rather than pulled from a font CDN, so a visitor loads the page without a single third-party request.',
    stack: ['Astro', 'TypeScript', 'Plain CSS', 'Vercel'],
    image: DeskDaemon,
    projectLink: 'https://deskdaemon.com',
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
      'Traffic arrives in waves and the city either holds or it does not — add a cache and latency and database pressure visibly fall, skip a load balancer and the queue backs up in front of you. Missions set concrete targets, like sustaining a request rate under an error budget, and an optional six-step guided first run explains telemetry, construction, routing and bottlenecks before the opening wave. There are no accounts, API keys, ads or paid services: state is local-first, so the game opens and plays immediately.',
    stack: ['Next.js', 'React 19', 'TypeScript', 'Drizzle', 'Tailwind CSS'],
    image: StackCity,
    projectLink: 'https://stack-city-eight.vercel.app',
    projectLinkLabel: 'Play live',
    repoLink: 'https://github.com/chadkraus87/stack-city',
  },
  {
    id: 18,
    slug: 'packet-and-pine',
    title: 'Packet & Pine',
    category: 'Games & Simulation',
    status: 'In progress',
    updated: '2026-09',
    tagline: 'Fully 3D · networking taught through play',
    summary:
      'A fully 3D cozy networking adventure for the browser. Play a Network Keeper across twenty explorable areas, troubleshoot friendly outages, run a cabin homelab, and connect communities without flattening their security boundaries.',
    details:
      'Thirty multi-step story missions, four wireless-planning missions and forty-six evidence-based chapter decisions sit on top of a real systems model — a cable, power, thermal and incident homelab, plus a visual topology and capacity lab. Educators get visual challenge authoring, signed challenge packs, deterministic classroom replay and aggregate-only exports, so a class can be graded without collecting anything personal. Progress is local-first and anonymous play is the default; optional cloud snapshots are encrypted in the browser before they leave it, and passkeys are an opt-in authorization layer rather than a login wall. Renders with streamed distance-based LOD, GPU-instanced foliage, dynamic lighting and spatial audio, with keyboard, mouse, gamepad and touch controls.',
    stack: ['Three.js', 'TypeScript', 'Vite', 'WebAuthn / Passkeys', 'Vercel Blob', 'Vitest'],
    image: PacketAndPine,
    projectLink: null, // no public deployment yet
    repoLink: null, // repo is private
  },
];
