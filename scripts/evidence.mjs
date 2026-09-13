// Evidence dates, shared by scripts/prerender.mjs (fails the build) and
// scripts/check-evidence.mjs (the daily Action that opens a GitHub issue).
// `text` is projects.js with comment lines already stripped.
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export function evidenceReport(text) {
  const problems = [];
  const stale = [];
  for (const [, slug] of text.matchAll(/slug:\s*'([^']+)'/g)) {
    const block = (text.split(`slug: '${slug}'`)[1] ?? '').split(/\n {2}\},?\n/)[0];
    const field = (key) => block.match(new RegExp(`\\b${key}:\\s*'([^']*)'`))?.[1];
    const demo = field('demo');
    const imageDate = field('imageDate');
    const demoDate = field('demoDate');
    const updated = field('updated');
    if (!MONTH.test(imageDate ?? '')) problems.push(`${slug}: imageDate must be 'YYYY-MM'`);
    if (demo && !MONTH.test(demoDate ?? '')) problems.push(`${slug}: a demo needs demoDate 'YYYY-MM'`);
    if (demo && !/demoChapters:\s*\[\s*\[\s*0\s*,/.test(block)) problems.push(`${slug}: a demo needs demoChapters starting at 0`);
    const captured = demo ? demoDate : imageDate;
    if (captured && updated && captured < updated) {
      stale.push({ slug, kind: demo ? 'demo' : 'screenshot', captured, updated });
    }
  }
  return { problems, stale };
}
