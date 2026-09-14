// Production smoke check: every route answers, share previews and the RSS feed are
// there, and the redirects and security headers only Vercel serves are in place.
// Runs after each promotion (.github/workflows/smoke.yml) and by hand:
//
//   node scripts/smoke.mjs [base-url]
//
// A protected deployment URL (preview, or a production deployment before promotion)
// needs Vercel's automation bypass secret in SMOKE_BYPASS. It is only ever sent to a
// *.vercel.app address.
//
// Prints a Markdown list of failures to stdout (nothing when all is well) and exits 1
// on any, so the workflow can both open an issue and mark the run red.
import { readFileSync } from 'node:fs';

let BASE = (process.argv[2] || 'https://chad-kraus-portfolio.vercel.app').replace(/\/$/, '');
if (!/^https?:\/\//.test(BASE)) BASE = `https://${BASE}`;
const BYPASS = process.env.SMOKE_BYPASS || '';
if (BYPASS && !/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(BASE)) throw new Error(`refusing to send the bypass secret to ${BASE}`);
const text = readFileSync(new URL('../src/data/projects.js', import.meta.url), 'utf8')
  .split('\n').filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line)).join('\n');
const slugs = [...text.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);

// [path, expected status, text the body must contain]
const pages = [
  ['/', 200, '<title>Chadwick (Chad) Kraus'],
  ['/portfolio', 200, '<title>Projects'],
  ['/resume', 200, '<title>Resume'],
  ['/contact', 200, '<title>Contact'],
  ['/changes', 200, '<title>What changed'],
  ['/status', 200, '<title>Demo status'],
  ['/accessibility', 200, '<title>Accessibility'],
  ['/now', 200, '<title>Now'],
  ['/interview-pack', 200, '<title>Interview pack'],
  ['/changes.xml', 200, '<rss version="2.0">'],
  ['/digest.xml', 200, '<rss version="2.0">'],
  ['/api/status', 200, '"sites"'],
  ['/qr/petcenza.svg', 200, '<svg'],
  ['/sitemap.xml', 200, '<urlset'],
  ['/robots.txt', 200, 'Sitemap:'],
  ['/no-such-page', 404, null],
  ['/?unit=petcenza', 200, 'og/units/petcenza.jpg'],
  ['/portfolio?tool=supabase', 200, '<title>Projects using Supabase'],
  ...slugs.map((slug) => [`/projects/${slug}`, 200, '<title>']),
];

const get = (path, redirect = 'follow') =>
  fetch(BASE + path, { redirect, signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'chad-kraus-portfolio smoke check', ...(BYPASS && { 'x-vercel-protection-bypass': BYPASS }) } });

const failures = [];
for (const [path, status, needle] of pages) {
  try {
    const res = await get(path);
    const body = await res.text();
    if (res.status !== status) failures.push(`\`${path}\` answered ${res.status}, expected ${status}`);
    else if (needle && !body.includes(needle)) failures.push(`\`${path}\` is missing \`${needle}\``);
  } catch (error) {
    failures.push(`\`${path}\` did not answer (${error.name})`);
  }
}

try {
  const notes = await get('/notes', 'manual');
  if (![301, 308].includes(notes.status)) failures.push(`\`/notes\` answered ${notes.status}, expected a permanent redirect`);
  const home = await get('/');
  await home.body?.cancel();
  for (const header of ['content-security-policy', 'strict-transport-security', 'x-content-type-options']) {
    if (!home.headers.get(header)) failures.push(`\`/\` is missing the \`${header}\` header`);
  }
} catch (error) {
  failures.push(`the redirect and header checks did not answer (${error.name})`);
}

if (failures.length) {
  console.log(failures.map((f) => `- ${f}`).join('\n'));
  process.exitCode = 1;
} else {
  console.error(`smoke check passed: ${pages.length + 4} checks against ${BASE}`);
}
