# Vendored fonts

These are the three families the portfolio's design system uses, vendored so
`scripts/make-og-images.py` renders identical social cards on any machine, with
no network access and nothing to install. See DESIGN.md for the type roles.

| File                  | Family       | Used for                                   |
| --------------------- | ------------ | ------------------------------------------ |
| `Archivo-var.ttf`     | Archivo      | Card titles and the cover name (weight 700) |
| `Literata-var.ttf`    | Literata     | Prose — project summaries, the cover role line (weight 400) |
| `MartianMono-var.ttf` | Martian Mono | Identifiers — category, tagline, status, date (weights 400 / 500) |

## Why variable files rather than static weights

Google Fonts ships these families as variable fonts only; there are no static
instances in the upstream repository, and cutting our own would mean adding
`fonttools` as a build dependency for four files. Pillow instances the axes
directly instead — `scripts/make-og-images.py` pins every weight through
`set_variation_by_axes`, so the rendered output is deterministic even though the
file carries the whole range.

## Source and licence

Downloaded from the Google Fonts repository, `main` branch:

- Archivo      — https://github.com/google/fonts/tree/main/ofl/archivo
- Literata     — https://github.com/google/fonts/tree/main/ofl/literata
- Martian Mono — https://github.com/google/fonts/tree/main/ofl/martianmono

Retrieved 2026-09-08.

All three are licensed under the SIL Open Font License 1.1, which permits
redistribution with the licence included. The upstream `OFL.txt` for each family
is committed beside its font file:

- `OFL-archivo.txt`
- `OFL-literata.txt`
- `OFL-martianmono.txt`

The fonts are used here to render images only; they are not served to visitors.
The site itself loads the same families from Google Fonts (see `index.html`).
