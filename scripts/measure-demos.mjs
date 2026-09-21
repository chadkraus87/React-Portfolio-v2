// Measures every live demo with Lighthouse (mobile) and records the scores, so the
// case studies can state a measured figure with a date on it instead of a claim that
// quietly goes stale.
//
//   node scripts/measure-demos.mjs [--write src/data/lighthouse.json] [slug ...]
//
// Run monthly by .github/workflows/lighthouse-demos.yml. A site that fails to measure
// keeps its previous entry rather than losing it.
import { readFileSync, writeFileSync, existsSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const writeTo = args.includes('--write') ? args[args.indexOf('--write') + 1] : '';
const only = args.filter((a) => !a.startsWith('--') && a !== writeTo);

const text = readFileSync(new URL('../src/data/projects.js', import.meta.url), 'utf8')
  .split('\n').filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line)).join('\n');
const sites = [...text.matchAll(/slug:\s*'([^']+)'[\s\S]*?projectLink:\s*(null|'([^']+)')/g)]
  .filter((m) => m[3])
  .map((m) => ({ slug: m[1], url: m[3] }))
  .filter((s) => !only.length || only.includes(s.slug));

const previous = writeTo && existsSync(writeTo) ? JSON.parse(readFileSync(writeTo, 'utf8')) : { sites: {} };
const out = { ...previous.sites };
const today = new Date().toISOString().slice(0, 10);

for (const { slug, url } of sites) {
  const dir = mkdtempSync(join(tmpdir(), 'lh-'));
  const file = join(dir, 'report.json');
  try {
    execFileSync('npx', ['--yes', 'lighthouse@12', url, '--quiet', '--chrome-flags=--headless=new --no-sandbox',
      '--output=json', `--output-path=${file}`], { stdio: 'pipe', timeout: 180000 });
    const report = JSON.parse(readFileSync(file, 'utf8'));
    const pct = (id) => Math.round((report.categories[id]?.score ?? 0) * 100);
    out[slug] = {
      measured: today,
      formFactor: report.configSettings.formFactor,
      performance: pct('performance'),
      accessibility: pct('accessibility'),
      bestPractices: pct('best-practices'),
      seo: pct('seo'),
    };
    console.log(`${slug.padEnd(24)} perf ${out[slug].performance}  a11y ${out[slug].accessibility}  bp ${out[slug].bestPractices}  seo ${out[slug].seo}`);
  } catch (error) {
    // Keep the last good measurement: a flaky run should not erase a real number.
    console.log(`${slug.padEnd(24)} could not be measured (${String(error.message).split('\n')[0].slice(0, 60)})`);
  }
}

if (writeTo) {
  const body = { updated: today, sites: out };
  const before = existsSync(writeTo) ? readFileSync(writeTo, 'utf8') : '';
  const next = `${JSON.stringify(body, null, 2)}\n`;
  // Only rewrite when a score actually moved, so a monthly run with no change is a no-op.
  const scoresOnly = (o) => JSON.stringify(Object.fromEntries(Object.entries(o.sites ?? {}).map(([k, v]) => [k, { ...v, measured: '' }])));
  if (!before || scoresOnly(JSON.parse(before)) !== scoresOnly(body)) writeFileSync(writeTo, next);
  else console.log('scores unchanged; file untouched');
}
