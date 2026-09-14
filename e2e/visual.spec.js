// Screenshot comparisons against committed baselines in e2e/visual.spec.js-snapshots/.
// Fonts render differently per operating system, so the baselines are Linux renders
// from the pinned Playwright image and these tests run only there: the `visual` job
// in CI, or scripts/update-visual-baselines.sh after an intentional design change.
import { test, expect } from '@playwright/test';

test.skip(process.platform !== 'linux', 'Visual baselines are Linux renders from the Playwright image');

// Only the small things that change without a design change: live commit counts,
// the build stamp, sparkline bars and demo video frames. Under reduced motion the
// room, its cables and every screenshot render the same way on every run.
const MASK = ['.cap-build', '.footer-mono', '.v-heat', '.spark', '.uptime', 'video'];

const SHOTS = [
  { name: 'home-dark', path: '/', theme: 'dark', viewport: { width: 1440, height: 900 } },
  { name: 'home-phone-dark', path: '/', theme: 'dark', viewport: { width: 390, height: 844 } },
  { name: 'projects-light', path: '/portfolio', theme: 'light', viewport: { width: 1440, height: 900 } },
  { name: 'case-study-dark', path: '/projects/jarvis', theme: 'dark', viewport: { width: 1440, height: 900 } },
  { name: 'architecture-light', path: '/projects/petcenza', theme: 'light', viewport: { width: 1440, height: 900 }, scrollTo: '.arch' },
  { name: 'not-found-light', path: '/no-such-page', theme: 'light', viewport: { width: 1440, height: 900 } },
];

for (const shot of SHOTS) {
  test(shot.name, async ({ page }) => {
    await page.setViewportSize(shot.viewport);
    // Midday, so the room is never on its night shift in a baseline.
    await page.clock.setFixedTime(new Date('2026-09-14T12:00:00'));
    await page.addInitScript((theme) => {
      localStorage.setItem('sr-tour', 'done');
      if (theme === 'light') localStorage.setItem('theme', 'light');
    }, shot.theme);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(shot.path);
    await page.evaluate(() => document.fonts.ready);
    if (shot.scrollTo) await page.locator(shot.scrollTo).scrollIntoViewIfNeeded();
    // Every rendered image on screen decoded, so a slow load never reads as a design
    // change. Hidden images (the print-only demo still) are skipped: they never load.
    await page.waitForFunction(() => [...document.images]
      .filter((img) => img.checkVisibility() && img.getBoundingClientRect().top < window.innerHeight)
      .every((img) => img.complete && img.naturalWidth > 0));
    await page.waitForTimeout(800);
    await expect(page).toHaveScreenshot(`${shot.name}.png`, {
      mask: MASK.map((selector) => page.locator(selector)),
      // Renders in the pinned image are identical run to run, so the tolerance is tight:
      // a single added button (about 0.7% of a desktop frame) must fail.
      maxDiffPixelRatio: 0.002,
      animations: 'disabled',
    });
  });
}
