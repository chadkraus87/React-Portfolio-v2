// Keeps a running history of Lighthouse scores across CI runs, stored as a GitHub
// Actions artifact rather than in the repo, and writes a trend table (with changes
// since the previous production run) to the job summary.
//
//   node scripts/lighthouse-history.mjs <previous-history.json> <out.json>
//
// Reads the reports lhci left in .lighthouseci/. A missing or unreadable previous
// history just starts a new one.
//
// Exits 1 when a page's performance score fell by more than LH_MAX_DROP (default
// 0.10) since the previous run in the history. CI still saves the new entry, so the
// next commit compares against it: a drop is flagged once, not blocked forever.
import { readFileSync, writeFileSync, readdirSync, existsSync, appendFileSync } from 'node:fs';

const [previousPath = '', outPath = 'lighthouse-history.json'] = process.argv.slice(2);
const reports = readdirSync('.lighthouseci')
  .filter((f) => /^lhr-.*\.json$/.test(f))
  .map((f) => JSON.parse(readFileSync(`.lighthouseci/${f}`, 'utf8')));
if (!reports.length) throw new Error('no Lighthouse reports in .lighthouseci/');

const score = (r, id) => r.categories[id]?.score ?? 0;
const current = {
  at: new Date().toISOString(),
  sha: (process.env.COMMIT_SHA || '').slice(0, 7),
  pages: Object.fromEntries(reports.map((r) => [new URL(r.requestedUrl).pathname, {
    performance: score(r, 'performance'),
    accessibility: score(r, 'accessibility'),
    lcp: Math.round(r.audits['largest-contentful-paint'].numericValue),
    cls: Number(r.audits['cumulative-layout-shift'].numericValue.toFixed(3)),
  }])),
};

let history = [];
if (previousPath && existsSync(previousPath)) {
  try { history = JSON.parse(readFileSync(previousPath, 'utf8')); } catch { history = []; }
}
if (!Array.isArray(history)) history = [];
if (current.sha && history.at(-1)?.sha === current.sha) history = history.slice(0, -1);
const previous = history.at(-1);
history = [...history, current].slice(-60);
writeFileSync(outPath, `${JSON.stringify(history, null, 2)}\n`);

const delta = (now, before, digits) => (before === undefined ? '—' : `${now - before >= 0 ? '+' : ''}${(now - before).toFixed(digits)}`);
const lines = [
  '### Lighthouse trend',
  '',
  '| Page | Performance | Change | LCP (ms) | Change | CLS | Accessibility |',
  '| --- | --- | --- | --- | --- | --- | --- |',
  ...Object.entries(current.pages).sort().map(([page, s]) => {
    const p = previous?.pages?.[page];
    return `| \`${page}\` | ${s.performance.toFixed(2)} | ${delta(s.performance, p?.performance, 2)} | ${s.lcp} | ${delta(s.lcp, p?.lcp, 0)} | ${s.cls} | ${s.accessibility.toFixed(2)} |`;
  }),
  '',
  `${history.length} run${history.length === 1 ? '' : 's'} in the history${previous ? `, compared with ${previous.sha || 'the previous run'} from ${previous.at.slice(0, 10)}` : ''}.`,
];
const MAX_DROP = Number(process.env.LH_MAX_DROP ?? 0.1);
const drops = Object.entries(current.pages)
  .filter(([page, s]) => previous?.pages?.[page] && previous.pages[page].performance - s.performance > MAX_DROP + 1e-9)
  .map(([page, s]) => `\`${page}\` performance fell from ${previous.pages[page].performance.toFixed(2)} to ${s.performance.toFixed(2)}`);
if (drops.length) {
  lines.push('', `**Performance fell by more than ${MAX_DROP.toFixed(2)}:**`, ...drops.map((d) => `- ${d}`));
  process.exitCode = 1;
}
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
else console.log(lines.join('\n'));
