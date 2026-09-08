// Maps a project's full-size image to its small AVIF card variants.
//
// projects.js stays the single place a project is defined: it keeps importing
// one image, and this looks up the variants for it. Adding a project means
// dropping the screenshot in and running scripts/gen-card-images.mjs — no
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

// Must match the WIDTHS in scripts/gen-card-images.mjs.
const WIDTHS = [352, 704, 1216];

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

/**
 * Derived from the real grid, not an eyeballed breakpoint.
 *
 * .container is `min(100vw, 1200px)` minus 3rem of padding; .project-grid is
 * `repeat(auto-fill, minmax(min(300px, 100%), 1fr))` with a 1.5rem gap. Column
 * count flips where the columns physically fit:
 *
 *   1 col   below 672px    card = 100vw - 3rem
 *   2 cols  672..995px     card = (100vw - 4.5rem) / 2
 *   3 cols  996..1199px    card = (100vw - 6rem) / 3
 *   3 cols  1200px+        card = 368px (container is capped)
 *
 * The upper bounds sit ~20px above those layout thresholds on purpose: media
 * conditions resolve against the viewport *including* the classic scrollbar,
 * while the grid lays out against the content width that excludes it. Inside
 * those narrow bands the hint overstates the slot and the browser fetches one
 * step larger -- a few KB more, still sharp, which is the side to be wrong on.
 */
export const CARD_SIZES = [
  '(max-width: 691px) calc(100vw - 3rem)',
  '(max-width: 1015px) calc((100vw - 4.5rem) / 2)',
  '(max-width: 1219px) calc((100vw - 6rem) / 3)',
  '368px',
].join(', ');

/**
 * The homepage evidence figures are far larger than a card: 55fr of the 1152px
 * content box, i.e. 607px, collapsing to full width below 1024px. The 1216w
 * variant exists so these stay sharp on a 2x display.
 */
export const EVIDENCE_SIZES = [
  '(max-width: 1023px) calc(100vw - 3rem)',
  '607px',
].join(', ');
