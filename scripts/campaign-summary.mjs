// Summarises where visits came from, for the daily job's run summary:
//
//   node scripts/campaign-summary.mjs [days] [--write <file>]
//
// Reads the anonymous `from/...` events Analytics.jsx records (src/lib/campaign.js)
// through GoatCounter's API, so Chad can see which links people followed without
// opening the dashboard. Needs GOATCOUNTER_TOKEN; without it this prints a short
// notice and exits 0, so the daily data refresh never depends on analytics.
//
// GOATCOUNTER_FIXTURE=<file> reads a saved API response instead of calling out,
// which is how this is tested.
const SITE = process.env.GOATCOUNTER_SITE || 'chadkraus';
const TOKEN = process.env.GOATCOUNTER_TOKEN || '';
const FIXTURE = process.env.GOATCOUNTER_FIXTURE || '';
const days = Math.min(365, Math.max(1, Number(process.argv[2]) || 30));
const writeTo = process.argv.includes('--write') ? process.argv[process.argv.indexOf('--write') + 1] : '';
// Only rank a page once it has enough visits to mean anything.
const LEAD_FLOOR = 5;

if (!/^[a-z0-9-]{1,40}$/.test(SITE)) throw new Error(`unexpected GoatCounter site: "${SITE}"`);
if (!TOKEN && !FIXTURE) {
  console.log('_Where visits came from: add a GoatCounter API token as the `GOATCOUNTER_TOKEN` secret to see this._');
  process.exit(0);
}

const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 13).replace('T', 'T');

async function load() {
  if (FIXTURE) return JSON.parse(await (await import('node:fs/promises')).readFile(FIXTURE, 'utf8'));
  const url = `https://${SITE}.goatcounter.com/api/v0/stats/hits?start=${since}:00:00Z&limit=200`;
  // GoatCounter decides JSON-or-HTML from Content-Type, not Accept (an Accept-only
  // request gets the HTML login page), so send both.
  const headers = { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json', accept: 'application/json' };
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  // On failure the body is an error message, not statistics: showing a trimmed copy is
  // what turns "the step went red somewhere" into a diagnosis. The token is never in it.
  if (!res.ok) {
    const detail = (await res.text()).replace(/\s+/g, ' ').trim().slice(0, 160);
    // Ask the token who it is: separates "this token can't read anything" from "only
    // this endpoint is wrong". Runs where the token lives, and prints only a status.
    let me = 'not checked';
    try {
      const probe = await fetch(`https://${SITE}.goatcounter.com/api/v0/me`, { headers, signal: AbortSignal.timeout(10000) });
      me = String(probe.status);
    } catch { me = 'unreachable'; }
    const error = new Error(`GoatCounter answered ${res.status} for ${url.replace(/^https:\/\//, '')} (/api/v0/me answered ${me}) — ${detail}`);
    error.soft = true;
    throw error;
  }
  return res.json();
}

// A failure here is a notice in the summary, never a failed job: this is analytics
// sitting next to the data refresh the site actually depends on.
let data;
try {
  data = await load();
} catch (error) {
  console.log(`_Could not read GoatCounter: ${error.message}_`);
  process.exit(0);
}
const events = (data.hits ?? [])
  .filter((h) => h.event && String(h.path).replace(/^\//, '').startsWith('from/'))
  .map((h) => ({ path: String(h.path).replace(/^\//, ''), count: Number(h.count) || 0 }));

const writeLeads = async (leads) => {
  if (!writeTo) return;
  const { writeFile } = await import('node:fs/promises');
  // Ranking only, never counts: the site says what to lead with, not how much traffic it gets.
  await writeFile(writeTo, `${JSON.stringify({ updated: new Date().toISOString().slice(0, 10), days, leads }, null, 2)}\n`);
};

if (!events.length) {
  await writeLeads([]);
  console.log(`_No \`?from=\` visits recorded in the last ${days} days._`);
  process.exit(0);
}

const landed = new Map();
const opened = new Map();
for (const { path, count } of events) {
  const [, source, ...rest] = path.split('/');
  const where = `/${rest.join('/')}`;
  if (rest[0] === 'landed') landed.set(`${source}|/${rest.slice(1).join('/')}`, (landed.get(`${source}|/${rest.slice(1).join('/')}`) ?? 0) + count);
  else opened.set(`${source}|${where}`, (opened.get(`${source}|${where}`) ?? 0) + count);
}

const table = (title, rows, headers) => {
  if (!rows.size) return [];
  const sorted = [...rows].sort((a, b) => b[1] - a[1]).slice(0, 10);
  return [
    `**${title}**`,
    '',
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...sorted.map(([key, count]) => `| ${key.split('|')[0]} | \`${key.split('|')[1]}\` | ${count} |`),
    '',
  ];
};

// What to lead with: the most-opened page per source, above the floor.
const best = new Map();
for (const [key, count] of opened) {
  const [source, path] = key.split('|');
  if (count < LEAD_FLOOR) continue;
  if ((best.get(source)?.count ?? 0) < count) best.set(source, { path, count });
}
await writeLeads([...best].map(([source, { path }]) => ({ source, path })));

console.log([
  `### Where visits came from (last ${days} days)`,
  '',
  ...table('Landed on', landed, ['Source', 'Page', 'Visits']),
  ...table('Pages opened', opened, ['Source', 'Page', 'Visits']),
].join('\n'));
