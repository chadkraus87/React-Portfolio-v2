// Renders the resume to HTML and prints it to PDF with headless Chromium.
import { writeFileSync } from 'node:fs';
import pw from 'playwright';
const { chromium } = pw;
import { resume as r } from './resume.data.mjs';

// Tuned against real PDF page count: this is the largest readable setting
// that still fits two pages. Re-check the page count if content grows.
const FS = process.env.FS || '9.0pt';
const LH = process.env.LH || '1.28';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  @page { size: Letter; margin: 0.5in 0.55in; }
  /* Force light: without these the document inherits the viewer's dark scheme,
     which would print dark text on a dark background. */
  :root { color-scheme: light; }
  html, body { background: #ffffff; }
  * { box-sizing: border-box; }
  body {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: ${FS}; line-height: ${LH}; color: #1c1c1c; margin: 0;
    -webkit-font-smoothing: antialiased;
  }
  h1 { font-size: 20pt; letter-spacing: -0.3pt; margin: 0 0 2pt; color: #1e3a2b; }
  .title { font-size: 9.2pt; color: #2e5940; font-weight: 600; margin-bottom: 3pt; }
  .contact { font-size: 8.6pt; color: #444; }
  .contact span:not(:last-child)::after { content: "   ·   "; color: #999; }
  h2 {
    font-size: 8.4pt; letter-spacing: 1.4pt; text-transform: uppercase;
    color: #1e3a2b; border-bottom: 1px solid #c8d5c8;
    padding-bottom: 2pt; margin: 8.5pt 0 5pt;
  }
  p { margin: 0 0 4pt; }
  .summary { text-align: justify; }
  table.skills { width: 100%; border-collapse: collapse; }
  table.skills td { vertical-align: top; padding: 1.1pt 0; }
  table.skills td.k { width: 1.42in; font-weight: 700; color: #1e3a2b; padding-right: 8pt; }
  .job { margin-bottom: 6.5pt; }
  .jobhead { display: flex; justify-content: space-between; align-items: baseline; }
  .role { font-weight: 700; font-size: 10.2pt; color: #1c1c1c; }
  .dates { font-size: 8.6pt; color: #555; white-space: nowrap; padding-left: 10pt; }
  .org { font-size: 9pt; color: #2e5940; margin-bottom: 3.5pt; }
  ul { margin: 0; padding-left: 12pt; }
  li { margin-bottom: 1.6pt; text-align: justify; }
  li::marker { color: #6b8f71; }
  .projintro { font-size: 8.8pt; color: #555; margin-bottom: 6pt; }
  .proj { margin-bottom: 4.2pt; break-inside: avoid-page; }
  .projname { font-weight: 700; color: #1c1c1c; }
  .projblurb { color: #555; font-weight: 400; }
  .projstack { font-size: 8.2pt; color: #2e5940; margin: 0.5pt 0 1.5pt; }
  .projtext { text-align: justify; }
  .edu { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4pt; }
  .edutitle { font-weight: 700; }
  .eduorg { color: #2e5940; }
  .edudetail { font-size: 8.6pt; color: #555; }
</style></head><body>

<h1>${esc(r.name)}</h1>
<div class="title">${esc(r.title)}</div>
<div class="contact">${r.contact.map((c) => `<span>${esc(c)}</span>`).join('')}</div>

<h2>Professional Summary</h2>
<p class="summary">${esc(r.summary)}</p>

<h2>Core Skills &amp; Expertise</h2>
<table class="skills">
${r.skills.map(([k, v]) => `<tr><td class="k">${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}
</table>

<h2>Work Experience</h2>
${r.experience
  .map(
    (j) => `<div class="job">
  <div class="jobhead"><span class="role">${esc(j.role)}</span><span class="dates">${esc(j.dates)}</span></div>
  <div class="org">${esc(j.org)}</div>
  <ul>${j.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
</div>`
  )
  .join('')}

<h2>Selected Projects</h2>
<p class="projintro">${esc(r.projectsIntro)}</p>
${r.projects
  .map(
    (p) => `<div class="proj">
  <div><span class="projname">${esc(p.name)}</span> <span class="projblurb">— ${esc(p.blurb)}</span></div>
  <div class="projstack">${esc(p.stack)}</div>
  <div class="projtext">${esc(p.text)}</div>
</div>`
  )
  .join('')}

<h2>Education &amp; Certifications</h2>
${r.education
  .map(
    (e) => `<div class="edu">
  <div>
    <div class="edutitle">${esc(e.title)}${e.org ? ` <span class="eduorg">— ${esc(e.org)}</span>` : ''}</div>
    <div class="edudetail">${esc(e.detail)}</div>
  </div>
  <div class="dates">${esc(e.date)}</div>
</div>`
  )
  .join('')}

</body></html>`;

const out = process.argv[2] || 'Chadwick_Kraus_Resume.pdf';
writeFileSync('resume.html', html);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle' });
await page.pdf({ path: out, format: 'Letter', printBackground: true });
const pages = await page.evaluate(() => document.body.scrollHeight);
await browser.close();
console.log(`wrote ${out} (content height ${pages}px)`);
