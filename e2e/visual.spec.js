// Screenshot comparisons against committed baselines in e2e/visual.spec.js-snapshots/.
// Fonts render differently per operating system, so the baselines are Linux renders
// from the pinned Playwright image and these tests run only there: the `visual` job
// in CI, or scripts/update-visual-baselines.sh after an intentional design change.
import { test, expect } from '@playwright/test';

test.skip(process.platform !== 'linux', 'Visual baselines are Linux renders from the Playwright image');

// Only the small things that change without a design change: live commit counts,
// the build stamp, sparkline bars and demo video frames. Under reduced motion the
// room, its cables and every screenshot render the same way on every run.
const MASK = ['.cap-build', '.footer-mono', '.v-heat', '.spark', 'video'];

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
    await page.addInitScript((theme) => {
      localStorage.setItem('sr-tour', 'done');
      if (theme === 'light') localStorage.setItem('theme', 'light');
    }, shot.theme);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(shot.path);
    await page.evaluate(() => document.fonts.ready);
    if (shot.scrollTo) await page.locator(shot.scrollTo).scrollIntoViewIfNeeded();
    // Every image on screen decoded, so a slow load never reads as a design change.
    await page.waitForFunction(() => [...document.images]
      .filter((img) => img.getBoundingClientRect().top < window.innerHeight)
      .every((img) => img.complete && img.naturalWidth > 0));
    await page.waitForTimeout(800);
    await expect(page).toHaveScreenshot(`${shot.name}.png`, {
      mask: MASK.map((selector) => page.locator(selector)),
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    });
  });
}
