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

const entry = (kind, title, detail, href, extra = '') => ({ kind, title, detail, href, body: extra, text: `${title} ${detail} ${extra}`.toLowerCase() });

export const searchIndex = [
  ...RACK_MODEL.projects.map((p) => entry('Project', p.title, p.tagline || p.category || '', `/projects/${p.slug}`, `${p.summary} ${p.stack.join(' ')} ${p.status}`)),
  ...RACK_MODEL.tools.map((t) => entry('Tool', t, `Used by ${RACK_MODEL.counts.get(t)} projects`, `/portfolio?tool=${toolSlug(t)}`)),
  ...Object.entries(projectStories).map(([slug, s]) => entry('Field note', s.title, RACK_MODEL.projects.find((p) => p.slug === slug)?.title ?? '', `/projects/${slug}`, s.body.join(' '))),
  ...changelog.months.flatMap((m) => m.projects.flatMap((p) => p.highlights.map((h) => entry('Change', h.text, `${p.title} · ${m.month}`, '/changes')))),
  ...PAGES.map(([title, href, words]) => entry('Page', title, '', href, words)),
];

const WEIGHT = { Project: 4, Tool: 3, Page: 3, 'Field note': 2, Change: 1 };
// Groups are shown in this order, and each is capped, so a common word in dozens of
// commit lines can't push the projects and pages off the list.
export const KINDS = ['Project', 'Tool', 'Page', 'Field note', 'Change'];
export const PLURAL = { Project: 'Projects', Tool: 'Tools', Page: 'Pages', 'Field note': 'Field notes', Change: 'Changes' };

// A few words either side of the first match, for results whose title doesn't show why
// they matched. Returns '' when the word isn't in the body.
export function snippet(body = '', word = '', around = 60) {
  const at = body.toLowerCase().indexOf(word);
  if (at === -1) return '';
  const start = Math.max(0, at - around);
  const end = Math.min(body.length, at + word.length + around);
  return `${start ? '…' : ''}${body.slice(start, end).trim()}${end < body.length ? '…' : ''}`;
}

// Splits text into matched and unmatched pieces, so the UI can mark the matches.
export function highlight(text = '', words = []) {
  const found = words.filter(Boolean).map((w) => w.toLowerCase());
  if (!found.length) return [{ text, hit: false }];
  const out = [];
  let rest = text;
  while (rest) {
    const hits = found.map((w) => ({ w, at: rest.toLowerCase().indexOf(w) })).filter((h) => h.at !== -1).sort((a, b) => a.at - b.at || b.w.length - a.w.length);
    if (!hits.length) { out.push({ text: rest, hit: false }); break; }
    const { w, at } = hits[0];
    if (at) out.push({ text: rest.slice(0, at), hit: false });
    out.push({ text: rest.slice(at, at + w.length), hit: true });
    rest = rest.slice(at + w.length);
  }
  return out;
}

// Every word of the query must appear somewhere in an entry; title hits rank first.
export function search(query, index = searchIndex, limit = 10, perKind = 4) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const seen = new Map();
  return index
    .filter((e) => words.every((w) => e.text.includes(w)))
    .map((e) => {
      const title = e.title.toLowerCase();
      const score = WEIGHT[e.kind] + (title.startsWith(words[0]) ? 6 : 0) + words.filter((w) => title.includes(w)).length * 3;
      return { ...e, score, snippet: title.includes(words[0]) ? '' : snippet(e.body, words[0]) };
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .filter((e) => {
      const used = seen.get(e.kind) ?? 0;
      if (used >= perKind) return false;
      seen.set(e.kind, used + 1);
      return true;
    })
    .slice(0, limit);
}

// The same results, split into the groups the dialog renders, in KINDS order.
export function grouped(results) {
  return KINDS.map((kind) => [kind, results.filter((r) => r.kind === kind)]).filter(([, items]) => items.length);
}
