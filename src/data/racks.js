// ---------------------------------------------------------------------------
// RACKS — how the ten projects stand in the server room on the home page.
//
//   A01  Software & AI       (Builder lens)
//   B01  Networks & support  (Operations lens)
//
// Every slug in projects.js must appear in exactly one rack, in top-to-bottom
// order. A 14U rack holds five projects. scripts/prerender.mjs checks both and
// fails the build if they drift.
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
    slugs: ['jarvis', 'meridian', 'petcenza', 'coachrhythm', 'greenline'],
  },
  {
    id: 'B',
    code: 'B01',
    name: 'Networks & support',
    lens: 'operations',
    slugs: ['techops-command-center', 'homelab-commander', 'deskdaemon', 'stack-city', 'packet-and-pine'],
  },
];

export const lenses = {
  builder: {
    name: 'Builder',
    slugs: ['jarvis', 'meridian', 'petcenza', 'techops-command-center', 'coachrhythm', 'greenline'],
  },
  operations: {
    name: 'Operations',
    slugs: ['techops-command-center', 'homelab-commander', 'deskdaemon', 'stack-city', 'packet-and-pine'],
  },
};
