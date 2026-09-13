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
if (stale.length) {
  console.log(stale.map((s) => `- **${s.slug}**: ${s.kind} from ${s.captured}, but the project was updated ${s.updated}.`).join('\n'));
}
