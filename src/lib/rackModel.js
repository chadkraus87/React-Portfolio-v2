// ---------------------------------------------------------------------------
// Rack model: turns projects.js + racks.js + activity.json into what the server
// room and the project pages draw. Pure: imports nothing and touches no DOM, so
// scripts/prerender.mjs can import and self-test it under plain Node.
// ---------------------------------------------------------------------------

// Stack entries are free text ("Vitest + Playwright", "Next.js 16"), so shared
// tools are matched by name. TypeScript is dropped: nine of the ten projects use
// it, and it would connect everything to everything.
const RULES = [
  [/next\.js/i, 'Next.js'], [/docker/i, 'Docker'], [/playwright/i, 'Playwright'], [/vitest/i, 'Vitest'],
  [/supabase/i, 'Supabase'], [/claude api/i, 'Claude API'], [/recharts/i, 'Recharts'], [/^vite$/i, 'Vite'],
  [/tailwind/i, 'Tailwind CSS'], [/pwa/i, 'PWA'], [/^react(?! flow)/i, 'React'], [/vercel/i, 'Vercel'],
  [/typescript/i, 'TypeScript'],
];

export function toolsOf(stack = []) {
  const out = new Set();
  for (const raw of stack) {
    let matched = false;
    for (const [re, name] of RULES) {
      if (re.test(raw)) { out.add(name); matched = true; }
    }
    if (!matched) out.add(raw);
  }
  out.delete('TypeScript');
  return out;
}

// 14U: a 2U patch panel, a 1U blank, five 2U servers and a 1U blank.
export const RACK_U = 14;
const MAX_UNITS = 5;

export function buildRackModel({ projects, racks, lenses, activity }) {
  const seen = new Set();
  const racked = racks.flatMap((rack) => rack.slugs.map((slug) => {
    const project = projects.find((p) => p.slug === slug);
    if (!project) throw new Error(`racks.js lists "${slug}", which is not in projects.js`);
    if (seen.has(slug)) throw new Error(`racks.js lists "${slug}" twice`);
    seen.add(slug);
    return { ...project, rack: rack.id };
  }));
  const unracked = projects.filter((p) => !seen.has(p.slug)).map((p) => p.slug);
  if (unracked.length) throw new Error(`Not in any rack in racks.js: ${unracked.join(', ')}`);

  racked.forEach((p, i) => {
    p.i = i;
    p.tools = toolsOf(p.stack);
    p.act = activity.repos[p.slug] ?? null;
    p.lensNames = Object.values(lenses).filter((l) => l.slugs.includes(p.slug)).map((l) => l.name);
  });

  const counts = new Map();
  racked.forEach((p) => p.tools.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  const tools = [...counts]
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([t]) => t);
  racked.forEach((p) => { p.ports = tools.filter((t) => p.tools.has(t)); });

  const rackList = racks.map((rack) => {
    const units = racked.filter((p) => p.rack === rack.id);
    // ponytail: fixed 14U racks hold five 2U servers; a sixth project needs a taller rack or a third rack.
    if (units.length > MAX_UNITS) throw new Error(`Rack ${rack.code} has ${units.length} projects; a 14U rack holds ${MAX_UNITS}`);
    let u = RACK_U;
    const patchU = `U${u - 1}–${u}`;
    u -= 3;
    units.forEach((p) => { p.u = `U${u - 1}–${u}`; u -= 2; });
    return { ...rack, units, patchU, tools: tools.filter((t) => units.some((p) => p.tools.has(t))) };
  });

  const trunks = rackList.length === 2 ? rackList[0].tools.filter((t) => rackList[1].tools.includes(t)) : [];
  return {
    projects: racked,
    racks: rackList,
    tools,
    counts,
    trunks,
    activity,
    maxCommits: Math.max(1, ...racked.map((p) => p.act?.total ?? 0)),
    maxWeek: Math.max(1, ...racked.flatMap((p) => p.act?.weeks ?? [0])),
  };
}

// Heat bands: the lower bound of each band as a share of the busiest repo.
export const HEAT_BANDS = [0, 0.12, 0.3, 0.55, 0.8];
export const heatBand = (project, maxCommits) => {
  if (!project.act) return null;
  const share = project.act.total / maxCommits;
  return HEAT_BANDS.reduce((band, low, k) => (share >= low ? k : band), 0);
};

// Drive lights blink faster with more commits.
export const blinkOf = (project) =>
  project.act?.total ? `${Math.min(2.4, Math.max(0.35, 2.4 - project.act.total * 0.04)).toFixed(2)}s` : '';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const activityRange = ({ from, to }) => {
  const day = (iso) => { const [, m, d] = iso.split('-'); return `${+d} ${MONTHS[+m - 1]}`; };
  return `${day(from)} – ${day(to)} ${to.slice(0, 4)}`;
};
