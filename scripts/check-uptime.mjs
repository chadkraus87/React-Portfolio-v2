// Checks each project's live link and records whether it answered. Drives the
// rack's power lights and the daily "Live demo unreachable" issue.
//
//   node scripts/check-uptime.mjs            probe every live link, update src/data/uptime.json
//   node scripts/check-uptime.mjs --report   print a Markdown list of unreachable demos (no network)
//
// uptime.json only changes when a site flips between answering and not, so a
// quiet day makes no commit and no redeploy. "Answered" means the server replied
// with anything below 500 other than 404/410: a login wall or a bot challenge
// (401/403) still counts, because the demo is up behind it.
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../src/data/uptime.json', import.meta.url);

export const answered = (status) => status > 0 && status < 500 && status !== 404 && status !== 410;
for (const [status, want] of [[200, true], [301, true], [403, true], [404, false], [502, false], [0, false]]) {
  if (answered(status) !== want) throw new Error(`answered(${status}) should be ${want}`);
}

const text = readFileSync(new URL('../src/data/projects.js', import.meta.url), 'utf8')
  .split('\n').filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line)).join('\n');
const sites = [...text.matchAll(/slug:\s*'([^']+)'[\s\S]*?projectLink:\s*(null|'([^']+)')/g)]
  .filter((m) => m[3])
  .map((m) => ({ slug: m[1], url: m[3] }));

let current = { sites: {} };
try { current = JSON.parse(readFileSync(file, 'utf8')); } catch { /* first run */ }

if (process.argv.includes('--report')) {
  const down = Object.entries(current.sites).filter(([, s]) => !s.ok);
  if (down.length) console.log(down.map(([slug, s]) => `- **${slug}**: no answer since ${s.since} (last status ${s.status || 'timeout'}).`).join('\n'));
  process.exit(0);
}

// Two tries, five seconds apart, so one slow cold start is not an outage.
const probe = async (url) => {
  let status = 0;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'chad-kraus-portfolio uptime check' } });
      status = res.status;
      await res.body?.cancel();
    } catch {
      status = 0;
    }
    if (answered(status)) return status;
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  return status;
};

const today = new Date().toISOString().slice(0, 10);
const next = { sites: {} };
let changed = Object.keys(current.sites).sort().join() !== sites.map((s) => s.slug).sort().join();
for (const { slug, url } of sites) {
  const status = await probe(url);
  const ok = answered(status);
  const prev = current.sites[slug];
  if (!prev || prev.ok !== ok) changed = true;
  next.sites[slug] = prev && prev.ok === ok ? prev : { ok, since: today, status };
  console.log(`${slug.padEnd(24)} ${ok ? 'answered' : 'NO ANSWER'} (${status || 'timeout'})`);
}
if (changed) {
  writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
  console.log('wrote src/data/uptime.json');
} else {
  console.log('no change; src/data/uptime.json untouched');
}
