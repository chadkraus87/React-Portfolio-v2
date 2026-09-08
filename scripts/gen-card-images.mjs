// Generates the small AVIF variants the portfolio cards use.
//
// Cards render at 280–352 CSS px, but the originals are 1376–1725px wide, so a
// card was pulling down 20–40x the pixels it could show. These variants cover
// 1x and 2x for that slot. Detail pages keep the full-size original — they are
// one image on a 736px column, and that is what the original is for.
//
// NOT part of `npm run build`. It shells out to `sips`, which is macOS-only,
// and Vercel builds on Linux; the outputs are committed instead. Run it after
// adding or replacing a project screenshot:
//
//   node scripts/gen-card-images.mjs
//
// It skips variants that are already newer than their source, so re-running is
// cheap. Delete src/assets/images/cards/ to force a full rebuild.

import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src', 'assets', 'images');
const outDir = join(srcDir, 'cards');

// 352 is the widest a card gets (768px viewport, two columns); 704 covers 2x.
const WIDTHS = [352, 704];
// Screenshots are detail-heavy; below ~55 the UI text in them starts to mush.
const QUALITY = 60;

// The headshot is not a card image and is already small.
const SKIP = new Set(['headshot.jpg']);

mkdirSync(outDir, { recursive: true });

const sources = readdirSync(srcDir).filter((f) => /\.jpe?g$/i.test(f) && !SKIP.has(f));
let written = 0;
let skipped = 0;

for (const file of sources) {
  const src = join(srcDir, file);
  const srcTime = statSync(src).mtimeMs;

  for (const width of WIDTHS) {
    const out = join(outDir, `${parse(file).name}-${width}.avif`);

    if (existsSync(out) && statSync(out).mtimeMs > srcTime) {
      skipped += 1;
      continue;
    }

    // resampleWidth (not -Z) so the width is exact and the aspect ratio rides
    // along — the card's own object-fit does the 16/9 crop, unchanged.
    execFileSync('sips', [
      '--resampleWidth', String(width),
      '-s', 'format', 'avif',
      '-s', 'formatOptions', String(QUALITY),
      src,
      '--out', out,
    ], { stdio: 'ignore' });

    written += 1;
  }
}

const bytes = readdirSync(outDir).reduce((n, f) => n + statSync(join(outDir, f)).size, 0);
console.log(`card variants: ${written} written, ${skipped} up to date`);
console.log(`${outDir.replace(root + '/', '')} now ${(bytes / 1024).toFixed(0)} KB total`);
