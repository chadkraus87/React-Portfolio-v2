// Checks each project's live link and records whether it answered. Drives the
// rack's power lights, the 30-day uptime strip on each case study, and the daily
// "Live demo not answering" issue.
//
//   node scripts/check-uptime.mjs            probe every live link, update src/data/uptime.json
//   node scripts/check-uptime.mjs --report   print a Markdown list of unreachable demos (no network)
//
// uptime.json only changes when a site flips between answering and not, so a quiet
// day makes no commit and no redeploy. Each site keeps the day it was first checked
// and a list of outages ({ from, to }, `to` null while it lasts); the strip is
// derived from those. "Answered" means the server replied with anything below 500
// other than 404/410: a login wall or a bot challenge (401/403) still counts,
// because the demo is up behind it.
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';

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

// Two tries, five seconds apart, so one slow cold start is not an outage. Response
// times go to the job summary only: committing them would redeploy the site daily.
const probe = async (url) => {
  let status = 0;
  for (let attempt = 0; attempt < 2; attempt++) {
    const started = performance.now();
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'chad-kraus-portfolio uptime check' } });
      status = res.status;
      await res.body?.cancel();
    } catch {
      status = 0;
    }
    if (answered(status)) return { status, ms: Math.round(performance.now() - started) };
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  return { status, ms: null };
};

const today = new Date().toISOString().slice(0, 10);
const next = { sites: {} };
const timings = [];
let changed = Object.keys(current.sites).sort().join() !== sites.map((s) => s.slug).sort().join();
for (const { slug, url } of sites) {
  const { status, ms } = await probe(url);
  timings.push(`| ${slug} | ${answered(status) ? 'answered' : 'no answer'} | ${status || 'timeout'} | ${ms ?? '—'} |`);
  const ok = answered(status);
  const prev = current.sites[slug];
  // Older records predate the outage history; they start it from their `since` day.
  const record = prev
    ? { ...prev, firstChecked: prev.firstChecked ?? prev.since, outages: prev.outages ?? [] }
    : { ok, since: today, status, firstChecked: today, outages: [] };
  if (!prev || !prev.firstChecked || !prev.outages) changed = true;
  if (prev && prev.ok !== ok) {
    changed = true;
    record.ok = ok;
    record.since = today;
    record.status = status;
    if (ok) {
      const open = record.outages.findLast((o) => o.to === null);
      if (open) open.to = today;
    } else {
      record.outages = [...record.outages, { from: today, to: null }];
    }
  } else if (!prev && !ok) {
    record.outages = [{ from: today, to: null }];
  }
  // Keep a year of outages at most.
  record.outages = record.outages.slice(-50);
  next.sites[slug] = record;
  console.log(`${slug.padEnd(24)} ${ok ? 'answered' : 'NO ANSWER'} (${status || 'timeout'}${ms ? `, ${ms} ms` : ''})`);
}
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, ['### Live demos', '', '| Demo | Result | Status | Response (ms) |', '| --- | --- | --- | --- |', ...timings, ''].join('\n'));
}
if (changed) {
  writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
  console.log('wrote src/data/uptime.json');
} else {
  console.log('no change; src/data/uptime.json untouched');
}
