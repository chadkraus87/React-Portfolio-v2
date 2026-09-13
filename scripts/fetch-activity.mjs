// Refresh src/data/activity.json: public commit counts per project, per week,
// for the last twelve weeks. Drives the rack's drive lights and commit heat.
//
//   node scripts/fetch-activity.mjs
//
// Deliberately UNAUTHENTICATED. The GitHub API only answers anonymous requests
// for public repositories, so a private repo can never leak into the site even
// if someone later adds its URL by mistake. Each repo is also checked for
// `private: false` before its commits are counted.
//
// The output is committed, like the card images: Vercel's build IPs share the
// anonymous rate limit, so fetching at build time would fail unpredictably.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const WEEKS = 12;
const DAY = 86_400_000;

// Day index (0-based) of an ISO date inside the window, bucketed to weeks.
export const weekOf = (iso, fromMs) => Math.floor((Date.parse(iso) - fromMs) / (7 * DAY));

// Self-check: the first and last day of the window, and the day after it.
{
  const from = Date.parse('2026-06-21T00:00:00Z');
  const cases = [['2026-06-21T00:00:01Z', 0], ['2026-06-27T23:59:59Z', 0], ['2026-06-28T00:00:00Z', 1], ['2026-09-12T23:00:00Z', 11], ['2026-09-13T00:00:00Z', 12]];
  for (const [iso, want] of cases) {
    const got = weekOf(iso, from);
    if (got !== want) throw new Error(`weekOf(${iso}) = ${got}, expected ${want}`);
  }
}

const src = readFileSync(join(root, 'src', 'data', 'projects.js'), 'utf8');
const entries = [...src.matchAll(/slug:\s*'([^']+)'[\s\S]*?repoLink:\s*(null|'([^']+)')/g)]
  .map((m) => ({ slug: m[1], repo: m[3] ?? null }));

const today = new Date();
const to = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
const from = new Date(to.getTime() - WEEKS * 7 * DAY);
const gh = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-activity' } });
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return res.json();
};

const repos = {};
for (const { slug, repo } of entries) {
  if (!repo) { console.log(`${slug.padEnd(24)} no repoLink, skipped`); continue; }
  const [, owner, name] = repo.match(/github\.com\/([^/]+)\/([^/#?]+)/) ?? [];
  if (!owner) throw new Error(`${slug}: cannot parse repo URL ${repo}`);
  const meta = await gh(`/repos/${owner}/${name}`);
  if (meta.private !== false) throw new Error(`${slug}: ${owner}/${name} is not public`);
  const weeks = Array(WEEKS).fill(0);
  for (let page = 1; ; page++) {
    const batch = await gh(`/repos/${owner}/${name}/commits?since=${from.toISOString()}&until=${to.toISOString()}&per_page=100&page=${page}`);
    for (const c of batch) {
      const w = weekOf(c.commit.author.date, from.getTime());
      if (w >= 0 && w < WEEKS) weeks[w] += 1;
    }
    if (batch.length < 100) break;
  }
  repos[slug] = { total: weeks.reduce((a, b) => a + b, 0), weeks };
  console.log(`${slug.padEnd(24)} ${String(repos[slug].total).padStart(3)} public commits`);
}

const out = { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10), repos };
writeFileSync(join(root, 'src', 'data', 'activity.json'), `${JSON.stringify(out, null, 2)}\n`);
console.log(`wrote src/data/activity.json (${out.from} to ${out.to})`);
