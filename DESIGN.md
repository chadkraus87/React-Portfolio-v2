---
name: Chad Kraus Portfolio
description: An evidence-first hiring portfolio where operational failure patterns and the mechanisms built against them share one page.
colors:
  paper: "#F7F7F5"
  surface: "#FFFFFF"
  inset: "#EFEFEC"
  ink: "#14171A"
  graphite: "#5A6169"
  rule: "#D6D9DD"
  boundary: "#7F868F"
  signal: "#B23A16"
  verified: "#1F4B99"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  emphasis:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 600
    lineHeight: 1.4
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
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.04em"
rounded:
  none: "0"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
  xxl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    rounded: "{rounded.none}"
    padding: "12px 16px"
  button-primary-hover:
    backgroundColor: "{colors.signal}"
    textColor: "#ffffff"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  filter-chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.none}"
    padding: "16px 16px 24px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  nav-link-active:
    backgroundColor: "{colors.signal}"
    textColor: "#ffffff"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  table-header-band:
    backgroundColor: "{colors.inset}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.none}"
    padding: "12px 0"
---

# Design System: Chad Kraus Portfolio

> This records the system currently implemented. It supersedes the forest-green
> Bitter/IBM Plex system that preceded it; that baseline is preserved in git
> history and is not carried forward here. PRODUCT.md remains authoritative for
> positioning and product truth.

## Overview

The site is a hiring surface, and its whole argument is structural: a visitor
who reads nothing still sees two columns, one naming a failure pattern from
years of Tier 2/3 escalations, the other naming the mechanism built so that
pattern cannot recur. Operations and engineering are not two sections; they are
two columns of the same table.

Everything else is subordinate to that. There is no ornament, no elevation, and
no decorative colour. Structure is carried entirely by rules, spacing and one
signal colour used at roughly 5% of any viewport. A serif reads the prose, a
grotesk carries the structure, and a monospace is confined to identifiers so
that labels never compete with content.

The register is a well-run engineering organisation's internal document: sober,
current, and specific. Nothing on the page is decorative; if an element is
present it is carrying a fact.

**Key Characteristics:**
- Paired failure/mechanism reasoning as the page's skeleton, not a section
- Serif prose, grotesk structure, mono identifiers — three faces, three jobs
- Zero shadows and zero radii; depth comes from rules and opaque surfaces
- One signal colour, held under ~5% of a viewport
- Breakpoints derived from where the grid actually breaks, not invented
- Touch targets keyed to pointer capability, not viewport width

## Colors

A neutral document palette with two functional accents. There are no decorative
colours: every value below has a job.

### Primary
- **Ink** (`#14171A`): All primary text, the 2px section rules, primary button
  fills, and the active filter chip. 17.99:1 on surface, 16.77:1 on paper.
- **Signal** (`#B23A16`): The only warm value. Sequence numerals, the `2,000+`
  figure, the active nav plane, `Live` status, and the focus ring. 5.98:1 on
  surface, 5.58:1 on paper. Held to roughly 5% of any viewport; measured at
  0.37% of fills on the homepage.

### Secondary
- **Graphite** (`#5A6169`): Secondary text — mono labels, failure-pattern prose,
  captions, dates, inactive nav. 6.27:1 / 5.85:1. There is no lighter text
  colour; nothing on the site sits between graphite and ink.
- **Verified** (`#1F4B99`): Links, the 2px underline beneath linked titles, and
  "full write-up" affordances. 8.32:1 / 7.75:1.

### Neutral
- **Paper** (`#F7F7F5`): The page ground. Cool, not cream.
- **Surface** (`#FFFFFF`): Raised content — nav bar, cards, the contact form.
- **Inset** (`#EFEFEC`): The one recessed value. The paired-table header band and
  screenshot placeholder plates.

### Named Rules
**The Two-Token Boundary Rule.** `Rule` (`#D6D9DD`) and `Boundary` (`#7F868F`)
look similar and are not interchangeable. **Rule is decorative only** — hairline
dividers, row separators, figure frames — and carries no contrast claim: it
measures 1.42:1 on surface and 1.32:1 on paper. **Boundary is the identifying
edge of an interactive control** — inputs, filter chips, buttons — and clears
WCAG 1.4.11 at 3.68:1 / 3.43:1. A control bounded only by `Rule` is a defect.

**The One Warm Value Rule.** Signal is the only non-neutral in the system and is
never used for a surface, a body of text, or more than about 5% of a viewport.
Its rarity is what makes a numeral or a `Live` badge register at all.

**The No-Lighter-Grey Rule.** Graphite is the floor for text. Anything that
would need a paler grey to read correctly is instead made smaller, moved, or
deleted.

## Typography

**Structure / UI:** Archivo (with system-ui, sans-serif) — 400/500/600/700
**Long-form prose:** Literata (with Georgia, serif) — 400/500 plus italic
**Identifiers:** Martian Mono (with ui-monospace, monospace) — 400/500

**Character:** An engineered grotesk carries every structural role, a genuine
reading serif carries every sentence a visitor is expected to read, and a
monospace is reserved for things that identify rather than describe. The split
is strict: prose is never set in mono, and labels are never set in the serif.

### Hierarchy

Seven sizes in two registers. This is **not** a modular scale — the ratios are
1.13 within the text register and 1.33 then 1.50 within the display register.
The gap between 19 and 24 is the deliberate seam: below it everything is
reading, above it everything is structure. **Nothing below 13px exists.**

- **Display** (Archivo 700, 32px, 1.1, −0.015em): The name on the homepage,
  page titles, evidence entry titles.
- **Title** (Archivo 700, 24px, 1.2): Card titles, note list entries, and the
  homepage name at mobile sizes.
- **Emphasis** (Archivo 600, 19px, 1.4): The mechanism statements in the paired
  table, and project-page summaries.
- **Body** (Literata 400, 17px, 1.7): All reading text — bios, note bodies,
  failure-pattern statements, the thesis line in italic.
- **Small** (Literata 400, 15px, 1.6): Field values, captions, rail values,
  status and date.
- **Label** (Martian Mono 500, 13px, +0.04em, uppercase): Column headers, field
  headers, project attributions, section markers, nav links, dates.

### Named Rules
**The Mono-Is-Never-Prose Rule.** Martian Mono sets identifiers only — section
numbers, field headers, attributions, dates, slugs. It never sets a sentence.
This is a rule the codebase learned the hard way under the previous system,
where mono prose measured harder to read and wrapped badly on mobile.

**The 13px Floor.** No text anywhere is smaller than 13px. Status and date sit
at 15px, not in a badge — currency is part of the evidence and should be
readable, not decorative.

## Layout

A single 1200px container with 24px side padding governs every page. Spacing
comes from a 4px base: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.

The homepage is three stacked systems inside that container: a compact identity
block, the paired reasoning table (a 64px numeral column, then 5fr failure and
7fr mechanism), and a four-cell evidence rail. Selected evidence below alternates
55/45 figure-and-fields rows.

Reading measures are set per surface and are load-bearing: notes and the notes
index at 44rem, project detail at 46rem, homepage bio paragraphs at 68ch, the
identity role line at 66ch, the thesis at 62ch, intros at 60ch.

### Responsive behavior

Breakpoints are derived from where the grid actually breaks rather than chosen:

- **≤640px** — one column. The paired table stops being a table: each pair
  becomes a single block with the numeral, the failure sentence, then the
  mechanism indented behind a `↳` and a 2px rule, with the relationship stated
  once above the table rather than repeated in every unit.
- **641–1023px** — the six-column band. The rail halves to 2×2, evidence rows
  stack figure-over-text, the background grid becomes one column.
- **≥1024px** — full twelve-column behaviour.
- **≤700px** — one surface-specific exception: the resume swaps its inline PDF
  frame for a direct download hand-off, because inline PDF embedding is
  unreliable on phones.

The project grid uses `repeat(auto-fill, minmax(min(300px, 100%), 1fr))`; the
`min()` is what stops a 300px floor overflowing a 320px viewport.

### Named Rules
**The Capability Rule.** Touch target sizing is keyed to `(pointer: coarse)`,
not viewport width. A tablet in portrait is wider than any phone breakpoint and
still finger-driven, so width alone was raising targets on the wrong devices.

## Elevation & Depth

**There are no shadows.** The rule is absolute and enforced globally:
`border-radius: 0` and `box-shadow: none` are set on every element, including
pseudo-elements. Depth is produced three ways only — the ground/surface/inset
tonal step, 1px `Rule` hairlines, and 2px `Ink` rules that open a section.

This replaces a previous system in which one shadow token served eight distinct
surface roles while three radii and inconsistent 2/3/4px edges competed with it.

## Shapes

One geometry: the rectangle. No radii anywhere, no pills, no rounded frames.
Borders are 1px `Rule` for decoration, 1px `Boundary` for controls, and 2px
`Ink` for section openings and the invalid-field state. Screenshots sit flush
inside a 1px frame with no inset and no shadow.

## Components

### Buttons
- **Shape:** Square, 12px/16px padding, 1px `Boundary` border so filled and
  outline variants occupy identical space.
- **Primary:** Ink fill, white text; hovers to Signal.
- **Outline:** Transparent, ink text; hovers to a surface fill.
- **Disabled:** 50% opacity. Used only while a form submit is in flight.
- **Touch:** 44px minimum under `(pointer: coarse)`.

### Paired reasoning table (signature component)
The homepage's defining element. A 2px ink rule opens it; an inset header band
carries two mono column labels; three rows follow, each crossing both columns so
a pair reads horizontally. Signal numerals sit in a 64px column, failure prose is
graphite serif, the mechanism is 19px semibold ink, and the project attribution
sits beneath in mono. On phones each row becomes one indented block.

### Evidence rail
Four cells divided by hairlines, the first emphasised with a 32px Signal figure
and a serif caption; the rest are mono label over serif value. It exists to give
operations concrete weight without giving it screenshot real estate.

### Evidence entry
55/45 figure-and-fields row, alternating sides. The figure is a flush 1px frame
with `aspect-ratio: 16/10` reserving space. Fields are a `<dl>` with mono `dt`
headers over a hairline and serif `dd` values. Status and date sit at 15px.

### Cards
Square, 1px `Rule` border, no shadow; the border shifts to `Boundary` on hover.
A `16/9` image with a 1px bottom rule, a meta row separated by a hairline, and
actions pinned to the card bottom with `margin-top: auto` so grid rows align.

### Inputs
Paper fill so fields recede into the page, 1px `Boundary` edge, 12px padding.
Focus shifts the border to ink **and** adds a 2px Signal `:focus-visible` ring —
a border shift alone is too easy to miss. Invalid fields take a 2px Signal
border plus a serif message; the message carries the meaning, never colour alone.

### Navigation
Surface bar, 60px, sticky, 1px bottom rule. Uppercase mono links; the active one
takes a solid Signal plane. Below 640px it collapses to a 44×44 toggle with
`aria-expanded`, `aria-controls`, Escape-to-close, outside-press-to-close and
focus return to the toggle.

### Skip link
The first focusable element on every page. `position: fixed` so it stays
reachable at any scroll position, revealed on `:focus` (not only
`:focus-visible`) so any legitimate focus path shows it.

## Do's and Don'ts

### Do:
- **Do** use `Boundary`, never `Rule`, for anything a visitor can interact with.
- **Do** keep Martian Mono for identifiers only.
- **Do** key touch targets to `(pointer: coarse)`.
- **Do** set status and date at 15px in their own position, never as a badge.
- **Do** reserve image space with `aspect-ratio` so CLS stays at zero.
- **Do** let reading measure follow content type — 44rem notes, 46rem project
  pages, 68ch bio.
- **Do** honour `prefers-reduced-motion`; the only motion is 120ms state changes.

### Don't:
- **Don't** introduce a radius or a shadow. The global reset removes both, and
  re-enabling either for one component breaks the only depth model the site has.
- **Don't** add a second accent colour. Signal's rarity is the effect.
- **Don't** use a grey lighter than Graphite for text.
- **Don't** set prose in Archivo or Martian Mono.
- **Don't** push the CONDITION → ACTION grammar onto Notes. Notes are long-form
  reading and stay that way.
- **Don't** add a size outside the seven-step ramp.
- **Don't** assume dark mode exists. There is none; the document declares itself
  light-only with `<meta name="color-scheme" content="light">`.

## Images

Project screenshots ship as AVIF at three widths — 352w, 704w and 1216w —
generated by `scripts/gen-card-images.mjs` and committed, since the generator
shells out to macOS `sips` and Vercel builds on Linux. The original JPEG remains
the `<img>` fallback, so a browser without AVIF renders exactly what it did
before.

Two `sizes` values exist because two slots exist: `CARD_SIZES` for the portfolio
grid, which caps at 368px, and `EVIDENCE_SIZES` for the homepage evidence
figures, which reach 607px and therefore need the 1216w step on a 2x display.
Both are derived from the real grid, with upper bounds set roughly 20px above
each layout threshold to absorb the scrollbar discrepancy between media
conditions and layout width.

## Unresolved

Recorded here as open items, unaddressed by this system.

- **Meridian has no real screenshot.** `src/assets/images/Meridian.jpg` is a
  placeholder title card. It is the only project image that is not evidence of
  running software.
- **The old GitHub Pages URL still serves a stale mirror.**
  `chadkraus87.github.io/React-Portfolio-v2/` serves its last build and cannot
  redirect server-side. `index.html` carries a second Search Console
  verification token for that property.
