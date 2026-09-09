// Maps a project's full-size image to its small AVIF card variants.
//
// projects.js stays the single place a project is defined: it keeps importing
// one image, and this looks up the variants for it. Adding a project means
// dropping the screenshot in and running scripts/gen-card-images.py — no
// per-project imports to keep in sync, and nothing here for prerender.mjs
// (which parses projects.js as text) to trip over.
//
// Keyed on the emitted URL rather than the filename, because Vite hashes asset
// names at build time; the URL is the exact string ProjectCard receives.

// png as well as jpg: a screenshot supplied as a lossless PNG stays the
// canonical source, and still needs its AVIF card variants looked up.
const originals = import.meta.glob('../assets/images/*.{jpg,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const variants = import.meta.glob('../assets/images/cards/*.avif', {
  eager: true,
  query: '?url',
  import: 'default',
});

const nameOf = (path) => path.split('/').pop().replace(/\.[^.]+$/, '');

// Must match the WIDTHS in scripts/gen-card-images.py.
const WIDTHS = [352, 704, 896, 1216];

const variantsByName = new Map(
  Object.entries(variants).map(([path, url]) => [nameOf(path), url])
);

const srcSetByUrl = new Map();
for (const [path, url] of Object.entries(originals)) {
  const name = nameOf(path);
  const set = WIDTHS.map((w) => {
    const variant = variantsByName.get(`${name}-${w}`);
    return variant ? `${variant} ${w}w` : null;
  }).filter(Boolean);

  if (set.length) srcSetByUrl.set(url, set.join(', '));
}

/** AVIF srcset for a card, or undefined when no variants were generated. */
export const cardSrcSet = (imageUrl) => srcSetByUrl.get(imageUrl);

/* ---------------------------------------------------------------------------
   `sizes` for the C2 layout.

   Re-derived from scratch: the old values described a 1200px container with a
   368px card, and none of those numbers survive the redesign. The container is
   now `min(100vw, 1560px)` with a fluid gutter of `clamp(20px, 4vw, 72px)`, and
   most images bleed past one or both gutters.

   Gutter behaviour, which every value below depends on:
     < 500px    gutter = 20px   (clamp floor)
     500-1800px gutter = 4vw
     > 1800px   gutter = 72px   (clamp ceiling)
   The container stops growing at 1560px, so above 1704px viewport the content
   box is a fixed 1560 - 2*72 = 1416px.

   Upper bounds sit slightly above each layout threshold on purpose: media
   conditions resolve against the viewport INCLUDING the classic scrollbar,
   while the grid lays out against the content width that excludes it. Erring
   one step large costs a few KB and stays sharp.
--------------------------------------------------------------------------- */

/**
 * Hero figure. Right column of a 0.82 / 1.18 grid, bleeding through the right
 * gutter, so it reaches the viewport edge:
 *   content = 100vw - 2*gut ; column = (content - gap) * 1.18/2 ; slot = column + gut
 * Collapses to full-bleed (100vw) below 980px.
 */
export const HERO_SIZES = [
  '(max-width: 980px) 100vw',
  '(max-width: 1704px) calc((100vw - 8vw - 44px) * 0.59 + 4vw)',
  '880px',
].join(', ');

/**
 * F1 featured band. Full-bleed both sides at every width.
 */
export const BAND_SIZES = '100vw';

/**
 * F2 / F3. Image column is 1.14 of a 2.0 split and bleeds through one gutter.
 * Single column, full-bleed, below 980px.
 */
export const HALF_SIZES = [
  '(max-width: 980px) 100vw',
  '(max-width: 1704px) calc((100vw - 8vw - 64px) * 0.57 + 4vw)',
  '850px',
].join(', ');

/**
 * F4 minor. Image column is 0.7 of a 2.0 split and does NOT bleed.
 */
export const MINOR_SIZES = [
  '(max-width: 980px) 100vw',
  '(max-width: 1704px) calc((100vw - 8vw - 60px) * 0.35)',
  '475px',
].join(', ');

/**
 * Homepage evidence entries keep the 55/45 split they had, but inside the
 * wider container.
 */
export const EVIDENCE_SIZES = [
  '(max-width: 980px) 100vw',
  '(max-width: 1704px) calc((100vw - 8vw - 48px) * 0.55)',
  '752px',
].join(', ');

/**
 * Project detail screenshot. ProjectDetail.css sets it to
 * `min(64rem, 100vw - 2*gut)`, so it is the content width until the viewport
 * reaches ~1113px (92vw = 1024) and a flat 1024px above that. Measured against
 * the layout at 390 / 768 / 1440: 350 / 706 / 1024.
 */
export const DETAIL_SIZES = [
  '(max-width: 500px) calc(100vw - 40px)',
  '(max-width: 1120px) 92vw',
  '1024px',
].join(', ');
