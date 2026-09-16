// Guards the deployment gate's own wiring, so the bug that let a failing job report
// success can't come back: every Vercel status must be posted by this repo's own
// action, once as pending and once from the job's real result, as the job's last step.
//
//   node scripts/check-gate.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const DIR = '.github/workflows';
const CONTEXTS = ['quality', 'visual', 'smoke'].map((n) => `Vercel - chad-kraus-portfolio: ${n}`);
const RESULT_STATE = "state: ${{ job.status == 'success' && 'success' || 'failure' }}";
const problems = [];

// Every YAML under .github has to parse. A local action that doesn't load fails every
// job that uses it, and no status reaches Vercel: an unquoted description containing
// ": " did exactly that on fcbac4d.
const yamlFiles = [
  ...readdirSync(DIR).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml')).map((f) => `${DIR}/${f}`),
  ...readdirSync('.github/actions', { withFileTypes: true }).filter((d) => d.isDirectory())
    .flatMap((d) => ['action.yml', 'action.yaml'].map((n) => `.github/actions/${d.name}/${n}`).filter(existsSync)),
];
try {
  execFileSync('ruby', ['-ryaml', '-e', 'ARGV.each { |f| YAML.load_file(f) }', ...yamlFiles], { stdio: 'pipe' });
} catch (error) {
  const message = error.stderr?.toString().trim() || error.message;
  if (error.code === 'ENOENT') console.warn('ruby not found: skipped the YAML parse check');
  else problems.push(`YAML does not parse:\n    ${message}`);
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.yml'));
const all = files.map((f) => [f, readFileSync(`${DIR}/${f}`, 'utf8')]);

for (const [file, text] of all) {
  if (text.includes('repository-dispatch/actions/status')) {
    problems.push(`${file}: uses vercel/repository-dispatch/actions/status, which grades the first job in the run, not its own`);
  }
}

for (const context of CONTEXTS) {
  const uses = all.filter(([, text]) => text.includes(`context: '${context}'`));
  if (!uses.length) { problems.push(`no workflow posts "${context}"`); continue; }
  for (const [file, text] of uses) {
    const steps = text.split('      - name: ').filter((s) => s.includes(`context: '${context}'`));
    const pending = steps.filter((s) => s.includes('state: pending'));
    const result = steps.filter((s) => s.includes(RESULT_STATE));
    if (pending.length !== 1) problems.push(`${file}: expected one pending step for "${context}", found ${pending.length}`);
    if (result.length !== 1) problems.push(`${file}: expected one result step for "${context}" passing job.status, found ${result.length}`);
    if (result.length && !result[0].includes('if: always()')) problems.push(`${file}: the result step for "${context}" must run with if: always()`);
    // The result step has to be last in its job, or a later failure goes unreported.
    const after = text.slice(text.indexOf(RESULT_STATE, text.indexOf(`context: '${context}'`)));
    const nextStep = after.indexOf('\n      - ');
    const nextJob = after.search(/\n  [a-z][\w-]*:\n/);
    if (nextStep !== -1 && (nextJob === -1 || nextStep < nextJob)) {
      problems.push(`${file}: the result step for "${context}" is not the last step in its job`);
    }
  }
}

if (problems.length) {
  console.error(`deployment gate wiring:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`deployment gate wiring ok: ${CONTEXTS.length} checks report their own job result`);
