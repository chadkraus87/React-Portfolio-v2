---
name: Chad Kraus Portfolio
description: An evidence-first hiring portfolio in an editorial-spatial language, where operational failure patterns, the mechanisms built against them, and full-bleed product screenshots share one page.
colors:
  paper: "#F2EEE6"
  surface: "#FFFFFF"
  inset: "#E8E2D6"
  ink: "#14110D"
  graphite: "#5C554A"
  rule: "#CFC7B8"
  boundary: "#7C7364"
  accent: "#8A2B18"
  verified: "#1F4B99"
typography:
  identity:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(52px, 9.6vw, 138px)"
    fontWeight: 700
    lineHeight: 0.85
    letterSpacing: "-0.042em"
  displayMajor:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(38px, 5.4vw, 82px)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "-0.035em"
  displayMid:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(34px, 4.6vw, 66px)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "-0.035em"
  pageTitle:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(38px, 5vw, 72px)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  statement:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(27px, 3.35vw, 56px)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.022em"
  lead:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(20px, 1.85vw, 30px)"
    fontWeight: 400
    lineHeight: 1.36
  body:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
  small:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.1em"
rounded:
  none: "0"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
  xxl: "96px"
  gutter: "clamp(20px, 4vw, 72px)"
  container: "1560px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    rounded: "{rounded.none}"
    padding: "12px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  filter-chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  project-shot:
    backgroundColor: "#0b0b0d"
    rounded: "{rounded.none}"
    padding: "0"
  input:
    backgroundColor: "{colors.inset}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 12px 10px"
  input-focus:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  nav-link-active:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  section-rule:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    rounded: "{rounded.none}"
    padding: "12px 0 0"
---
# Design System: Chad Kraus Portfolio

> This records the system currently in production: **C2 — Editorial Spatial**,
> shipped in `2c513e2`. It supersedes the flat paper/ink system documented here
> before, which is preserved in git history and is not carried forward.
> PRODUCT.md remains authoritative for positioning and product truth.

## Design thesis

The site is a hiring surface for a technical practitioner, and it argues in two
registers at once. The first is structural: failure patterns from years of Tier
2/3 escalations, each answered by the mechanism built so that pattern cannot
recur. The second is evidential: real product screenshots, at real scale, so a
visitor who reads nothing still sees shipped software.

Editorial Spatial is the language that carries both. It behaves like a printed
publication rather than a web template — a wide measure, a fluid gutter that
imagery is allowed to break through, display type that runs from 12px to 138px,
and deliberate voids that give a statement room to land. Variance is high, but
it is systematic: every asymmetry comes from a named footprint or a declared
offset, never from hand-placement.

Two things it deliberately is not. It is not agency-portfolio styling — no
rotated navigation, no scroll hijack, no marquee, no locale strip, no
section-number eyebrows. And it is not a cockpit — no gauges, no KPI tiles, no
pseudo-telemetry, no fake instrumentation. The register is a well-run
engineering organisation's document that happens to be beautifully set.

**Key characteristics**
- Genuine product screenshots are a primary visual material, not decoration
- Five compositional footprints over one invariant DOM order
- A fluid gutter that imagery bleeds through; a 1560px container
- Zero shadows and zero radii; depth comes from bleeds, scale and voids
- One accent colour, held under roughly 5% of any viewport
- Breakpoints derived from where the grid actually breaks
- Touch targets keyed to pointer capability, not viewport width

## Typography

Three families, three jobs. Loaded from Google Fonts in `index.html`.

| Family | Token | Job |
|---|---|---|
| **Archivo** | `--font-ui` | Structure and display. Every heading, every button, the identity. |
| **Literata** | `--font-prose` | Reading. Body copy, summaries, field values, the thesis. |
| **Martian Mono** | `--font-id` | Identifiers only. Eyebrows, labels, dates, status, category, nav. |

Nothing below 12px exists on the site. Mono is confined to identifiers so labels
never compete with content. Emphasis inside a headline uses weight in the same
family, never a second family.

### Reading ramp (fixed)

| Token | Size |
|---|---|
| `--t-12` | 0.75rem / 12px |
| `--t-13` | 0.8125rem / 13px |
| `--t-15` | 0.9375rem / 15px |
| `--t-17` | 1.0625rem / 17px — body default |
| `--t-19` | 1.1875rem / 19px |

### Display ramp (fluid)

The display ramp is what the previous system did not have at all, and it is what
carries the redesign.

| Token | Value | Used by |
|---|---|---|
| `--d-name` | `clamp(52px, 9.6vw, 138px)` | The hero identity |
| `--d-major` | `clamp(38px, 5.4vw, 82px)` | Featured band project titles |
| `--d-mid` | `clamp(34px, 4.6vw, 66px)` | Standard project titles |
| `--d-page` | `clamp(38px, 5vw, 72px)` | Page titles |
| `--d-24` `--d-32` `--d-48` | 1.5 / 2 / 3rem | Fixed steps still in use |

Local display sizes are declared inline where a component owns its own scale:
the PAIRS condition at `clamp(25px, 3.15vw, 52px)`, the thesis at
`clamp(27px, 3.35vw, 56px)`, the operations figure at `clamp(58px, 8.4vw, 124px)`,
the Contact title at `clamp(44px, 7vw, 104px)`, and Notes index titles at
`clamp(32px, 4.3vw, 62px)`.

Display type is tracked tight: `-0.035em` on headings, `-0.042em` on the
identity, `-0.05em` on the operations figure.

## Colour and surfaces

Warm-neutral canvas. Every ratio below is measured against `--paper`, not
assumed.

| Token | Value | Contrast | Job |
|---|---|---|---|
| `--paper` | `#F2EEE6` | — | Warm page ground |
| `--surface` | `#FFFFFF` | — | Raised surface; focused field body |
| `--inset` | `#E8E2D6` | 1.11 vs paper | Recessed band; resting field body |
| `--ink` | `#14110D` | **16.27** | Primary text, warm near-black |
| `--graphite` | `#5C554A` | **6.36** | Secondary text |
| `--rule` | `#CFC7B8` | 1.45 | **Decorative hairlines only** |
| `--boundary` | `#7C7364` | **4.04** | The identifying edge of a control |
| `--accent` | `#8A2B18` | **7.44** | Oxblood: numerals, Live, active nav, key rules |
| `--verified` | `#1F4B99` | **7.19** | Links that leave the site |

### Named rules

- **Rule versus Boundary.** `--rule` is decorative and may never be a control's
  only edge; `--boundary` is what identifies an interactive control and clears
  the 3:1 non-text minimum on its own. Collapsing the two is what produced 1.12:1
  control borders in the system before last.
- **One accent, under ~5%.** Oxblood appears on index numerals, `Live`, the
  active nav underline, the `↳` mechanism marker, skill-group labels, the drop
  cap, the thesis rule and focus rings. Nowhere else. The 2,000+ operations
  figure is deliberately **ink, not accent** — at 124px it would blow the budget
  and read as a metric tile.
- **Zero radius, zero shadow.** Enforced globally by
  `*, *::before, *::after { border-radius: 0; box-shadow: none }`. This is a
  policy, not a default, and it still holds with no exceptions in production.
- **Colour never carries meaning alone.** Invalid fields change their rule
  colour *and* gain a text message; status words are spelled out.

## Layout

- **Container** `--container: 1560px`, centred, padded by the gutter.
- **Gutter** `--gut: clamp(20px, 4vw, 72px)` — fluid. Every bleed is measured
  against it, so one token controls the whole edge behaviour of the site.
- **Bleeds** `.bleed-l` / `.bleed-r` / `.bleed-x` apply `margin: calc(var(--gut) * -1)`
  on the relevant side. This is the mechanism the entire project system is built
  on. `html` and `body` carry `overflow-x: clip` so a deliberate edge-crop can
  never produce a horizontal scrollbar.
- **Hero structure** eyebrow → identity at display scale (line one cropped past
  the left gutter) → a two-column band whose left column carries the role line
  and a numbered index of the page's own sections, and whose right column
  carries a real product screenshot tucked into the interline gap. A foot rule
  closes it. Below 980px the band collapses to one column and the figure becomes
  a full-bleed strip.
- **Asymmetry** is systematic. Column splits are declared per footprint; the
  PAIRS mechanism offset steps linearly by `--o`; the thesis is the only
  right-aligned block on the homepage.
- **Void** is a material. The PAIRS block leaves roughly half the width empty at
  1920 on purpose, and the thesis balances it from the opposite side. Voids are
  composed, not left over.
- **Breakpoints** come from where the grid actually breaks: **980px** (project
  footprints and the hero collapse), **1023px** (rail and background), **700px**
  (Notes index), **640/620px** (typographic and rhythm adjustments). Touch
  targets are keyed to `@media (pointer: coarse)`, never to width.

## The project system

Five footprints, defined in `ProjectCard.css`. They differ **only** in CSS grid
placement.

| Footprint | Composition |
|---|---|
| **F1 band** | Full-bleed image both sides, then a structural band beneath: title left, meta right, text and actions below a hairline |
| **F2 right** | Text left, image right bleeding through the right gutter |
| **F3 left** | Image left bleeding through the left gutter, text right, dropped |
| **F4 minor** | Big type, smaller non-bleeding image offset low |
| **Coda** | Used once, to close `/portfolio`: meta full width, title beside text, then a 24:9 full-bleed letterbox |

### One DOM order, always

Every footprint renders the same order:

```
meta  →  title  →  screenshot  →  tagline + summary + stack  →  actions
```

Art direction on the outside, one predictable skeleton inside. Keyboard and
screen-reader order can therefore never diverge from reading order, however
unusual the composition looks. Each footprint carries a trailing `1fr` row so
slack collects there instead of spreading the text column against a taller
image.

`/portfolio` runs a nine-step rhythm — `right · minor · band · left · right ·
minor · left · minor · band` — and appends the coda when the list holds more
than four projects, so a filtered view never ends on a one-off treatment.

Below 980px every footprint collapses to the identical single column and the
rhythm is carried by aspect ratio alone (16:10, 5:4, 3:2, 1:1, 16:9).

Actions hide themselves when a link is null. That is how the private-project
policy is enforced in code rather than by convention.

## Homepage

| Block | Treatment |
|---|---|
| **Hero** | Identity at `--d-name`, edge-cropped left, with a real Packet & Pine screenshot in the interline gap. Roughly half the first viewport is evidence. |
| **Section index** | The page's own sections as a numbered `<dl>` (01 Selected work, 02 Background, 03 Writing). Structure used as composition, and as in-page navigation. |
| **PAIRS** | Three editorial units, not a table. Condition at `clamp(25px, 3.15vw, 52px)` on a 21ch measure; mechanism dropped, offset by `--o × clamp(18px, 6vw, 158px)`, behind a boundary rule and an accent `↳`. Serif answer against sans condition is the typographic contrast. |
| **RAIL** | `2,000+` as ink display type at `clamp(58px, 8.4vw, 124px)` carrying its own sentence, beside a hairline `<dl>`. No cells, no dividers, no tiles. |
| **Thesis** | Its own band: accent rule, `clamp(27px, 3.35vw, 56px)` Literata on a 26ch measure, right-aligned against the void the pairs leave. |
| **Evidence** | The three named projects rendered in the *same* footprints `/portfolio` uses — F1, F3, F2 — with Condition/Action/Verify in the text area. F4 is deliberately unused: nothing in the selected evidence should read as de-emphasised. |
| **Background** | Portrait at full column scale bleeding through the left gutter, a lead paragraph at `clamp(20px, 1.85vw, 30px)` on 34ch, then certifications and toolbox as full-width hairline structure rather than a sidebar appendix. |

## Other routes

- **`/portfolio`** — page title, filter chips, then the nine-step footprint
  rhythm and the coda.
- **`/projects/:slug`** — a 46rem reading column; the screenshot breaks out of it
  to `min(64rem, 100vw − 2·gut)`, centred on the column by negative margins.
- **Notes index** — an editorial publication index: a mono date rail
  (`clamp(92px, 13vw, 210px)`), titles at `clamp(32px, 4.3vw, 62px)` on a 20ch
  measure, and the excerpt dropped and indented under its own hairline. Not
  project cards: no image, no status, no stack.
- **Note detail** — deliberately unchanged reading: a 44rem measure, 17px
  Literata at 1.8, and an accent drop cap on the first paragraph.
- **`/contact`** — no form panel and no contact tiles. An oversized title, the
  fields sitting directly on the page, and the four channels as a hairline `<dl>`
  in a column offset down from the form.
- **`/resume`** — an embedded PDF viewer. Intentionally the plainest surface.
- **404** — page title, one prose line, two buttons.

## Motion

`MOTION_INTENSITY 5`. Plain CSS plus one IntersectionObserver
(`src/lib/reveal.js`). No animation library, no GSAP, no scroll hijack, no
parallax, no infinite loops, no scroll listeners.

- Scroll reveal: 20px rise plus fade, 0.7s on `--ease`
  (`cubic-bezier(0.22, 1, 0.36, 1)`), staggered by `calc(var(--i) * 70ms)`.
  Each element is unobserved the moment it lands.
- Hover: a 1.8% image scale over 0.7s, colour and border transitions at
  0.2–0.25s, and a 1px press translate on buttons.

**Positive gating is the rule.** Every transition and the reveal's hidden start
state are declared *only* inside
`@media (prefers-reduced-motion: no-preference)`. A reduced-motion visitor is
never sent a rule that then has to be cancelled, and nothing is ever hidden that
JavaScript has to rescue — the page is fully composed with scripting off. The
`reduce` block that also zeroes transitions is belt-and-braces; nothing depends
on it. Verified in production: the deployed stylesheet contains exactly one
`opacity: 0` declaration, and it is inside the positive guard.

## Images

Real screenshots of real software. No AI-generated imagery, no stock, no
div-built fake product UI. Every tracked asset is scanned for C2PA / `caBX` /
`gpt-image` provenance markers before it ships.

### The responsive ladder

**352 · 704 · 896 · 1216**, generated by `scripts/gen-card-images.py` (Pillow)
into `src/assets/images/cards/` and committed. Not part of `npm run build` —
Vercel's build image has no Pillow, and these only change when a screenshot
changes.

- **896 exists for DPR2 on small slots and DPR1 on the 750–880px slots.** Without
  it a 390px phone at 2× jumps to 1216 (25.6 KB avg) where 896 (16.7 KB) serves;
  that is −35% per image, about −89 KB on `/portfolio`.
- **1216 is the maximum** and covers full-bleed bands and the hero.

### The grid-box guard

The previous generator shelled out to macOS `sips`, which above roughly 1024px
silently emits a **tiled** AVIF: a `grid` derived-image box plus an `irot`
transform instead of a single coded image. Chrome parses the header — correct
intrinsic size, `naturalWidth` reports fine, no load error, nothing in the
console — and then paints a blank rectangle. That shipped, and it was invisible
to a 1× check.

`naturalWidth > 0` cannot detect this. The generator now fails the run if any
output contains a `grid` box, and image verification must probe **painted
pixels** (draw onto a canvas primed with a known colour and read it back), never
intrinsic dimensions.

### Sizes logic

Each slot has its own `sizes` expression in `src/lib/cardImages.js`, derived from
the real layout rather than estimated:

| Export | Slot |
|---|---|
| `HERO_SIZES` | right column of a 0.82/1.18 split plus one gutter; 100vw below 980px |
| `BAND_SIZES` | `100vw` |
| `HALF_SIZES` | F2/F3 image column plus one gutter |
| `MINOR_SIZES` | F4 column, no bleed |
| `DETAIL_SIZES` | `min(64rem, 100vw − 2·gut)`, exact at 350 / 706 / 1024 |

Upper bounds sit slightly above each layout threshold on purpose: media
conditions resolve against the viewport *including* the classic scrollbar, while
the grid lays out against the content width that excludes it.

## Accessibility

The semantics are load-bearing and are preserved through every visual change.

- **One DOM order per component**, so composition never reorders content for
  keyboard or screen-reader users.
- **Status and date** are separated by a visually-hidden `", "` so they are not
  announced as `LiveAug 2026`.
- **Filters** are `aria-pressed` buttons with an `aria-live="polite"` count.
- **Contact** keeps `aria-invalid`, `aria-describedby`, focus-to-first-error
  deferred to a commit-safe effect, and `role="status"` on the result.
- **Mobile nav** keeps `aria-expanded`, `aria-controls`, Escape-to-close with
  focus return, and outside-pointerdown close. `NavBar.jsx` was not touched by
  the redesign.
- **Skip link** is `position: fixed` so it works at any scroll position.
- **Contrast floors**: 4.5:1 for text, 3:1 for control boundaries. Current values
  are in the colour table; `--rule` at 1.45 is decorative-only by policy.
- **Touch targets** are 44px minimum under `@media (pointer: coarse)`.

## Do's and Don'ts

### Do
- Reach for an existing footprint before inventing a composition
- Let imagery bleed through the gutter; that is the system, not an exception
- Keep the accent under ~5% of any viewport
- Declare motion inside the positive `no-preference` guard
- Re-derive a `sizes` hint whenever a slot's column split changes
- Verify images by painted pixels

### Don't
- Add a radius, a shadow, or a second accent
- Put `--rule` on a control
- Introduce a sixth footprint, or hand-place an asymmetry
- Add cards, tiles, gauges, KPI styling or fake instrumentation
- Set a metric in accent at display scale
- Use `sips` for AVIF, or trust `naturalWidth` as proof an image rendered

## Unresolved

- **`.impeccable/design.json` is stale.** The machine-readable sidecar beside
  this file still encodes the retired palette (`#F7F7F5` paper, `signal`
  instead of `accent`), the retired 0.12s motion duration, the pre-C2 breakpoint
  set, and a `Paired Reasoning Table` component that no longer exists. It has
  not been regenerated; treat this document as authoritative until it is.
- **OG/social cards** were generated for the previous visual system and have not
  been rebuilt for C2. Their text is still accurate; their visual language is
  not. See the audit notes in the project history.
- **No `rel=canonical`** anywhere on the site; `og:url` carries the absolute URL.
  Pre-existing, unchanged by the redesign.
- **The homepage's three description variants differ from each other**
  (`description`, `og:description`, `twitter:description`). `/` is served from
  `index.html` verbatim rather than rewritten by the prerenderer. Pre-existing.
