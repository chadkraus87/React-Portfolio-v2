// Summarises where visits came from, for the daily job's run summary:
//
//   node scripts/campaign-summary.mjs [days]
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

if (!/^[a-z0-9-]{1,40}$/.test(SITE)) throw new Error(`unexpected GoatCounter site: "${SITE}"`);
if (!TOKEN && !FIXTURE) {
  console.log('_Where visits came from: add a GoatCounter API token as the `GOATCOUNTER_TOKEN` secret to see this._');
  process.exit(0);
}

const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 13).replace('T', 'T');

async function load() {
  if (FIXTURE) return JSON.parse(await (await import('node:fs/promises')).readFile(FIXTURE, 'utf8'));
  const url = `https://${SITE}.goatcounter.com/api/v0/stats/hits?start=${since}:00:00Z&limit=200`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  // Never echo the body on failure: it is someone else's data, and the token is in play.
  if (!res.ok) throw new Error(`GoatCounter answered ${res.status}`);
  return res.json();
}

const data = await load();
const events = (data.hits ?? [])
  .filter((h) => h.event && String(h.path).replace(/^\//, '').startsWith('from/'))
  .map((h) => ({ path: String(h.path).replace(/^\//, ''), count: Number(h.count) || 0 }));

if (!events.length) {
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

console.log([
  `### Where visits came from (last ${days} days)`,
  '',
  ...table('Landed on', landed, ['Source', 'Page', 'Visits']),
  ...table('Pages opened', opened, ['Source', 'Page', 'Visits']),
].join('\n'));
