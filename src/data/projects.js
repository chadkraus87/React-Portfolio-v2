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
//   description 1–3 sentences
//   stack       array of short tech labels shown as tags
//   image       import at the top, or null for a styled placeholder
//   projectLink live URL, or null (button hides itself)
//   repoLink    GitHub URL, or null (button hides itself)
//   status      optional: 'In development' badge, or omit
// ---------------------------------------------------------------------------

import Spots from '../assets/images/SpotsLP.jpg';
import PWA from '../assets/images/PWALP.png';
import SocialNetwork from '../assets/images/SocialNetworkAPI.png';
import MVC from '../assets/images/MVCTechBlogLP.png';
import WorkDayScheduler from '../assets/images/WorkDaySchedulerLP.jpg';
import EmployeeTracker from '../assets/images/EmployeeTracker.png';
import NoteTaker from '../assets/images/NoteTaker.png';
import EcommerceBackend from '../assets/images/EcommerceBackend.png';
import WebAPIQuiz from '../assets/images/WebAPIQuiz.png';
import Jarvis from '../assets/images/JarvisDashboard.jpg';
import TrainCraft from '../assets/images/TrainCraftDashboard.jpg';
import PetCenza from '../assets/images/PetCenzaDashboard.jpg';

export const projects = [
  // ---- AI & Claude Code -------------------------------------------------
  {
    id: 12,
    title: 'Jarvis',
    category: 'AI & Claude Code',
    description:
      'A local-first, permission-gated personal AI assistant running entirely on home infrastructure — natural-language memory, voice interaction, full calendar and email management, and a searchable personal knowledge base via RAG. Every connector is deny-by-default and requires an explicit permission grant; anything destructive requires human confirmation before it executes. Built end-to-end with Claude Code across a full day-long session, including a real security audit that caught and fixed an OAuth CSRF gap and a container timezone bug.',
    stack: ['FastAPI', 'Docker Compose', 'Chroma (Vector DB)', 'Claude API', 'Google OAuth2'],
    image: Jarvis,
    projectLink: null, // intentionally not linked — private for security reasons
    repoLink: null, // intentionally not linked — private for security reasons
  },
  {
    id: 1,
    title: 'TrainCraft',
    category: 'AI & Claude Code',
    description:
      'A programming assistant for personal trainers that turns a client intake — injuries, available equipment, and goals — into a complete training plan. Every plan is generated behind a contraindication-aware filter that screens out exercises against each client\'s logged injuries, then clears an automated QA check before the trainer ever sees it. Trainers work from a shared exercise library they can extend with their own movements, and generation runs asynchronously through Inngest so long AI jobs retry cleanly instead of timing out. Built end-to-end with Claude Code.',
    stack: ['Next.js 15', 'Supabase', 'Claude API', 'Inngest'],
    image: TrainCraft,
    projectLink: 'https://traincraft-psi.vercel.app',
    repoLink: 'https://github.com/chadkraus87/traincraft',
  },
  {
    id: 2,
    title: 'PetCenza',
    category: 'AI & Claude Code',
    description:
      'A household pet health record built to answer one question the moment it opens: does anything need attention today? PetCenza tracks vaccination boosters, medication schedules and refill dates, vet appointments, and weight history across every pet in the home, then rolls all of it into a single daily view that surfaces a lapsing booster or a running-low prescription before it becomes a problem. Sharing is enforced in the database rather than the client — row-level security on all 26 tables, per-pet viewer/editor/co-owner roles, TOTP multi-factor auth, and magic-byte upload validation that quarantines files whose contents do not match their extension. It is offline-first by design: a persisted query cache serves reads with no connection, and an IndexedDB outbox replays mutations once the device reconnects. Backed by 101 unit tests, 6 Playwright E2E specs, and a SQL-level RLS isolation suite. Built with Claude Code.',
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
    repoLink: null,
  },

  // ---- Full-Stack -------------------------------------------------------
  {
    id: 3,
    title: 'Spots',
    category: 'Full-Stack',
    description:
      'Authentication-based app for saving favorite locations with photos, address auto-population, and Google Maps hand-off.',
    stack: ['Node.js', 'Express', 'MySQL', 'Auth'],
    image: Spots,
    projectLink: null, // Heroku free tier retired — redeploy or leave repo-only
    repoLink: 'https://github.com/chadkraus87/FullStackGroup2',
  },
  {
    id: 4,
    title: 'PWA Text Editor',
    category: 'Full-Stack',
    description:
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
    description:
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
    description:
      'Backend API for a social platform — thoughts, reactions, and friend lists — with MongoDB and Mongoose data modeling.',
    stack: ['Node.js', 'MongoDB', 'Mongoose', 'REST'],
    image: SocialNetwork,
    projectLink: 'https://drive.google.com/file/d/1fEC96BaMTbx14i5lkYy8cDr9wpkvwJzT/view',
    repoLink: 'https://github.com/chadkraus87/SocialNetworkAPI',
  },
  {
    id: 7,
    title: 'E-commerce Back End',
    category: 'Full-Stack',
    description:
      'API endpoints for products, categories, and tags with full CRUD, built with Sequelize ORM over MySQL.',
    stack: ['Express', 'Sequelize', 'MySQL'],
    image: EcommerceBackend,
    projectLink: 'https://drive.google.com/file/d/1xwvri6EEz_uOQUO-PmwaDuJ7FfFitsos/view',
    repoLink: 'https://github.com/chadkraus87/E-commerceBackEnd',
  },
  {
    id: 8,
    title: 'Employee Tracker',
    category: 'Full-Stack',
    description:
      'Command-line employee management system: departments, roles, budgets, and reporting over a MySQL database.',
    stack: ['Node.js', 'MySQL', 'Inquirer'],
    image: EmployeeTracker,
    projectLink: 'https://drive.google.com/file/d/1R3MvpUrgGGZx_RJXHq8LRBjfvBBzXhYN/view',
    repoLink: 'https://github.com/chadkraus87/EmployeeTracker',
  },

  // ---- Foundational -----------------------------------------------------
  {
    id: 9,
    title: 'Work Day Scheduler',
    category: 'Foundational',
    description:
      'Real-time calendar app with saved events, live clock, and rotating inspirational quotes.',
    stack: ['JavaScript', 'jQuery', 'Day.js'],
    image: WorkDayScheduler,
    projectLink: 'https://chadkraus87.github.io/Work-Day-Scheduler/',
    repoLink: 'https://github.com/chadkraus87/Work-Day-Scheduler',
  },
  {
    id: 10,
    title: 'Note Taker',
    category: 'Foundational',
    description:
      'Express-backed note app for saving and deleting daily tasks.',
    stack: ['Express', 'Node.js'],
    image: NoteTaker,
    projectLink: null,
    repoLink: 'https://github.com/chadkraus87/NoteTaker',
  },
  {
    id: 11,
    title: 'Web API Code Quiz',
    category: 'Foundational',
    description:
      'Timed JavaScript quiz with countdown, scoring, and local high-score storage.',
    stack: ['JavaScript', 'Web APIs'],
    image: WebAPIQuiz,
    projectLink: 'https://chadkraus87.github.io/Web-API-Code-Quiz/',
    repoLink: 'https://github.com/chadkraus87/Web-API-Code-Quiz',
  },
];
