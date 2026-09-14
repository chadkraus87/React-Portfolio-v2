// Builds src/data/changelog.json: what changed in each public project, month by
// month, straight from its commits. Rendered at /changes.
//
//   node scripts/build-changelog.mjs                    the previous full month
//   node scripts/build-changelog.mjs 2026-08 2026-09    those months (a month still under way is marked partial)
//
// Unauthenticated, like fetch-activity.mjs, so only public repositories are ever
// read. Merge commits and the site's own automated commits are left out.
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../src/data/changelog.json', import.meta.url);
const SITE = { slug: null, title: 'This portfolio', repo: 'https://github.com/chadkraus87/React-Portfolio-v2' };
const SKIP = /^(Merge |chore: refresh public)/i;
const RANK = ['feat', 'fix', 'content', 'perf', 'security'];

// Chad's edits: subjects to leave out of the highlights, or reword
// (scripts/changelog-curation.json). Counts always include every commit.
const curation = JSON.parse(readFileSync(new URL('./changelog-curation.json', import.meta.url), 'utf8'));
const HIDE = new Set(curation.hide ?? []);
const RENAME = curation.rename ?? {};

// "feat(ui): add a thing" -> { type: 'feat', text: 'Add a thing' }
export const tidy = (subject) => {
  const m = subject.match(/^(\w+)(?:\([^)]*\))?!?:\s*(.+)$/);
  // A trailing pull-request number (#12) says nothing to a reader and splits duplicates.
  const body = (m ? m[2] : subject).replace(/\s*\(#\d+\)$/, '').trim();
  return { type: m ? m[1].toLowerCase() : null, text: body.charAt(0).toUpperCase() + body.slice(1) };
};
{
  const got = JSON.stringify([tidy('feat(ui): add racks'), tidy('Fix typo'), tidy('fix: pin a dep (#1)')]);
  const want = JSON.stringify([{ type: 'feat', text: 'Add racks' }, { type: null, text: 'Fix typo' }, { type: 'fix', text: 'Pin a dep' }]);
  if (got !== want) throw new Error(`tidy: ${got}`);
}

const text = readFileSync(new URL('../src/data/projects.js', import.meta.url), 'utf8')
  .split('\n').filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line)).join('\n');
const sources = [
  ...[...text.matchAll(/slug:\s*'([^']+)'[\s\S]*?title:\s*'((?:[^'\\]|\\.)*)'[\s\S]*?repoLink:\s*(null|'([^']+)')/g)]
    .filter((m) => m[4])
    .map((m) => ({ slug: m[1], title: m[2].replace(/\\'/g, "'"), repo: m[4] })),
  SITE,
];

const gh = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-changelog' } });
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return res.json();
};

const now = new Date();
const previous = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)).toISOString().slice(0, 7);
const args = process.argv.slice(2).filter((a) => /^\d{4}-(0[1-9]|1[0-2])$/.test(a));
const months = args.length ? args : [previous];

let log = { months: [] };
try { log = JSON.parse(readFileSync(file, 'utf8')); } catch { /* first run */ }

for (const month of months) {
  const [y, m] = month.split('-').map(Number);
  const since = new Date(Date.UTC(y, m - 1, 1));
  const until = new Date(Date.UTC(y, m, 1));
  const partial = until > now;
  const projects = [];
  for (const { slug, title, repo } of sources) {
    const [, owner, name] = repo.match(/github\.com\/([^/]+)\/([^/#?]+)/) ?? [];
    const meta = await gh(`/repos/${owner}/${name}`);
    if (meta.private !== false) throw new Error(`${owner}/${name} is not public`);
    const subjects = [];
    for (let page = 1; ; page++) {
      const batch = await gh(`/repos/${owner}/${name}/commits?since=${since.toISOString()}&until=${(partial ? now : until).toISOString()}&per_page=100&page=${page}`);
      for (const c of batch) {
        const subject = c.commit.message.split('\n')[0].trim();
        if (subject && !SKIP.test(subject)) subjects.push(subject);
      }
      if (batch.length < 100) break;
    }
    if (!subjects.length) continue;
    const seen = new Set();
    const highlights = subjects.map(tidy)
      .filter((h) => !HIDE.has(h.text))
      .map((h) => (RENAME[h.text] ? { ...h, text: RENAME[h.text] } : h))
      .filter((h) => h.type !== 'chore' && !seen.has(h.text) && seen.add(h.text))
      .sort((a, b) => (RANK.indexOf(a.type) + 1 || 99) - (RANK.indexOf(b.type) + 1 || 99))
      .slice(0, 4);
    projects.push({ slug, title, commits: subjects.length, highlights });
    console.log(`${month} ${title.padEnd(24)} ${String(subjects.length).padStart(3)} commits`);
  }
  projects.sort((a, b) => b.commits - a.commits);
  log.months = log.months.filter((entry) => entry.month !== month);
  log.months.push({ month, through: partial ? now.toISOString().slice(0, 10) : null, projects });
}
log.months.sort((a, b) => b.month.localeCompare(a.month));
log.months = log.months.slice(0, 12);
writeFileSync(file, `${JSON.stringify(log, null, 2)}\n`);
console.log(`wrote src/data/changelog.json (${log.months.map((e) => e.month).join(', ')})`);
