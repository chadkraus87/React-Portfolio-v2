// Post-build step: emit a real static file for every route.
//
// Vercel serves dist/<route>/index.html at /<route>, so each route answers 200
// with real HTML instead of being handed to a client-side router. That is what
// makes the pages indexable, and it lets every route carry its own <title>,
// description and OG tags — which a single shared index.html cannot do.
//
// It also writes dist/404.html, which Vercel serves (with a 404 status) for
// any path that is not a real file. React boots there, sees an unmatched
// route, and renders the styled NotFound page.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
// Titles are shared with the running app (src/components/DocumentTitle.jsx) so
// a prerendered title and a client-side one cannot drift. siteMeta.js imports
// nothing, which is why plain Node can import it here.
import {
  ROUTE_TITLES,
  NOT_FOUND_TITLE,
  HOME_DESCRIPTION,
  detailTitle,
} from '../src/data/siteMeta.js';
// racks.js and rackModel.js import nothing either, so the build can check that
// every project stands in a rack and self-test the model the server room uses.
import { racks, lenses } from '../src/data/racks.js';
import { toolsOf, buildRackModel, uptimeStrip } from '../src/lib/rackModel.js';
import { evidenceReport } from './evidence.mjs';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const BASE = 'https://chad-kraus-portfolio.vercel.app';

// Project pages are derived from projects.js so there is one source of truth.
// It is parsed rather than imported because it imports images, which Node
// cannot resolve outside Vite. Comment lines are stripped first so a
// commented-out example entry can never be prerendered as a real page.
const src = (f) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', f), 'utf8')
    .split('\n')
    .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .join('\n');

// The data files are read as text, so a value written as a JavaScript string
// literal arrives with its escapes intact: `\u2019` is seven characters here,
// not an apostrophe. Anything that reaches a meta tag has to be decoded first,
// or the escape ships to crawlers verbatim.
//
// One left-to-right pass, so an escaped backslash is consumed as a backslash
// and whatever follows it is left alone: `\\u2019` decodes to a backslash plus
// the literal text u2019, never to an apostrophe. A chain of .replace() calls
// would get that wrong. No eval, no Function, no module execution.
const decodeJsStringEscapes = (value) =>
  value.replace(
    /\\(u\{([0-9a-fA-F]{1,6})\}|u([0-9a-fA-F]{4})|x([0-9a-fA-F]{2})|\r?\n|[\s\S])/g,
    (match, whole, braced, four, hex) => {
      if (braced !== undefined) return String.fromCodePoint(parseInt(braced, 16));
      if (four !== undefined) return String.fromCharCode(parseInt(four, 16));
      if (hex !== undefined) return String.fromCharCode(parseInt(hex, 16));
      if (whole === '\n' || whole === '\r\n') return ''; // line continuation
      switch (whole) {
        case 'n': return '\n';
        case 't': return '\t';
        case 'r': return '\r';
        case 'b': return '\b';
        case 'f': return '\f';
        case 'v': return '\v';
        case '0': return '\0';
        // Quotes, backslash, backtick and anything else: the character itself,
        // which is what JavaScript does for an unrecognised escape.
        default: return whole;
      }
    }
  );

// Self-test. These run on every build and cost nothing; they are here because
// the one-pass rule above is easy to break and impossible to notice by eye.
for (const [input, expected] of [
  ["portfolio\\u2019s", 'portfolio\u2019s'],
  ["a \\u2014 b", 'a \u2014 b'],
  ["client\\'s", "client's"],
  ["back\\\\slash", 'back\\slash'],
  ["back\\\\u2019", 'back\\u2019'], // escaped backslash: u2019 must stay literal
  ['plain text', 'plain text'],
]) {
  const got = decodeJsStringEscapes(input);
  if (got !== expected) {
    throw new Error(
      `decodeJsStringEscapes(${JSON.stringify(input)}) = ${JSON.stringify(got)}, expected ${JSON.stringify(expected)}`
    );
  }
}

const parseEntries = (text) =>
  [...text.matchAll(/slug:\s*'([^']+)'[\s\S]*?title:\s*'((?:[^'\\]|\\.)*)'/g)].map((m) => ({
    slug: m[1],
    title: decodeJsStringEscapes(m[2]),
  }));

const firstSentence = (text, slug) => {
  // Pull the entry's summary and trim to one sentence for the meta description.
  // Decoding happens before the sentence cut and the length cap so both count
  // real characters rather than escape sequences.
  const block = text.split(`slug: '${slug}'`)[1] ?? '';
  const raw = block.match(/summary:\s*\n?\s*'((?:[^'\\]|\\.)*)'/)?.[1] ?? '';
  const clean = decodeJsStringEscapes(raw);
  const cut = clean.match(/^.*?[.?!](\s|$)/)?.[0] ?? clean;
  return cut.trim().slice(0, 300);
};

const projectsSrc = src('projects.js');
const projectRoutes = parseEntries(projectsSrc).map(({ slug, title }) => ({
  path: `projects/${slug}`,
  title: detailTitle(title),
  description: firstSentence(projectsSrc, slug),
  // Per-project social card, generated by scripts/make-og-images.py and
  // committed under public/og/. Falls back to the site card if absent.
  image: `${BASE}/og/${slug}.jpg`,
}));

// Every project must stand in exactly one rack, and every lens must name real
// projects. The server room would otherwise throw on load.
{
  const projectSlugs = parseEntries(projectsSrc).map((e) => e.slug);
  const racked = racks.flatMap((r) => r.slugs);
  const problems = [
    ...projectSlugs.filter((s) => !racked.includes(s)).map((s) => `${s} is in no rack`),
    ...racked.filter((s) => !projectSlugs.includes(s)).map((s) => `racks.js lists unknown project ${s}`),
    ...racked.filter((s, i) => racked.indexOf(s) !== i).map((s) => `${s} is in more than one rack`),
    ...racks.filter((r) => r.slugs.length > 5).map((r) => `rack ${r.code} holds ${r.slugs.length} projects; the limit is 5`),
    ...Object.values(lenses).flatMap((l) => l.slugs.filter((s) => !projectSlugs.includes(s)).map((s) => `lens ${l.name} lists unknown project ${s}`)),
  ];
  if (problems.length) throw new Error(`racks.js:\n  ${problems.join('\n  ')}`);
}

// Evidence dates. Every project says when its screenshot was captured; every demo
// says when it was recorded and what is on screen. Missing fields fail the build;
// evidence older than the project's last update only warns (and the daily Action
// opens an issue for it).
{
  const { problems, stale } = evidenceReport(projectsSrc);
  if (problems.length) throw new Error(`projects.js evidence:\n  ${problems.join('\n  ')}`);
  if (stale.length) console.warn(`evidence older than the project's last update:\n  ${stale.map((x) => `${x.slug}: ${x.kind} from ${x.captured}, updated ${x.updated}`).join('\n  ')}`);
}

// Rack model self-test: stack matching, trunks across racks, and the refusal to
// silently drop a project that is in no rack.
{
  const got = [...toolsOf(['Vitest + Playwright', 'React Flow', 'React 18 + TypeScript', 'Next.js 16', 'Deno Edge Functions'])].sort().join('|');
  const want = ['Deno Edge Functions', 'Next.js', 'Playwright', 'React', 'React Flow', 'Vitest'].sort().join('|');
  if (got !== want) throw new Error(`toolsOf: got ${got}, want ${want}`);
  const m = buildRackModel({
    projects: [{ slug: 'a', stack: ['Vite', 'Docker'] }, { slug: 'b', stack: ['Vite'] }, { slug: 'c', stack: ['Docker', 'Go'] }],
    racks: [{ id: 'A', code: 'A01', slugs: ['a'] }, { id: 'B', code: 'B01', slugs: ['b', 'c'] }],
    lenses: {},
    activity: { repos: {} },
  });
  if (m.trunks.join('|') !== 'Docker|Vite') throw new Error(`rack model trunks: got ${m.trunks.join('|')}`);
  let threw = false;
  try { buildRackModel({ projects: [{ slug: 'x', stack: [] }], racks: [], lenses: {}, activity: { repos: {} } }); } catch { threw = true; }
  if (!threw) throw new Error('buildRackModel accepted a project that is in no rack');
  const down = buildRackModel({
    projects: [{ slug: 'a', stack: [] }], racks: [{ id: 'A', code: 'A01', slugs: ['a'] }], lenses: {},
    activity: { repos: {} }, uptime: { sites: { a: { ok: false, since: '2026-09-14' } } },
  });
  if (down.projects[0].demoDown !== '2026-09-14') throw new Error('rack model ignored a live demo that stopped answering');
  const strip = uptimeStrip({ firstChecked: '2026-09-10', outages: [{ from: '2026-09-12', to: '2026-09-13' }] }, '2026-09-14', 7);
  if (strip.days.map((d) => d.state).join(',') !== 'unchecked,unchecked,up,up,down,up,up' || strip.checked !== 5 || strip.down !== 1 || strip.from !== '2026-09-10') {
    throw new Error(`uptimeStrip: got ${strip.days.map((d) => d.state).join(',')} checked=${strip.checked} down=${strip.down}`);
  }
}

const routes = [
  {
    path: 'portfolio',
    title: ROUTE_TITLES['/portfolio'],
    description:
      'AI tooling, infrastructure consoles, and systems games built with Claude Code and Codex — Jarvis, Meridian, PetCenza, HomeLab Commander, Stack City and more.',
  },
  {
    path: 'resume',
    title: ROUTE_TITLES['/resume'],
    description:
      'Resume for Chadwick (Chad) Kraus — Network IT Specialist covering Tier 2/3 escalations, QA operations, and AI-assisted tooling.',
  },
  {
    path: 'contact',
    title: ROUTE_TITLES['/contact'],
    description: 'Get in touch with Chadwick (Chad) Kraus — email, LinkedIn, GitHub.',
  },
  {
    path: 'changes',
    title: ROUTE_TITLES['/changes'],
    description: 'What changed in each public project and this site, month by month, from the commits.',
  },
  {
    path: 'status',
    title: ROUTE_TITLES['/status'],
    description: 'Whether each live project demo answered its daily check, with 30 days of history.',
  },
  {
    path: 'accessibility',
    title: ROUTE_TITLES['/accessibility'],
    description: 'How this site is checked for accessibility on every deployment, what is built in, and its known limitations.',
  },
  ...projectRoutes,
];

// Nothing that reaches a meta tag may still carry a source-code escape. This
// is the assertion that would have caught \u2019 shipping in a live meta
// description; it covers every title and description the prerenderer writes,
// including the home page's.
const SOURCE_ESCAPE = /\\(u\{?[0-9a-fA-F]{1,6}\}?|x[0-9a-fA-F]{2}|[ntrbfv0'"\\])/;
for (const { path, title, description } of [
  { path: '/', title: ROUTE_TITLES['/'], description: HOME_DESCRIPTION },
  ...routes,
]) {
  for (const [field, value] of [['title', title], ['description', description]]) {
    const found = String(value).match(SOURCE_ESCAPE);
    if (found) {
      throw new Error(
        `/${path} ${field} still contains the literal escape ${found[0]}:\n  ${value}`
      );
    }
  }
}

const shell = readFileSync(join(dist, 'index.html'), 'utf8');

// The home title is authored in index.html and mirrored in siteMeta.js so the
// client-side router can restore it. Fail the build rather than let them drift.
const shellTitle = shell.match(/<title>([^<]*)<\/title>/)?.[1];
if (shellTitle !== ROUTE_TITLES['/']) {
  throw new Error(
    `index.html <title> and ROUTE_TITLES['/'] disagree:\n  ${shellTitle}\n  ${ROUTE_TITLES['/']}`
  );
}

// The root canonical is authored in index.html because Vite does not process
// it; BASE is the source of truth for every other route. Fail the build rather
// than let the two disagree.
const shellCanonical = shell.match(/<link\s+rel="canonical"\s+href="([^"]*)"/)?.[1];
if (shellCanonical !== `${BASE}/`) {
  throw new Error(
    `index.html canonical and BASE disagree:\n  ${shellCanonical}\n  ${BASE}/`
  );
}

// The three homepage description tags are authored in index.html so the dev
// server matches production, and stamped from HOME_DESCRIPTION at build time.
// Fail the build rather than let the authored copy rot.
for (const [label, re_] of [
  ['description', /<meta\s+name="description"\s+content="([^"]*)"/],
  ['og:description', /<meta\s+property="og:description"\s+content="([^"]*)"/],
  ['twitter:description', /<meta\s+name="twitter:description"\s+content="([^"]*)"/],
]) {
  const found = shell.match(re_)?.[1];
  if (found !== HOME_DESCRIPTION) {
    throw new Error(
      `index.html ${label} and HOME_DESCRIPTION disagree:\n  ${found}\n  ${HOME_DESCRIPTION}`
    );
  }
}

// Replace the first occurrence of each tag's content, leaving everything else
// (asset hashes, analytics, the 404 decoder) byte-identical to the shell.
// Titles and descriptions are injected into markup, so a bare & (Packet & Pine)
// or a quote would produce invalid HTML or break an attribute.
const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const swap = (html, route) => {
  const title = esc(route.title);
  const description = esc(route.description);
  const url = esc(route.url);
  const image = route.image ? esc(route.image) : null;
  const withImage = (h) =>
    image
      ? h
          .replace(/(<meta\s+property="og:image"\s+content=")[^"]*(")/, `$1${image}$2`)
          .replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*(")/, `$1${image}$2`)
      : h;
  return withImage(html)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${description}$2`
    )
    .replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
      `$1${title}$2`
    )
    .replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
      `$1${description}$2`
    )
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${title}$2`)
    .replace(
      /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
      `$1${description}$2`
    );
};

for (const route of routes) {
  const dir = join(dist, route.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'index.html'),
    swap(shell, { ...route, url: `${BASE}/${route.path}` }),
    'utf8'
  );
  console.log(`prerendered /${route.path}`);
}

// The home page is stamped from the same shell and the same swap(), which is
// what makes description, og:description and twitter:description a single
// value. It stays out of `routes` because the sitemap already lists BASE + '/'
// and because its output path is dist/index.html, not dist/<path>/index.html.
writeFileSync(
  join(dist, 'index.html'),
  swap(shell, {
    title: ROUTE_TITLES['/'],
    description: HOME_DESCRIPTION,
    url: `${BASE}/`,
  }),
  'utf8'
);
console.log('prerendered /');

// Share previews for /?unit=<slug>. middleware.js rewrites those requests to
// these copies of the home page, so a shared unit link unfurls with the project's
// own title, description and card. Same app; canonical points at the home page
// and none of them are in the sitemap.
for (const rack of racks) {
  for (const slug of rack.slugs) {
    const entry = parseEntries(projectsSrc).find((e) => e.slug === slug);
    const dir = join(dist, 'units', slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'index.html'),
      swap(shell, {
        title: detailTitle(`${entry.title} in rack ${rack.code}`),
        description: firstSentence(projectsSrc, slug),
        url: `${BASE}/?unit=${slug}`,
        image: `${BASE}/og/units/${slug}.jpg`,
      }).replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${BASE}/$2`),
      'utf8'
    );
  }
}
console.log('wrote unit share previews');

// 404.html — served by Vercel for unmatched paths, with a real 404 status.
// noindex so a soft-404 never enters the index.
writeFileSync(
  join(dist, '404.html'),
  swap(shell, {
    title: NOT_FOUND_TITLE,
    description: 'That link does not point anywhere on this site.',
    url: `${BASE}/404`,
  })
    .replace('</title>', '</title>\n    <meta name="robots" content="noindex" />')
    // A soft-404 is not a canonical anything. noindex is the whole signal;
    // pointing it at itself or at the homepage would only muddy that.
    .replace(/\n\s*<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/, ''),
  'utf8'
);
console.log('wrote 404.html');

// sitemap.xml — now that each route is a real 200 URL, it is worth submitting.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[`${BASE}/`, ...routes.map((r) => `${BASE}/${r.path}`)]
  .map((loc) => `  <url><loc>${loc}</loc></url>`)
  .join('\n')}
</urlset>
`;
writeFileSync(join(dist, 'sitemap.xml'), sitemap, 'utf8');

writeFileSync(
  join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`,
  'utf8'
);
console.log('wrote sitemap.xml + robots.txt');

// changes.xml — an RSS feed of the monthly change log, so /changes can be followed.
// One item per month, with a stable guid so a month rebuilt later updates in place.
{
  const log = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'changelog.json'), 'utf8'));
  const xml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const items = log.months.map(({ month, through, projects }) => {
    const [y, m] = month.split('-').map(Number);
    const date = through ? new Date(`${through}T12:00:00Z`) : new Date(Date.UTC(y, m, 0, 12));
    const body = projects
      .map((p) => `${p.title}: ${p.commits} commit${p.commits === 1 ? '' : 's'}${p.highlights.length ? `. ${p.highlights.map((h) => h.text).join('; ')}` : ''}`)
      .join('\n');
    return [
      '    <item>',
      `      <title>${xml(`What changed in ${MONTH_NAMES[m - 1]} ${y}${through ? ', so far' : ''}`)}</title>`,
      `      <link>${BASE}/changes#ch-${month}</link>`,
      `      <guid isPermaLink="false">chad-kraus-portfolio-changes-${month}</guid>`,
      `      <pubDate>${date.toUTCString()}</pubDate>`,
      `      <description>${xml(body)}</description>`,
      '    </item>',
    ].join('\n');
  });
  writeFileSync(
    join(dist, 'changes.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>${xml(ROUTE_TITLES['/changes'])}</title>\n    <link>${BASE}/changes</link>\n    <description>What changed in each public project and this site, month by month, from the commits.</description>\n    <language>en-us</language>\n${items.join('\n')}\n  </channel>\n</rss>\n`,
    'utf8'
  );
  console.log('wrote changes.xml');
}
