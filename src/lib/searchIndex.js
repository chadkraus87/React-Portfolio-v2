import { RACK_MODEL } from './rack.js';
import { toolSlug } from './projectMeta.js';
import { projectStories } from '../data/stories.js';
import changelog from '../data/changelog.json';

// Everything the site search can find: projects, shared tools, field notes, change
// log highlights and pages. Loaded only when search first opens.
const PAGES = [
  ['Projects', '/portfolio', 'all projects racks lenses builder operations'],
  ['Resume', '/resume', 'resume cv experience pdf'],
  ['Contact', '/contact', 'contact email message hire'],
  ['Now', '/now', 'now this week in progress'],
  ['Demo status', '/status', 'status uptime live demos outage'],
  ['What changed', '/changes', 'change log commits rss'],
  ['Interview pack', '/interview-pack', 'interview pack print hiring'],
  ['Interview mode', '/?tour=hiring', 'interview tour hiring walk through'],
  ['Accessibility', '/accessibility', 'accessibility wcag keyboard'],
];

const entry = (kind, title, detail, href, extra = '') => ({ kind, title, detail, href, text: `${title} ${detail} ${extra}`.toLowerCase() });

export const searchIndex = [
  ...RACK_MODEL.projects.map((p) => entry('Project', p.title, p.tagline || p.category || '', `/projects/${p.slug}`, `${p.summary} ${p.stack.join(' ')} ${p.status}`)),
  ...RACK_MODEL.tools.map((t) => entry('Tool', t, `Used by ${RACK_MODEL.counts.get(t)} projects`, `/portfolio?tool=${toolSlug(t)}`)),
  ...Object.entries(projectStories).map(([slug, s]) => entry('Field note', s.title, RACK_MODEL.projects.find((p) => p.slug === slug)?.title ?? '', `/projects/${slug}`, s.body.join(' '))),
  ...changelog.months.flatMap((m) => m.projects.flatMap((p) => p.highlights.map((h) => entry('Change', h.text, `${p.title} · ${m.month}`, '/changes')))),
  ...PAGES.map(([title, href, words]) => entry('Page', title, '', href, words)),
];

const WEIGHT = { Project: 4, Tool: 3, Page: 3, 'Field note': 2, Change: 1 };

// Every word of the query must appear somewhere in an entry; title hits rank first.
export function search(query, index = searchIndex, limit = 8) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return index
    .filter((e) => words.every((w) => e.text.includes(w)))
    .map((e) => {
      const title = e.title.toLowerCase();
      const score = WEIGHT[e.kind] + (title.startsWith(words[0]) ? 6 : 0) + words.filter((w) => title.includes(w)).length * 3;
      return { ...e, score };
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}
