// ---------------------------------------------------------------------------
// RACKS: how the projects stand in the server room on the home page.
//
//   A01  Software & AI       (Builder lens)
//   B01  Networks & support  (Operations lens)
//
// Every slug in projects.js must appear in exactly one rack, in top-to-bottom
// order, strongest at the top. A 14U rack holds five projects; a rack with fewer
// fills the space below its last unit with blank panels. scripts/prerender.mjs
// checks both and fails the build if they drift.
//
// `lenses` are the groupings Chad confirmed. A project can belong to both
// lenses (TechOps) while physically sitting in one rack.
// ---------------------------------------------------------------------------
export const racks = [
  {
    id: 'A',
    code: 'A01',
    name: 'Software & AI',
    lens: 'builder',
    slugs: ['jarvis', 'deskdaemon', 'coachrhythm', 'leonida-loft', 'meridian'],
  },
  {
    id: 'B',
    code: 'B01',
    name: 'Networks & support',
    lens: 'operations',
    slugs: ['techops-command-center', 'homelab-commander', 'stack-city', 'packet-and-pine'],
  },
];

export const lenses = {
  builder: {
    name: 'Builder',
    slugs: ['jarvis', 'deskdaemon', 'leonida-loft', 'meridian', 'techops-command-center', 'coachrhythm'],
  },
  operations: {
    name: 'Operations',
    slugs: ['techops-command-center', 'homelab-commander', 'stack-city', 'packet-and-pine'],
  },
};
