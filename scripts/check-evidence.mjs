// Prints a Markdown list of stale evidence (screenshots or demos captured before a
// project's last update) for the daily Action in .github/workflows/refresh-activity.yml.
// Prints nothing when everything is current. Exits 1 only if projects.js is malformed.
import { readFileSync } from 'node:fs';
import { evidenceReport } from './evidence.mjs';

const text = readFileSync(new URL('../src/data/projects.js', import.meta.url), 'utf8')
  .split('\n')
  .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
  .join('\n');
const { problems, stale } = evidenceReport(text);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
// Commit activity can go stale silently: the daily fetch is unauthenticated and its
// step is continue-on-error, so a rate-limited run leaves yesterday's numbers in place
// with nothing to show for it. Report it here, in the issue that already exists.
const activityFile = process.env.ACTIVITY_FILE
  ? new URL(process.env.ACTIVITY_FILE, `file://${process.cwd()}/`)
  : new URL('../src/data/activity.json', import.meta.url);
const activity = JSON.parse(readFileSync(activityFile, 'utf8'));
const daysBehind = Math.floor((Date.now() - Date.parse(`${activity.to}T00:00:00Z`)) / 86_400_000);

const lines = [
  ...(daysBehind > 2
    ? [`- **Commit activity** was last refreshed ${activity.to}, ${daysBehind} days ago. The daily fetch in refresh-activity.yml may be failing, so the racks are showing old counts.`]
    : []),
  ...stale.map((s) => `- **${s.slug}**: ${s.kind} from ${s.captured}, but the project was updated ${s.updated}.`),
];
if (lines.length) console.log(lines.join('\n'));
