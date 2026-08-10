// ---------------------------------------------------------------------------
// PROJECTS DATA — this is the only file you edit to add, remove, or reorder
// portfolio projects. Copy an existing entry, change the fields, done.
//
// Fields:
//   id          unique number (any order, just don't repeat)
//   title       project name
//   category    'AI & Claude Code' | 'Full-Stack' | 'Foundational'
//               (add a new category string and it appears as a filter
//               automatically)
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
//   status      optional: 'In development' badge, or omit
// ---------------------------------------------------------------------------

import Greenline from '../assets/images/GreenlineDashboard.jpg';
import PWA from '../assets/images/PWALP.png';
import SocialNetwork from '../assets/images/SocialNetworkAPI.png';
import MVC from '../assets/images/MVCTechBlogLP.png';
import EmployeeTracker from '../assets/images/EmployeeTracker.png';
import EcommerceBackend from '../assets/images/EcommerceBackend.png';
import Jarvis from '../assets/images/JarvisDashboard.jpg';
import CoachRhythm from '../assets/images/CoachRhythmDashboard.jpg';
import PetCenza from '../assets/images/PetCenzaDashboard.jpg';

export const projects = [
  // ---- AI & Claude Code -------------------------------------------------
  {
    id: 12,
    title: 'Jarvis',
    category: 'AI & Claude Code',
    summary:
      'A local-first, permission-gated personal AI assistant running entirely on home infrastructure — natural-language memory, voice interaction, full calendar and email management, and a searchable knowledge base via RAG.',
    details:
      'Every connector is deny-by-default and requires an explicit permission grant; anything destructive requires human confirmation before it executes. Built end-to-end with Claude Code across a full day-long session, including a real security audit that caught and fixed an OAuth CSRF gap and a container timezone bug.',
    stack: ['FastAPI', 'Docker Compose', 'Chroma (Vector DB)', 'Claude API', 'Google OAuth2'],
    image: Jarvis,
    projectLink: null, // intentionally not linked — private for security reasons
    repoLink: null, // intentionally not linked — private for security reasons
  },
  {
    id: 1,
    title: 'CoachRhythm',
    category: 'AI & Claude Code',
    summary:
      'A programming assistant for personal trainers that turns a client intake — injuries, available equipment, and goals — into a complete training plan.',
    details:
      'Exercises are screened against each client\'s logged injuries by a deterministic filter that runs before the model is prompted, so the AI only ever programs from an already-filtered pool — safety never depends on the model following instructions. Its output then clears a second deterministic pass that re-checks movement balance, pull-to-push volume, recovery spacing, rep ranges and progression, with no LLM anywhere in the verification path; a failed check feeds one automatic retry, and plans that still fail are stored as flagged drafts rather than presented as finished. Trainers work from a 543-exercise library tagged by movement pattern, equipment and contraindication, extensible with their own movements. Multi-tenant isolation is enforced in Postgres row-level security and proven by a two-tenant test suite rather than assumed. Built end-to-end with Claude Code.',
    stack: ['Next.js 15', 'TypeScript', 'Supabase (Postgres RLS)', 'Claude API', 'Playwright'],
    image: CoachRhythm,
    projectLink: 'https://traincraft-psi.vercel.app',
    repoLink: 'https://github.com/chadkraus87/traincraft',
  },
  {
    id: 2,
    title: 'PetCenza',
    category: 'AI & Claude Code',
    summary:
      'A household pet health record built to answer one question the moment it opens: does anything need attention today? Tracks boosters, medication refills, vet visits, and weight history across every pet in the home.',
    details:
      'Sharing is enforced in the database rather than the client — row-level security on all 26 tables, per-pet viewer/editor/co-owner roles, TOTP multi-factor auth, and magic-byte upload validation that quarantines mismatched uploads. Security review ran as part of the build rather than a pass at the end, and it drove concrete hardening — the rate limiter moved onto a spoof-resistant header, and SECURITY DEFINER helper functions were introduced to break recursive RLS policy evaluation. It is offline-first by design: a persisted query cache serves reads with no connection, and an IndexedDB outbox replays mutations once the device reconnects. Backed by 101 unit tests, 6 Playwright E2E specs, and a SQL-level RLS isolation suite. Built with Claude Code.',
    stack: [
      'React 18 + TypeScript',
      'Supabase (Postgres RLS)',
      'TanStack Query',
      'Deno Edge Functions',
      'PWA / Offline-first',
      'Vitest + Playwright',
    ],
    image: PetCenza,
    projectLink: 'https://pawchart-zeta.vercel.app/',
    repoLink: 'https://github.com/chadkraus87/petcenza',
  },

  {
    id: 3,
    title: 'Greenline',
    category: 'AI & Claude Code',
    summary:
      'A private monthly budget built around the question that actually matters mid-month: what is genuinely left to spend? Projects a daily cash runway from scheduled bills and income, then scores the month as you spend against it.',
    details:
      'Bills, income, expenses, budgets, goals, reserves and debt each keep their own ledger, and the calendar puts every scheduled flow on a date so a shortfall shows up weeks before it lands — receipts scan straight into an expense. Data is scoped per account by row-level security across 12 tables, and the deployment ships a real CSP with HSTS and frame-deny rather than framework defaults. Installable and offline-capable as a PWA. Built with Claude Code.',
    stack: ['React + TypeScript', 'Supabase (Postgres RLS)', 'Vite', 'Recharts', 'PWA / Offline', 'Vitest + Playwright'],
    image: Greenline,
    projectLink: 'https://greenline-chadwick-kraus-projects.vercel.app/',
    repoLink: 'https://github.com/chadkraus87/greenline',
  },

  // ---- Full-Stack -------------------------------------------------------
  {
    id: 4,
    title: 'PWA Text Editor',
    category: 'Full-Stack',
    summary:
      'Progressive web app for creating and managing code snippets, fully functional offline with IndexedDB persistence.',
    stack: ['PWA', 'IndexedDB', 'Webpack', 'Service Workers'],
    image: PWA,
    projectLink: null,
    repoLink: 'https://github.com/chadkraus87/PWA-Text-Editor',
  },
  {
    id: 5,
    title: 'MVC Tech Blog',
    category: 'Full-Stack',
    summary:
      'CMS-style blog where developers publish posts and comment, built on the MVC pattern with session-based auth.',
    stack: ['Express', 'Sequelize', 'Handlebars', 'bcrypt'],
    image: MVC,
    projectLink: null,
    repoLink: 'https://github.com/chadkraus87/MVCBlog',
  },
  {
    id: 6,
    title: 'Social Network API',
    category: 'Full-Stack',
    summary:
      'Backend API for a social platform — thoughts, reactions, and friend lists — with MongoDB and Mongoose data modeling.',
    stack: ['Node.js', 'MongoDB', 'Mongoose', 'REST'],
    image: SocialNetwork,
    projectLink: 'https://drive.google.com/file/d/1fEC96BaMTbx14i5lkYy8cDr9wpkvwJzT/view',
    projectLinkLabel: 'Watch demo',
    repoLink: 'https://github.com/chadkraus87/SocialNetworkAPI',
  },
  {
    id: 7,
    title: 'E-commerce Back End',
    category: 'Full-Stack',
    summary:
      'API endpoints for products, categories, and tags with full CRUD, built with Sequelize ORM over MySQL.',
    stack: ['Express', 'Sequelize', 'MySQL'],
    image: EcommerceBackend,
    projectLink: 'https://drive.google.com/file/d/1xwvri6EEz_uOQUO-PmwaDuJ7FfFitsos/view',
    projectLinkLabel: 'Watch demo',
    repoLink: 'https://github.com/chadkraus87/E-commerceBackEnd',
  },
  {
    id: 8,
    title: 'Employee Tracker',
    category: 'Full-Stack',
    summary:
      'Command-line employee management system: departments, roles, budgets, and reporting over a MySQL database.',
    stack: ['Node.js', 'MySQL', 'Inquirer'],
    image: EmployeeTracker,
    projectLink: 'https://drive.google.com/file/d/1R3MvpUrgGGZx_RJXHq8LRBjfvBBzXhYN/view',
    projectLinkLabel: 'Watch demo',
    repoLink: 'https://github.com/chadkraus87/EmployeeTracker',
  },
];
