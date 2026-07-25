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

import TrainCraftDashboard from '../assets/images/TrainCraftDashboard.png';
import Spots from '../assets/images/SpotsLP.jpg';
import PWA from '../assets/images/PWALP.png';
import SocialNetwork from '../assets/images/SocialNetworkAPI.png';
import MVC from '../assets/images/MVCTechBlogLP.png';
import WorkDayScheduler from '../assets/images/WorkDaySchedulerLP.jpg';
import EmployeeTracker from '../assets/images/EmployeeTracker.png';
import NoteTaker from '../assets/images/NoteTaker.png';
import EcommerceBackend from '../assets/images/EcommerceBackend.png';
import WebAPIQuiz from '../assets/images/WebAPIQuiz.png';

export const projects = [
  // ---- AI & Claude Code -------------------------------------------------
  {
    id: 1,
    title: 'TrainCraft',
    category: 'AI & Claude Code',
    description:
      'AI-powered client management and workout programming platform for personal trainers. A deterministic safety engine filters out contraindicated exercises and unavailable equipment before every plan is generated, then an automated QA pass re-validates it before delivery.',
    stack: ['Next.js 15', 'Supabase', 'Claude API', 'Tailwind CSS'],
    image: TrainCraftDashboard,
    projectLink: 'https://traincraft-psi.vercel.app/',
    repoLink: 'https://github.com/chadkraus87/traincraft',
  },
  {
    id: 2,
    title: 'Flowline',
    category: 'AI & Claude Code',
    description:
      'Multi-tenant B2B workflow tool with role-based access, drag-and-drop Kanban boards, and row-level security per organization. Built with Claude Code.',
    stack: ['Next.js 14', 'Supabase RLS', 'dnd-kit'],
    image: null,
    projectLink: null,
    repoLink: null,
    status: 'In development',
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
