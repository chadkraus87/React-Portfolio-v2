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

const originals = import.meta.glob('../assets/images/*.{jpg,jpeg}', {
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
const WIDTHS = [352, 704];

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
 * .container is `min(100vw, 1080px)` minus 2.5rem of padding; .project-grid is
 * `repeat(auto-fill, minmax(min(300px, 100%), 1fr))` with a 1.5rem gap. Column
 * count therefore flips where the columns physically fit:
 *
 *   1 col   below 664px   card = 100vw - 2.5rem
 *   2 cols  664..987px    card = (100vw - 4rem) / 2      <- peaks at 461px
 *   3 cols  988..1079px   card = (100vw - 5.5rem) / 3
 *   3 cols  1080px+       card = 331px (container is capped)
 *
 * The previous value claimed a flat 352px above 680px, which told the browser
 * to fetch the 352w asset into a box up to 461px wide.
 *
 * The upper bounds below sit ~20px above those layout thresholds on purpose.
 * Media conditions resolve against the viewport *including* the classic
 * scrollbar, while the grid lays out against the content width that excludes
 * it, so the column flip lands up to a scrollbar-width later than the raw
 * number suggests. Inside those narrow bands the hint overstates the slot and
 * the browser fetches one step larger: a few KB more, still sharp, which is the
 * side to be wrong on.
 */
export const CARD_SIZES = [
  '(max-width: 663px) calc(100vw - 2.5rem)',
  '(max-width: 1007px) calc((100vw - 4rem) / 2)',
  '(max-width: 1097px) calc((100vw - 5.5rem) / 3)',
  '331px',
].join(', ');
