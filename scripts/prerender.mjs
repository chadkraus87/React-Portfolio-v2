// Post-build step: emit a real static file for every route.
//
// Why: GitHub Pages has no server-side rewrite. Without this, /portfolio is
// served by 404.html — which redirects humans correctly, but returns HTTP 404.
// Crawlers drop 404s regardless of what the JS would have done next, so the
// deep routes would never be indexed. Writing dist/portfolio/index.html makes
// the same URL answer 200 with real HTML.
//
// It also lets each route carry its own <title> and description, which a single
// shared index.html cannot do on static hosting.
//
// public/404.html stays as the safety net for genuinely unknown paths.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const NAME = 'Chadwick (Chad) Kraus';
const BASE = 'https://chadkraus87.github.io/React-Portfolio-v2';

const routes = [
  {
    path: 'portfolio',
    title: `Projects · ${NAME}`,
    description:
      'AI tooling and full-stack projects built with Claude Code — Jarvis, PetCenza, Greenline, and TrainCraft — plus earlier full-stack work.',
  },
  {
    path: 'resume',
    title: `Resume · ${NAME}`,
    description:
      'Resume for Chadwick (Chad) Kraus — Network IT Specialist covering Tier 2/3 escalations, QA operations, and AI-assisted tooling.',
  },
  {
    path: 'contact',
    title: `Contact · ${NAME}`,
    description: 'Get in touch with Chadwick (Chad) Kraus — email, LinkedIn, GitHub.',
  },
];

const shell = readFileSync(join(dist, 'index.html'), 'utf8');

// Replace the first occurrence of each tag's content, leaving everything else
// (asset hashes, analytics, the 404 decoder) byte-identical to the shell.
const swap = (html, { title, description, url }) =>
  html
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
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${title}$2`)
    .replace(
      /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
      `$1${description}$2`
    );

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
