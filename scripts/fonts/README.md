# Vendored fonts

The four families the Server Room design system uses, vendored so
`scripts/make-og-images.py` renders identical social cards on any machine, with
no network access and nothing to install. See DESIGN.md for the type roles.

| File                          | Family                | Used for |
| ----------------------------- | --------------------- | -------- |
| `BigShouldersDisplay-var.ttf` | Big Shoulders Display | Card titles, the cover name, rack stencils (weights 700–900) |
| `Saira-var.ttf`               | Saira                 | Summaries (400) and label tape (700 at width 78) |
| `GeistMono-var.ttf`           | Geist Mono            | Kickers, taglines, dates, the domain (500) |
| `Doto-var.ttf`                | Doto                  | Front-panel status readouts only (800) |

## Why variable files rather than static weights

Google Fonts ships these as variable fonts. Pillow instances the axes directly:
`make-og-images.py` pins weight and width through `set_variation_by_axes`, so the
output is deterministic even though each file carries the whole range.

## Source and licence

Downloaded from the Google Fonts repository, `main` branch, on 2026-09-13:

- Big Shoulders Display — https://github.com/google/fonts/tree/main/ofl/bigshouldersdisplay
- Saira                 — https://github.com/google/fonts/tree/main/ofl/saira
- Geist Mono            — https://github.com/google/fonts/tree/main/ofl/geistmono
- Doto                  — https://github.com/google/fonts/tree/main/ofl/doto

All four are licensed under the SIL Open Font License 1.1, which permits
redistribution with the licence included. Each upstream `OFL.txt` is committed
beside its font as `OFL-<family>.txt`.

The fonts render images only; they are not served to visitors. The site loads
the same families from Google Fonts (see `index.html`).
