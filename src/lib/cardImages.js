// Maps a project's full-size image to its small AVIF card variants.
//
// projects.js stays the single place a project is defined: it keeps importing
// one image, and this looks up the variants for it. Adding a project means
// dropping the screenshot in and running scripts/gen-card-images.py — no
// per-project imports to keep in sync, and nothing here for prerender.mjs
// (which parses projects.js as text) to trip over.
//
// Keyed on the emitted URL rather than the filename, because Vite hashes asset
// names at build time; the URL is the exact string the page components receive.

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
   `sizes` for each image slot, derived from the layouts in the page CSS.
   Upper bounds sit slightly above each threshold on purpose: media conditions
   include the classic scrollbar, the grid lays out without it.
--------------------------------------------------------------------------- */

/** /portfolio unit rows: one column under 900px, then ~40% of the container. */
export const ROW_SIZES = '(max-width: 900px) calc(100vw - 32px), (max-width: 1440px) 40vw, 580px';

/** Case study monitor: the reading column, capped at the container. */
export const DETAIL_SIZES = '(max-width: 1100px) calc(100vw - 48px), 1100px';
