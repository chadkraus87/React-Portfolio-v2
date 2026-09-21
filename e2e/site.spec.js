// Accessibility and behaviour checks against the production build.
// `npm run build && npm run test:e2e`. CI runs the same on every push.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

// Project slugs straight from the data file, skipping commented examples.
const SLUGS = [...readFileSync('src/data/projects.js', 'utf8')
  .split('\n').filter((line) => !/^\s*\/\//.test(line)).join('\n')
  .matchAll(/slug: '([^']+)'/g)].map((m) => m[1]);
const ROUTES = ['/', '/portfolio', '/resume', '/contact', '/changes', '/status', '/accessibility', '/now', '/interview-pack', '/no-such-page', ...SLUGS.map((s) => `/projects/${s}`)];

const watchErrors = (page) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
};

// The first-visit tour would sit over the room in every other test.
test.beforeEach(async ({ page }, testInfo) => {
  if (!testInfo.title.includes('tour')) await page.addInitScript(() => localStorage.setItem('sr-tour', 'done'));
});

for (const theme of ['dark', 'light']) {
  test.describe(`axe, ${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      if (theme === 'light') await page.addInitScript(() => localStorage.setItem('theme', 'light'));
      // Settled frames: nothing mid-animation when contrast is measured.
      await page.emulateMedia({ reducedMotion: 'reduce' });
    });
    for (const path of ROUTES) {
      test(path, async ({ page }) => {
        const errors = watchErrors(page);
        await page.goto(path);
        await page.waitForLoadState('load');
        const { violations } = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .exclude('.resume-frame')
          .analyze();
        expect(violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
        expect(errors).toEqual([]);
      });
    }
  });
}

test.describe('phone width', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });
  for (const path of ROUTES) {
    test(`no sideways scroll on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('load');
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    });
  }
});

test.describe('server room', () => {
  test('pulling a unit opens its sheet and a shareable address; Escape puts it back', async ({ page }) => {
    await page.goto('/');
    const unit = page.locator('.unit[data-i="2"]');
    const name = (await unit.getAttribute('aria-label')).split(',')[0];
    await unit.click();
    await expect(page.locator('.sr-sheet')).toHaveClass(/open/);
    await expect(page.locator('#sr-sheet-title')).toHaveText(name);
    await expect(page).toHaveURL(/\?unit=/);
    await page.keyboard.press('Escape');
    await expect(page.locator('.sr-sheet')).not.toHaveClass(/open/);
    await expect(page).not.toHaveURL(/unit=/);
  });

  test('a shared unit link opens that unit; an unknown one is dropped', async ({ page }) => {
    await page.goto('/?unit=greenline');
    await expect(page.locator('#sr-sheet-title')).toHaveText('Greenline');
    await page.goto('/?unit=nope');
    await expect(page).not.toHaveURL(/unit=/);
    await expect(page.locator('.sr-sheet')).not.toHaveClass(/open/);
  });

  test('the console fires signals, and hire opens a printable snapshot', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('ControlOrMeta+k');
    const q = page.locator('#sr-kvm-q');
    await expect(q).toBeFocused();
    await q.fill('signal react');
    await q.press('Enter');
    await expect(page.locator('.sr-live')).toHaveText(/Signal fired through React/);
    await q.fill('ping nowhere');
    await q.press('Enter');
    await expect(page.locator('.sr-kvm-log')).toContainText('No route to host');
    await q.fill('hire');
    await q.press('Enter');
    await expect(page.locator('#sr-sheet-title')).toHaveText('Chadwick (Chad) Kraus');
    await expect(page.getByRole('button', { name: 'Print this snapshot' })).toBeVisible();
    await page.evaluate(() => document.documentElement.classList.add('sr-printing'));
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.nav-wrap')).toBeHidden();
    await expect(page.locator('.sr-racks, .sr-aisle')).toBeHidden();
    await expect(page.locator('#sr-sheet-title')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Print this snapshot' })).toBeHidden();
  });
});

test.describe('case studies', () => {
  test('demo captions follow the video and the transcript lists every chapter', async ({ page }) => {
    await page.goto('/projects/greenline');
    await page.locator('.monitor video').evaluate(async (v) => {
      if (v.readyState < 1) await new Promise((r) => v.addEventListener('loadedmetadata', r, { once: true }));
      v.pause();
      v.currentTime = 17.5;
    });
    await expect(page.locator('.monitor-cc')).toHaveText(/Debts/);
    await page.getByRole('button', { name: 'Captions' }).click();
    await expect(page.locator('.monitor-cc')).toBeHidden();
    await page.locator('.monitor-transcript summary').click();
    await expect(page.locator('.monitor-transcript li')).toHaveCount(7);
    await expect(page.locator('.monitor-note')).toContainText('Recorded Sep 2026');
    await expect(page.locator('.monitor-note')).toContainText(/simulated budget data/i);
  });

  test('screenshots say when they were captured and link back into the rack', async ({ page }) => {
    await page.goto('/projects/jarvis');
    await expect(page.locator('.monitor-note')).toContainText('Screenshot from Sep 2026');
    await expect(page.getByRole('link', { name: 'Show in the rack' })).toHaveAttribute('href', '/?unit=jarvis');
  });

  test('reduced motion: demos wait for Play and route changes skip the trace', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/projects/petcenza');
    await page.waitForTimeout(800);
    expect(await page.locator('.monitor video').evaluate((v) => v.paused)).toBe(true);
    await page.getByRole('link', { name: 'All projects' }).click();
    await expect(page).toHaveURL(/\/portfolio$/);
    const traces = await page.locator('.route-trace').evaluateAll((els) => els.map((e) => getComputedStyle(e).display));
    expect(traces.every((d) => d === 'none')).toBe(true);
  });
});

test('the theme toggle switches to light and remembers it', async ({ page }) => {
  await page.goto('/portfolio');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(244, 241, 234)');
});

test('first visit: the tour offers itself, walks each step and stays dismissed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const tour = page.getByRole('region', { name: 'Guided tour' });
  await expect(tour).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).include('.sr-tour').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(violations).toEqual([]);
  await tour.getByRole('button', { name: 'Take the tour' }).click();
  await expect(page.locator('#sr-sheet-title')).toHaveText('PetCenza');
  await tour.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('.sr-live')).toHaveText(/Signal fired through/);
  await tour.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('#sr-kvm-q')).toHaveValue('hire');
  await tour.getByRole('button', { name: 'Next' }).click();
  await tour.getByRole('button', { name: 'Done' }).click();
  await expect(tour).toBeHidden();
  await page.reload();
  await page.waitForTimeout(600);
  await expect(page.getByRole('region', { name: 'Guided tour' })).toBeHidden();
});

test('room interactions send one anonymous analytics event each', async ({ page }) => {
  await page.route(/gc\.zgo\.at/, (route) => route.abort());
  await page.addInitScript(() => { window.__events = []; window.goatcounter = { count: (e) => window.__events.push(e) }; });
  await page.goto('/');
  const unit = page.locator('.unit[data-i="2"]');
  await unit.click();
  await page.keyboard.press('Escape');
  await unit.click();
  const paths = await page.evaluate(() => window.__events.filter((e) => e.event).map((e) => e.path));
  expect(paths.filter((p) => p.startsWith('event/unit/'))).toHaveLength(1);
});

test('case studies show the architecture layers from the project data', async ({ page }) => {
  await page.goto('/projects/petcenza');
  await expect(page.getByRole('heading', { name: 'How it fits together' })).toBeVisible();
  await expect(page.locator('.arch-layer')).toHaveCount(5);
  await expect(page.locator('.arch-layer').first()).toContainText('IndexedDB outbox');
});

test('shared unit links unfurl with that project', async ({ request }) => {
  const { default: middleware } = await import('../middleware.js');
  const rewriteOf = (url) => middleware(new Request(url)).headers.get('x-middleware-rewrite');
  expect(rewriteOf('https://site.test/?unit=petcenza')).toBe('https://site.test/units/petcenza/index.html');
  expect(rewriteOf('https://site.test/?unit=../../secrets')).toBeNull();
  expect(rewriteOf('https://site.test/')).toBeNull();
  const html = await (await request.get('/units/petcenza/index.html')).text();
  expect(html).toContain('og/units/petcenza.jpg');
  expect((await request.get('/og/units/petcenza.jpg')).status()).toBe(200);
  expect(html).toContain('<link rel="canonical" href="https://chad-kraus-portfolio.vercel.app/"');
});

test('? opens the keyboard shortcuts; Escape closes them and focus comes back', async ({ page }) => {
  await page.goto('/portfolio');
  const trigger = page.getByRole('button', { name: 'Keyboard shortcuts' });
  await trigger.focus();
  await page.keyboard.press('?');
  const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
  await expect(dialog).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).include('.keys').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(dialog).toBeVisible();
});

test('case studies print as one clean column with the demo as a still', async ({ page }) => {
  await page.goto('/projects/greenline');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.nav-wrap')).toBeHidden();
  await expect(page.locator('.cs-pager')).toBeHidden();
  await expect(page.locator('.monitor video')).toBeHidden();
  await expect(page.locator('.monitor-print')).toBeVisible();
  expect(await page.locator('.cs-grid').evaluate((el) => getComputedStyle(el).display)).toBe('block');
});

test('the change log lists real months and links back to projects', async ({ page }) => {
  await page.goto('/changes');
  await expect(page.getByRole('heading', { level: 1, name: 'What changed' })).toBeVisible();
  await expect(page.locator('.ch-month').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'PetCenza' }).first()).toHaveAttribute('href', '/projects/petcenza');
});

test('the change log honours curation and has an RSS feed', async ({ page, request }) => {
  await page.goto('/changes');
  await expect(page.locator('main')).not.toContainText('Keep the legal analysis out of the public repo');
  await expect(page.getByRole('link', { name: 'Follow with RSS' })).toHaveAttribute('href', '/changes.xml');
  const feed = await request.get('/changes.xml');
  expect(feed.status()).toBe(200);
  const xml = await feed.text();
  expect(xml).toContain('<rss version="2.0">');
  expect(xml).toMatch(/<item>[\s\S]*<link>https:\/\/chad-kraus-portfolio\.vercel\.app\/changes#ch-\d{4}-\d{2}<\/link>/);
  expect(xml).not.toContain('legal analysis');
});

test('live demos show their uptime strip; private projects do not', async ({ page }) => {
  await page.goto('/projects/petcenza');
  await expect(page.locator('.uptime figcaption')).toContainText(/Live demo/);
  await expect(page.locator('.uptime-cells i')).toHaveCount(30);
  await page.goto('/projects/jarvis');
  await expect(page.locator('.uptime')).toHaveCount(0);
});

test('Ask about this project starts a message about it; a made-up slug does nothing', async ({ page }) => {
  await page.goto('/projects/petcenza');
  await page.getByRole('link', { name: 'Ask about this project' }).click();
  await expect(page).toHaveURL(/\/contact\?project=petcenza$/);
  await expect(page.locator('#message')).toHaveValue(/PetCenza/);
  await expect(page.locator('.ct-about')).toContainText('PetCenza');
  await page.goto('/contact?project=%3Cscript%3Ealert(1)%3C%2Fscript%3E');
  await expect(page.locator('#message')).toHaveValue('');
  await expect(page.locator('.ct-about')).toHaveCount(0);
});

test('saving data: demos show the screenshot until the video is asked for', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(Navigator.prototype, 'connection', { get: () => ({ saveData: true }) }));
  await page.goto('/projects/greenline');
  await expect(page.locator('.monitor video')).toHaveCount(0);
  await expect(page.locator('.monitor-glass img')).toBeVisible();
  await expect(page.locator('.monitor-note')).toContainText('Screenshot from');
  await page.getByRole('button', { name: 'Load demo video' }).click();
  await expect(page.locator('.monitor video')).toHaveCount(1);
  await expect(page.locator('.monitor-note')).toContainText('Recorded');
});

test('the status page lists every live demo with its uptime record', async ({ page }) => {
  await page.goto('/status');
  await expect(page.getByRole('heading', { level: 1, name: 'Demo status' })).toBeVisible();
  await expect(page.locator('.st-row')).toHaveCount(8);
  await expect(page.locator('.st-row .uptime')).toHaveCount(8);
  await expect(page.locator('.st-note')).toContainText('Jarvis');
});

test('project filters live in the address, ignore unknown values and can be cleared', async ({ page }) => {
  await page.goto('/portfolio?tool=supabase');
  await expect(page.locator('.urow')).toHaveCount(3);
  await expect(page.locator('#pf-tool')).toHaveValue('supabase');
  await page.getByRole('group', { name: 'Filter projects by lens' }).getByRole('button', { name: 'Operations' }).click();
  await expect(page).toHaveURL(/lens=operations/);
  await expect(page.locator('.pf-empty')).toBeVisible();
  await page.locator('.pf-empty').getByRole('button', { name: 'Clear filters' }).click();
  await expect(page).toHaveURL(/\/portfolio$/);
  await expect(page.locator('.urow')).toHaveCount(10);
  for (const junk of ['tool=%3Cscript%3E&lens=__proto__', 'tool=__proto__', 'tool=constructor&lens=toString']) {
    await page.goto(`/portfolio?${junk}`);
    await expect(page.locator('.urow')).toHaveCount(10);
  }
  await page.goto('/projects/petcenza');
  await expect(page.locator('.cs-tools').getByRole('link', { name: 'Supabase' })).toHaveAttribute('href', '/portfolio?tool=supabase');
});

test('the accessibility statement names the standard and the known limitations', async ({ page }) => {
  await page.goto('/accessibility');
  await expect(page.getByRole('heading', { level: 1, name: 'Accessibility' })).toBeVisible();
  await expect(page.locator('main')).toContainText('WCAG 2.2 level AA');
  await expect(page.getByRole('heading', { level: 2, name: 'Known limitations' })).toBeVisible();
});

test('a filtered project list unfurls as projects using that tool', async ({ request }) => {
  const { default: middleware } = await import('../middleware.js');
  const rewriteOf = (url) => middleware(new Request(url)).headers.get('x-middleware-rewrite');
  expect(rewriteOf('https://site.test/portfolio?tool=supabase')).toBe('https://site.test/portfolio/tools/supabase/index.html');
  expect(rewriteOf('https://site.test/?tool=supabase')).toBe('https://site.test/portfolio/tools/supabase/index.html');
  expect(rewriteOf('https://site.test/?tool=constructor')).toBeNull();
  expect(rewriteOf('https://site.test/portfolio/?tool=supabase')).toBe('https://site.test/portfolio/tools/supabase/index.html');
  for (const junk of ['constructor', '__proto__', '../../units/petcenza', '']) {
    expect(rewriteOf(`https://site.test/portfolio?tool=${junk}`)).toBeNull();
  }
  expect(rewriteOf('https://site.test/portfolio')).toBeNull();
  const html = await (await request.get('/portfolio/tools/supabase/index.html')).text();
  expect(html).toContain('<title>Projects using Supabase');
  expect(html).toContain('PetCenza');
  expect(html).toContain('<link rel="canonical" href="https://chad-kraus-portfolio.vercel.app/portfolio"');
});

test('the status page switches to 90 days and keeps it in the address', async ({ page }) => {
  await page.goto('/status');
  await expect(page.locator('.st-row').first().locator('.uptime-cells i')).toHaveCount(30);
  await page.getByRole('group', { name: 'Uptime history length' }).getByRole('button', { name: '90 days' }).click();
  await expect(page).toHaveURL(/days=90/);
  await expect(page.locator('.st-row').first().locator('.uptime-cells i')).toHaveCount(90);
  await page.goto('/status?days=7');
  await expect(page.locator('.st-row').first().locator('.uptime-cells i')).toHaveCount(30);
});

test.describe('keyboard only', () => {
  for (const path of ['/', '/portfolio', '/status', '/accessibility', '/now', '/interview-pack', '/changes', '/contact', '/resume', '/projects/petcenza']) {
    test(`Tab walks ${path} to the footer with a visible focus ring on every stop`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('load');
      const problems = [];
      let reached = false;
      for (let i = 0; i < 250 && !reached; i++) {
        await page.keyboard.press('Tab');
        const f = await page.evaluate(async () => {
          // One frame for focus handlers (the resume frame's ring is set from focus events).
          await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 20)));
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const r = el.getBoundingClientRect();
          // The ring may be drawn on the control itself or, for a rack unit, on its face.
          const ringed = (node) => {
            if (!node) return false;
            const cs = getComputedStyle(node);
            return (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none';
          };
          return {
            name: `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40)}"`,
            shown: r.width > 0 && r.height > 0,
            ring: ringed(el) || ringed(el.querySelector(':scope > .face')),
            last: !!el.closest('footer') && el.textContent.trim() === 'Email',
          };
        });
        if (!f) break;
        if (!f.shown) problems.push(`${f.name} is focused but not visible`);
        else if (!f.ring) problems.push(`${f.name} has no focus ring`);
        reached = f.last;
      }
      expect(problems).toEqual([]);
      expect(reached).toBe(true);
    });
  }
});

test('keyboard users can skip a demo recording to its written version', async ({ page }) => {
  await page.goto('/projects/greenline');
  const skip = page.getByRole('link', { name: 'Skip the demo: read what’s on screen' });
  await skip.focus();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  const transcript = page.locator('.monitor-transcript');
  await expect(transcript).toHaveAttribute('open', '');
  await expect(transcript.locator('summary')).toBeFocused();
});

test('a shared tool link fires that tool in the room, and the filtered list links to it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/portfolio?tool=supabase');
  await expect(page.getByRole('link', { name: 'Show in the rack' })).toHaveAttribute('href', '/?tool=supabase');
  await page.goto('/?tool=supabase');
  await expect(page.locator('#sr-sheet-title')).toHaveText('Supabase');
  await page.goto('/?tool=constructor');
  await expect(page.locator('.sr-sheet')).not.toHaveClass(/is-open/);
});

test('interview mode tour walks three live projects from real data, then the hire snapshot', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/resume');
  await page.getByRole('link', { name: 'Walk through three projects' }).click();
  const tour = page.getByRole('region', { name: 'Guided tour' });
  await expect(tour).toContainText('Interview mode');
  await tour.getByRole('button', { name: 'Take the tour' }).click();
  await expect(tour).toContainText('1 of 4.');
  await expect(page).toHaveURL(/stop=1/);
  await expect(tour).toContainText('recorded demo');
  await expect(tour.getByRole('link', { name: 'Case study' })).toHaveAttribute('href', /^\/projects\//);
  const first = (await page.locator('#sr-sheet-title').textContent()).trim();
  await expect(tour).toContainText(`${first}:`);
  for (const n of [2, 3, 4]) {
    await tour.getByRole('button', { name: 'Next' }).click();
    await expect(tour).toContainText(`${n} of 4.`);
  }
  await expect(tour).toContainText('hire');
  await tour.getByRole('link', { name: 'Interview pack to print' }).click();
  await expect(page).toHaveURL(/\/interview-pack$/);
  await expect(page.locator('.ip-project')).toHaveCount(3);
});

test('the weekly digest reports the four latest full weeks from real data', async ({ request }) => {
  const xml = await (await request.get('/digest.xml')).text();
  expect(xml).toContain('<rss version="2.0">');
  expect(xml.match(/<item>/g)).toHaveLength(4);
  expect(xml).toMatch(/<guid isPermaLink="false">chad-kraus-portfolio-digest-\d{4}-\d{2}-\d{2}<\/guid>/);
  expect(xml).toMatch(/public commit|No public commits/);
});

test('the interview pack lists the three interview projects with proof, and the snapshot', async ({ page }) => {
  await page.goto('/interview-pack');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Chadwick (Chad) Kraus');
  await expect(page.locator('.ip-project')).toHaveCount(3);
  await expect(page.locator('.ip-proof').first()).toContainText('recorded demo');
  await expect(page.getByRole('button', { name: 'Print the pack' })).toBeVisible();
  for (const name of ['Experience', 'Credentials', 'Toolbox']) await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
});

test('now shows the latest week, work in progress and demo health from site data', async ({ page }) => {
  await page.goto('/now');
  await expect(page.getByRole('heading', { level: 1, name: 'Now' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /^Week of / })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'In progress' })).toBeVisible();
  await expect(page.locator('.now-note')).toHaveCount(0);
  await expect(page.locator('main')).toContainText('live demos');
});

test('night shift: after 7pm only units with commits this week stay lit, and axe still passes', async ({ page }) => {
  const activity = JSON.parse(readFileSync('src/data/activity.json', 'utf8'));
  const onShift = Object.values(activity.repos).filter((r) => r.weeks.at(-1) > 0).length;
  await page.clock.setFixedTime(new Date('2026-09-14T22:00:00'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.sr')).toHaveClass(/is-night/);
  await expect(page.locator('.sr-shift')).toBeVisible();
  await expect(page.locator('.unit.on-shift')).toHaveCount(onShift);
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
  await page.clock.setFixedTime(new Date('2026-09-14T12:00:00'));
  await page.reload();
  await expect(page.locator('.sr')).not.toHaveClass(/is-night/);
  await expect(page.locator('.sr-shift')).toBeHidden();
});

test('case study tools trace their cables to every project that shares them', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects/petcenza');
  const trace = page.locator('.trace');
  await expect(trace.locator('.trace-cable')).toHaveCount(0);
  await page.locator('.cs-tools').getByRole('link', { name: 'Supabase' }).hover();
  await expect(trace.locator('.trace-cable')).toHaveCount(2);
  await expect(trace.locator('figcaption')).toHaveText('Supabase runs from PetCenza to CoachRhythm, Greenline.');
  await page.mouse.move(0, 0);
  await expect(trace.locator('.trace-cable')).toHaveCount(0);
  await page.locator('.cs-tools').getByRole('link', { name: 'Supabase' }).focus();
  await expect(trace.locator('.trace-cable')).toHaveCount(2);
});

test('interview tour resumes from the stop in the address, and ending it clears the address', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?tour=hiring&stop=3');
  const tour = page.getByRole('region', { name: 'Guided tour' });
  await expect(tour).toContainText('3 of 4.');
  await tour.getByRole('button', { name: 'Next' }).click();
  await expect(tour).toContainText('4 of 4.');
  await expect(page).toHaveURL(/stop=4/);
  await tour.getByRole('button', { name: 'End tour' }).click();
  await expect(page).not.toHaveURL(/tour=|stop=/);
  await page.goto('/?tour=hiring&stop=99');
  await expect(tour).toContainText('Interview mode');
});

test('rack timeline lights the units with commits in the chosen week, and replay can be stopped', async ({ page }) => {
  const activity = JSON.parse(readFileSync('src/data/activity.json', 'utf8'));
  const lit = Object.values(activity.repos).filter((r) => r.weeks[6] > 0).length;
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const range = page.locator('#sr-week');
  await expect(page.locator('.sr-week-out')).toContainText('(latest)');
  await expect(range).toHaveAttribute('aria-valuetext', /^Week of .* public commit/);
  await range.fill('6');
  await expect(page.locator('.sr')).toHaveClass(/is-timeline/);
  await expect(page.locator('.unit.wk-on')).toHaveCount(lit);
  await expect(range).toHaveAttribute('aria-valuetext', /^Week of .* public commit/);
  await range.fill('11');
  await expect(page.locator('.sr')).not.toHaveClass(/is-timeline/);
  const replay = page.getByRole('button', { name: 'Replay' });
  await replay.click();
  await expect(replay).toHaveAttribute('aria-pressed', 'true');
  await replay.click();
  await expect(replay).toHaveAttribute('aria-pressed', 'false');
});

test('site search finds projects, tools and pages, and opens the chosen result', async ({ page }) => {
  await page.goto('/status');
  await page.keyboard.press('/');
  const dialog = page.getByRole('dialog', { name: 'Search' });
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole('combobox');
  await input.fill('supabase');
  await expect(dialog.getByRole('group', { name: 'Tools' }).getByRole('option', { name: 'Supabase' })).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).include('.search').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(violations).toEqual([]);
  await input.fill('greenline');
  await expect(dialog.getByRole('option').first()).toContainText('Greenline');
  await input.press('Enter');
  await expect(page).toHaveURL(/\/projects\/greenline$/);
  await page.keyboard.press('Control+k');
  await expect(dialog).toBeVisible();
  await input.fill('zzzz-no-such-thing');
  await expect(dialog.getByRole('status')).toHaveText('0 results');
});

test('the uptime record is published as JSON, QR codes exist, and the pack has no phone number', async ({ page, request }) => {
  const status = await (await request.get('/status.json')).json();
  expect(Object.keys(status.sites).length).toBeGreaterThan(0);
  expect(status.sites.petcenza).toMatchObject({ title: 'PetCenza', ok: expect.any(Boolean) });
  const qr = await request.get('/qr/petcenza.svg');
  expect(qr.status()).toBe(200);
  expect(await qr.text()).toMatch(/^<svg/);
  await page.goto('/interview-pack');
  await expect(page.locator('.ip-contact')).not.toContainText('(512)');
  await expect(page.locator('.ip-shot')).toHaveCount(3);
});

test('search marks the matched words, shows why a result matched, and remembers searches', async ({ page }) => {
  await page.goto('/now');
  await page.keyboard.press('/');
  const dialog = page.getByRole('dialog', { name: 'Search' });
  const input = dialog.getByRole('combobox');
  // A word from the field notes' bodies: at least one result explains itself with a
  // snippet around the match, rather than only its title.
  await input.fill('header');
  await expect(dialog.getByRole('option').first()).toBeVisible();
  await expect(dialog.locator('.search-detail', { hasText: '…' }).first()).toBeVisible();
  await expect(dialog.locator('.search-detail mark').first()).toBeVisible();
  await input.fill('greenline');
  await expect(dialog.getByRole('option').first().locator('.search-title mark')).toBeVisible();
  await input.press('Enter');
  await expect(page).toHaveURL(/\/projects\/greenline$/);
  await page.getByRole('contentinfo').getByRole('button', { name: 'Search' }).click();
  await expect(dialog.locator('.search-recent button', { hasText: 'greenline' })).toBeVisible();
  await dialog.locator('.search-recent button', { hasText: 'greenline' }).click();
  await expect(input).toHaveValue('greenline');
});

test.describe('phone room controls', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  test('fold behind one button that opens them', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Room controls' });
    await expect(toggle).toBeVisible();
    await expect(page.locator('#sr-week')).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#sr-week')).toBeVisible();
  });
});

test('the room controls button is only for small screens', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Room controls' })).toBeHidden();
  await expect(page.locator('#sr-week')).toBeVisible();
});

test('status names the shared services a demo outage would take down together', async ({ page }) => {
  await page.goto('/status');
  const blast = page.locator('.st-blast');
  await expect(page.getByRole('heading', { level: 2, name: 'If a shared service went down' })).toBeVisible();
  const rows = blast.locator('li');
  expect(await rows.count()).toBeGreaterThan(0);
  await expect(rows.first()).toContainText('live demos:');
  await expect(rows.first().getByRole('link')).toHaveAttribute('href', /\/portfolio\?tool=/);
  // Hosted services only: a build or test tool going offline doesn't stop a live demo.
  await expect(blast).toContainText('Supabase');
  for (const tool of ['Playwright', 'Vitest', 'Vite', 'Recharts']) await expect(blast).not.toContainText(tool);
});

test('the weekly digest and uptime record are published as JSON', async ({ request }) => {
  const digest = await (await request.get('/digest.json')).json();
  expect(digest.weeks).toHaveLength(4);
  for (const week of digest.weeks) {
    expect(week.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(typeof week.total).toBe('number');
    expect(week.demos).toBeTruthy();
  }
  const status = await (await request.get('/status.json')).json();
  expect(Object.keys(status.sites).length).toBeGreaterThan(0);
});

test('search groups results by kind, caps each group and jumps between them', async ({ page }) => {
  await page.goto('/now');
  await page.keyboard.press('/');
  const dialog = page.getByRole('dialog', { name: 'Search' });
  const input = dialog.getByRole('combobox');
  await input.fill('demo');
  const heads = dialog.locator('.search-group-head');
  expect(await heads.count()).toBeGreaterThan(1);
  // No single kind may crowd the list out.
  for (const group of await dialog.getByRole('group').all()) {
    // The group's own "show all" row is an option as well; only results are capped.
    expect(await group.locator('.search-opt:not(.search-more)').count()).toBeLessThanOrEqual(4);
  }
  // The first option of the first group starts selected; PageDown jumps a group.
  const groups = await dialog.getByRole('group').all();
  await expect(groups[0].getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
  await input.press('PageDown');
  await expect(groups[1].getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
  await input.press('PageUp');
  await expect(groups[0].getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
  await input.press('End');
  await expect(dialog.getByRole('option').last()).toHaveAttribute('aria-selected', 'true');
});

test('a ?from= link is recorded anonymously per page and stripped from the address', async ({ page }) => {
  await page.route(/gc\.zgo\.at/, (route) => route.abort());
  await page.addInitScript(() => { window.__events = []; window.goatcounter = { count: (e) => window.__events.push(e) }; });
  await page.goto('/?from=linkedin');
  await expect(page).not.toHaveURL(/from=/);
  await page.goto('/projects/petcenza');
  const events = await page.evaluate(() => window.__events.filter((e) => e.event).map((e) => e.path));
  expect(events).toContain('from/linkedin/projects/petcenza');
  expect(events.join(' ')).not.toContain('petcenza.com');
  // A junk value is neither kept nor recorded.
  await page.goto('/?from=%3Cscript%3E');
  await expect(page).not.toHaveURL(/from=/);
  await page.goto('/now');
  const after = await page.evaluate(() => window.__events.filter((e) => e.event).map((e) => e.path));
  expect(after.some((p) => p.startsWith('from/') && !p.startsWith('from/linkedin/'))).toBe(false);
});

test('the rack timeline has a sparkline and scrubs with the arrow keys', async ({ page }) => {
  const activity = JSON.parse(readFileSync('src/data/activity.json', 'utf8'));
  const weeks = Math.max(...Object.values(activity.repos).map((r) => r.weeks.length));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const bars = page.locator('.sr-week-spark i');
  await expect(bars).toHaveCount(weeks);
  await expect(page.locator('.sr-week-spark i.is-on')).toHaveCount(1);
  await expect(bars.nth(weeks - 1)).toHaveClass(/is-on/);
  const range = page.locator('#sr-week');
  await range.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(bars.nth(weeks - 2)).toHaveClass(/is-on/);
  await expect(page.locator('.sr')).toHaveClass(/is-timeline/);
  await expect(range).toHaveAttribute('aria-valuetext', /^Week of /);
  await page.keyboard.press('ArrowRight');
  await expect(bars.nth(weeks - 1)).toHaveClass(/is-on/);
  await expect(page.locator('.sr')).not.toHaveClass(/is-timeline/);
});

test('a capped search group says how many it is hiding', async ({ page }) => {
  await page.goto('/now');
  await page.keyboard.press('/');
  const dialog = page.getByRole('dialog', { name: 'Search' });
  await dialog.getByRole('combobox').fill('demo');
  const heads = dialog.locator('.search-group-head');
  expect(await heads.count()).toBeGreaterThan(0);
  // Every heading ends in either a plain count or "shown of total", and the counts agree.
  for (const head of await heads.all()) {
    const label = (await head.locator('span').textContent()).trim();
    const shown = await head.locator('xpath=following-sibling::*[contains(@class, "search-opt") and not(contains(@class, "search-more"))]').count();
    const capped = label.match(/^(\d+) of (\d+)$/);
    if (capped) {
      expect(Number(capped[1])).toBe(shown);
      expect(Number(capped[2])).toBeGreaterThan(Number(capped[1]));
    } else {
      expect(Number(label)).toBe(shown);
    }
  }
});

test('a ?from= link works on any page and records the landing page once', async ({ page }) => {
  await page.route(/gc\.zgo\.at/, (route) => route.abort());
  await page.addInitScript(() => { window.__events = []; window.goatcounter = { count: (e) => window.__events.push(e) }; });
  // Straight to a case study, the way a post link would.
  await page.goto('/projects/petcenza?from=linkedin');
  await expect(page).not.toHaveURL(/from=/);
  const events = () => page.evaluate(() => window.__events.filter((e) => e.event).map((e) => e.path));
  await expect.poll(events).toContain('from/linkedin/landed/projects/petcenza');
  expect((await events()).filter((p) => p.includes('/landed/'))).toHaveLength(1);
  await page.goto('/now');
  await expect.poll(events).toContain('from/linkedin/now');
  // Once per session: the second page carries the source but not another landing event.
  expect((await events()).filter((p) => p.includes('/landed/'))).toHaveLength(0);
});

test('clicking a sparkline bar jumps the timeline to that week', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const bars = page.locator('.sr-week-spark i');
  await expect(bars.first()).toHaveAttribute('title', /^Week of .* public commit/);
  await bars.nth(4).click();
  await expect(bars.nth(4)).toHaveClass(/is-on/);
  await expect(page.locator('.sr')).toHaveClass(/is-timeline/);
  await expect(page.locator('#sr-week')).toHaveValue('4');
  await expect(page.locator('.sr-week-out')).toContainText('commit');
  await expect(page.locator('#sr-week')).toHaveAttribute('aria-valuetext', /^Week of /);
});

test('a capped search group expands from its own row', async ({ page }) => {
  await page.goto('/now');
  await page.keyboard.press('/');
  const dialog = page.getByRole('dialog', { name: 'Search' });
  await dialog.getByRole('combobox').fill('demo');
  const showAll = dialog.getByRole('option', { name: /^Show all \d+ / });
  await expect(showAll.first()).toBeVisible();
  const label = await showAll.first().textContent();
  const total = Number(label.match(/\d+/)[0]);
  expect(total).toBeGreaterThan(4);
  const optionsBefore = await dialog.locator('.search-opt:not(.search-more)').count();
  const moreRowsBefore = await showAll.count();
  await showAll.first().click();
  // The dialog stays open, that kind now lists everything, and its row is gone.
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('option', { name: /^Show all \d+ / })).toHaveCount(moreRowsBefore - 1);
  expect(await dialog.locator('.search-opt:not(.search-more)').count()).toBeGreaterThan(optionsBefore);
  // Typing again puts the cap back.
  await dialog.getByRole('combobox').fill('demos');
  await dialog.getByRole('combobox').fill('demo');
  await expect(dialog.getByRole('option', { name: /^Show all \d+ / })).toHaveCount(moreRowsBefore);
});

test('dragging across the sparkline scrubs the weeks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const spark = page.locator('.sr-week-spark');
  const box = await spark.boundingBox();
  const mid = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width - 2, mid);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.25, mid, { steps: 8 });
  await page.mouse.up();
  const value = Number(await page.locator('#sr-week').inputValue());
  const last = Number(await page.locator('#sr-week').getAttribute('max'));
  expect(value).toBeGreaterThan(0);
  expect(value).toBeLessThan(last - 4);
  await expect(page.locator('.sr')).toHaveClass(/is-timeline/);
  await expect(spark.locator('i').nth(value)).toHaveClass(/is-on/);
  await expect(page.locator('.sr-week-out')).toContainText('commit');
});
