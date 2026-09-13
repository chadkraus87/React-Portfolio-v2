// Accessibility and behaviour checks against the production build.
// `npm run build && npm run test:e2e`. CI runs the same on every push.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

// Project slugs straight from the data file, skipping commented examples.
const SLUGS = [...readFileSync('src/data/projects.js', 'utf8')
  .split('\n').filter((line) => !/^\s*\/\//.test(line)).join('\n')
  .matchAll(/slug: '([^']+)'/g)].map((m) => m[1]);
const ROUTES = ['/', '/portfolio', '/resume', '/contact', '/no-such-page', ...SLUGS.map((s) => `/projects/${s}`)];

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
      v.currentTime = 16.5;
    });
    await expect(page.locator('.monitor-cc')).toHaveText(/Debts/);
    await page.getByRole('button', { name: 'Captions' }).click();
    await expect(page.locator('.monitor-cc')).toBeHidden();
    await page.getByText('What’s on screen').click();
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
  expect(html).toContain('og/petcenza.jpg');
  expect(html).toContain('<link rel="canonical" href="https://chad-kraus-portfolio.vercel.app/"');
});
