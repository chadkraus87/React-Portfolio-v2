---
name: Chad Kraus Portfolio
description: A forest-green, mono-labelled portfolio where operations discipline meets a calm natural palette.
colors:
  pine: "#1e3a2b"
  forest: "#2e5940"
  moss: "#6b8f71"
  mist: "#e4ebe4"
  paper: "#f7f6f1"
  card: "#ffffff"
  ink: "#20261f"
  brass: "#a8862f"
typography:
  display:
    fontFamily: "Bitter, Georgia, serif"
    fontSize: "clamp(2.3rem, 5.5vw, 3.4rem)"
    fontWeight: 800
    lineHeight: 1.15
  headline:
    fontFamily: "Bitter, Georgia, serif"
    fontSize: "clamp(1.9rem, 4vw, 2.6rem)"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "Bitter, Georgia, serif"
    fontSize: "1.6rem"
    fontWeight: 700
    lineHeight: 1.15
  subtitle:
    fontFamily: "Bitter, Georgia, serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.15
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.78rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.02em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  pill: "999px"
spacing:
  xs: "0.35rem"
  sm: "0.6rem"
  md: "1.25rem"
  lg: "2rem"
  xl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "0.6rem 1.15rem"
  button-primary-hover:
    backgroundColor: "{colors.pine}"
    textColor: "#ffffff"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.forest}"
    rounded: "{rounded.lg}"
    padding: "0.6rem 1.15rem"
  button-outline-hover:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.forest}"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.forest}"
    rounded: "{rounded.pill}"
    padding: "0.35rem 0.95rem"
  filter-chip-active:
    backgroundColor: "{colors.forest}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "0.35rem 0.95rem"
  tag-pill:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.pine}"
    rounded: "{rounded.pill}"
    padding: "0.18rem 0.6rem"
  status-pill:
    backgroundColor: "transparent"
    textColor: "{colors.brass}"
    rounded: "{rounded.pill}"
    padding: "0.1rem 0.55rem"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "1.15rem 1.25rem 1.35rem"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.6rem 0.75rem"
  nav-link:
    backgroundColor: "transparent"
    textColor: "rgba(255, 255, 255, 0.82)"
    rounded: "{rounded.md}"
    padding: "0.45rem 0.85rem"
  nav-link-active:
    backgroundColor: "{colors.forest}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.45rem 0.85rem"
---

# Design System: Chad Kraus Portfolio

> **Status: incumbent baseline, captured before any redesign.** This file records
> what the site *is* today, extracted from `src/index.css` and the ten component
> and page stylesheets. It is a description, not a contract. The forest-green
> identity, the Bitter/IBM Plex pairing, and the visual style documented here are
> **explicitly not binding** — PRODUCT.md's Brand Commitments section names the
> three constraints that are (resume/site parity, no fabricated claims, the
> private-project link policy), and the visual identity is deliberately absent
> from that list. A future redesign is free to replace everything below.
>
> Three buckets are marked throughout so a redesign knows what it is touching:
> **[BASELINE]** describes current implementation, **[PRINCIPLE]** marks a
> decision worth carrying into any future world, and **[LEGACY]** marks something
> weak, inconsistent, or accidental that a redesign should feel free to discard.
> PRODUCT.md remains authoritative for positioning and product truth.

## Overview

**Creative North Star: "The Terminal in the Woods"**

The implemented system runs on a single deliberate tension. Structural furniture
speaks in IBM Plex Mono with literal shell syntax — every section label is
prefixed with a brass `~/`, project categories render lowercased like directory
names, and the placeholder for a missing screenshot is the project title wrapped
in curly braces. Set against that is a palette of pine, forest, and moss on warm
off-white paper. Ops discipline in a calm, natural register: the vocabulary of a
terminal, the temperature of a field guide.

Density is moderate and reading-first. Long-form surfaces are constrained to
44–46rem while the card grid runs to the full 1080px container, so prose and
evidence get different measures. Serif headings (Bitter, up to 800 weight) sit
over sans body text at a generous 1.65 line-height, and mono is confined to
labels, metadata, and micro-copy — never to prose. `About.css` carries an
explicit correction on this point: the hero title was moved off mono and onto the
body font because monospace prose measured harder to read and wrapped to four
lines on mobile.

Ornament is scarce and mostly structural. There is one shadow token, one radius
token, and a small set of colored edges doing the work that shadow does in most
systems. The system is quiet by construction, and its most distinctive gesture
costs two characters.

**Key Characteristics:**
- Mono labels with a literal `~/` prefix as the signature device
- Serif display over sans body; mono strictly for labels and metadata
- Warm off-white ground, never pure white at page level
- Flat surfaces with structural green edges instead of stacked elevation
- Pill geometry for anything enumerable; soft 10px rectangles for anything containing content
- Touch targets deliberately raised to 44px on phones without shifting the desktop layout

## Colors

A single-hue green family spanning near-black to pale tint, warmed by an off-white
ground and interrupted by exactly one non-green accent.

### Primary
- **Deep Pine** (`#1e3a2b`): The structural darkest green. Owns the sticky nav bar
  and the footer, and is the default color for every heading level on light
  surfaces. Also the text color inside pale-tint pills, where it supplies contrast
  without introducing a second hue. **[BASELINE]**
- **Forest** (`#2e5940`): The working brand green and the only interactive color.
  Primary button fills, all link text, active nav and filter states, the 3px
  underline beneath project imagery, the 4px left rule on contact and mobile-resume
  cards, focus borders on inputs, and the offset frame behind the headshot.
  **[BASELINE]**

### Secondary
- **Moss** (`#6b8f71`): The muted green that carries all secondary text — mono
  eyebrows, category labels, project taglines, dates, field labels, form notes,
  back links, and the lowercase section headings on project pages. It is the
  system's entire "quiet text" register; there is no gray. It also draws the
  resting boundary on form fields and unselected filter chips, where it replaced
  mist (1.12:1) to clear the 3:1 non-text minimum. **[BASELINE]**
- **Mist** (`#e4ebe4`): The pale green tint. Backgrounds for tag and skill pills,
  hairline dividers between note entries, and the quoted left border on project
  write-ups. It no longer draws control boundaries — too faint against the page
  to identify a control. **[BASELINE]**

### Tertiary
- **Brass** (`#a8862f`): The only warm, non-green value in the system and the only
  color used at genuinely small scale. It renders the `~/` prefix on every mono
  eyebrow, the global focus ring, and the "In progress" status pill. Its rarity is
  what makes the `~/` read as an accent rather than as decoration. **[BASELINE]**

### Neutral
- **Warm Paper** (`#f7f6f1`): The page ground. Warm off-white rather than white,
  which is what keeps the greens from reading as clinical. Also the fill of form
  inputs, so fields recede into the page rather than sitting on it. **[BASELINE]**
- **Card White** (`#ffffff`): Reserved exclusively for raised content surfaces —
  project cards, the skills panel, the contact form, contact cards, the resume
  frame. Pure white appears only where something is meant to sit above the page.
  **[BASELINE]**
- **Ink** (`#20261f`): Body text. A near-black with a green cast rather than a
  true neutral, so text belongs to the same family as everything else. **[BASELINE]**

### Named Rules
**The One Warm Value Rule.** Brass is the only non-green in the system, and it is
never used for a surface, a fill, or a block of text — only for the `~/` prefix,
the focus ring, and a single status state. Introducing a second warm accent
collapses the effect. **[PRINCIPLE]** — the discipline transfers to any palette;
the specific hex does not.

**The Never-White-Ground Rule.** The page is warm off-white; pure white means
"this surface is raised." A redesign that grounds the page in `#ffffff` loses the
only cue that separates card from page, because the shadow alone is too soft to
carry it. **[PRINCIPLE]**

**The Green-Cast Neutral Rule.** There are no true grays anywhere in the system.
Secondary text is moss, dividers are mist, body text is green-cast ink. **[BASELINE]**

## Typography

**Display Font:** Bitter (with Georgia, serif) — weights 600/700/800
**Body Font:** IBM Plex Sans (with system-ui, sans-serif) — weights 400/500/600
**Label/Mono Font:** IBM Plex Mono (with ui-monospace, monospace) — weights 400/500

All three load from Google Fonts with `display=swap` and `preconnect` hints; only
the weights listed above are requested.

**Character:** A slab-ish serif with real weight range against IBM Plex's
engineering-neutral sans and mono. The pairing reads as documentation rather than
marketing — the serif supplies warmth and authority at large sizes, the sans
disappears into reading, and the mono announces every piece of structure.

### Hierarchy
- **Display** (Bitter 800, `clamp(2.3rem, 5.5vw, 3.4rem)`, 1.15): The name in the
  About hero. The only place weight 800 appears. **[BASELINE]**
- **Headline** (Bitter 700, `clamp(1.9rem, 4vw, 2.6rem)`, 1.15): `.page-title` —
  every page's H1. The only other fluid size in the system. **[BASELINE]**
- **Title** (Bitter 700, 1.6rem, 1.15): Section headings on About — the bio
  heading, the skills panel heading, the certifications heading. **[BASELINE]**
- **Subtitle** (Bitter 700, 1.2–1.25rem, 1.15): Project card titles and note list
  entry titles. **[BASELINE]**
- **Body** (IBM Plex Sans 400, 1rem, 1.65): Default reading text. Prose columns
  are capped: bio paragraphs at 40rem, hero copy at 34rem, note bodies at 44rem
  with line-height raised to 1.8, project detail pages at 46rem with the summary
  at 1.05rem/1.7. Longer reading gets more leading. **[PRINCIPLE]** — measure and
  leading scaling with reading length is a real decision, independent of the fonts.
  (The 44rem and 46rem caps only began taking effect on 2026-09-07; see the
  verification note under Layout.)
- **Label** (IBM Plex Mono 500, 0.68–0.82rem, +0.02–0.05em): Everything
  structural. Eyebrows, project categories, taglines, status pills, dates, form
  labels, nav brand mark, footer meta, back links, and the lowercased section
  headings on project pages. **[BASELINE]**

### Named Rules
**The Mono-Is-Never-Prose Rule.** IBM Plex Mono is reserved for labels, metadata,
and micro-copy. It never sets a sentence a visitor is expected to read. This is a
correction the codebase already made once, in `About.css`, after mono prose
measured harder to read and wrapped badly on mobile. **[PRINCIPLE]**

**The `~/` Prefix Rule.** Mono eyebrows carry a brass `~/` injected via
`::before`, never typed into the content. It appears on `.eyebrow`,
`.pcard-category`, and `.contact-label`. This is the single most identifying mark
on the site and it costs two characters. **[BASELINE]** — the specific glyph is
tied to the terminal metaphor and a redesign may drop it, but **[PRINCIPLE]**: one
cheap, repeated, unmistakable mark is worth more than a page of ornament.

**The Lowercase Structure Rule.** Mono structural headings are lowercased —
project categories via `.toLowerCase()` in the component, project-page section
headings via `text-transform: lowercase`. Structure whispers; content speaks.
**[BASELINE]**

## Layout

A single centered container (`max-width: 1080px`, `padding: 0 1.25rem`) governs
every page. Vertical rhythm comes from one `.page` class: `3.5rem` top, `4.5rem`
bottom. The app shell is a flex column at `100dvh` with `main` absorbing slack, so
the footer sits at the bottom on short pages — a fix the CSS documents, having
previously left bare background beneath the footer on Resume and Contact.

Two-column asymmetric grids appear three times, always content-major and always
`3rem` gap: the About hero at `1.35fr 1fr`, the bio/skills split at `1.5fr 1fr`,
and the contact form/cards split at `1.4fr 1fr`. The project grid is the only
auto-responsive one: `repeat(auto-fill, minmax(300px, 1fr))` at `1.5rem` gap.

Reading surfaces override the container with their own narrower caps — 44rem for
notes, 46rem for project detail, 40rem for bio paragraphs, 34rem for hero and
intro copy. **[PRINCIPLE]** — different content types earning different measures
inside one container is worth keeping.

> **Verified 2026-09-07, after a fix.** The 44rem and 46rem caps were authored
> but not in effect: `.notes`, `.note`, and `.pdetail` sit on the same element as
> `.container`, share its specificity (0,1,0), and lost the tie because
> `main.jsx` imported `App.jsx` — and through it every page stylesheet — before
> `index.css`. All three surfaces rendered at the full 1080px container in
> production (~100–125 characters per line). Reordering those two imports in
> `main.jsx` restored them. Measured in the production build at 1280px: Notes
> index 704px / 63 cpl, note body 704px / 76 cpl, project detail 736px / 75 cpl.
> The 40rem and 34rem caps were never affected — those elements do not carry
> `.container`.

Spacing is expressed in `rem` decimals rather than drawn from a named scale.
Recurring values cluster around 0.35 / 0.6 / 1.15 / 1.25 / 1.6 / 2 / 3rem, but
they are hand-tuned per component rather than stepped. **[LEGACY]** — there is no
spacing token in `:root`, so rhythm is convention rather than system. A redesign
should introduce a real scale.

### Responsive behavior

Three hand-placed breakpoints, no shared token: **860px** (About collapses both
grids to one column and pulls the headshot to `order: -1`, because stacked in
source order a phone visitor read the entire hero before seeing a face), **780px**
(contact grid collapses), and **700px** (Resume swaps its inline PDF frame for a
direct download hand-off, and hides the header's Download button so the action
isn't offered three times). **680px** is the phone breakpoint and carries almost
all touch work: the nav collapses to a hamburger with an absolutely positioned
drawer under the 64px bar, and roughly a dozen rules raise inline links, filter
chips, buttons, and footer links to a 44px minimum.

**[PRINCIPLE]** The touch-target technique is genuinely good and worth carrying
anywhere: pad the target to 44px, then pull the padding back out with a negative
`margin-block`, so the tappable area grows without moving anything visually. Used
on card titles, "Full write-up" links, note titles, and the project back-link.

**[LEGACY]** Four breakpoints (860 / 780 / 700 / 680) with no shared variable and
no relationship between them. They were added per-problem. A redesign should
define a breakpoint scale rather than inherit these.

### Named Rules
**The One Container Rule.** Everything lives inside `.container`. Nothing
full-bleeds; there is not a single edge-to-edge element on the site. **[BASELINE]**

## Elevation & Depth

**Flat with structural edges.** Surfaces do not stack. There is exactly one shadow
token, and it is soft, green-tinted, and ambient rather than structural:
`0 1px 2px rgba(30,58,43,0.08), 0 8px 24px rgba(30,58,43,0.09)`. It appears
identically on project cards, the skills panel, the contact form, contact cards,
the resume frame, the mobile resume hand-off, the headshot, and project detail
images — one value, eight uses, no scale.

The real depth work is done by colored edges. Project images and project detail
images carry a 3px forest bottom border. Contact cards and the mobile resume panel
carry a 4px forest left rule. Project write-ups sit behind a 2px mist left border
like a pull quote. The headshot has a 2px forest frame offset ten pixels down and
right, described in the CSS as a nod to the resume's rule lines. The mobile nav
drawer closes with a 3px forest bottom border. Green lines, not shadows, tell you
where one thing ends and another begins.

**[PRINCIPLE]** Structural color edges instead of stacked elevation is a coherent,
transferable position — it reads as printed material rather than as stacked glass,
and it costs nothing in rendering.

**[LEGACY]** The edge weights are inconsistent (2px / 3px / 4px) with no rule
governing which applies where, and one shadow token stretched across eight
different surface roles means a card and a full-page document frame claim identical
elevation. A redesign should either define a real elevation scale or commit
fully to the flat-edge model and drop the shadow.

### Shadow Vocabulary
- **Ambient surface** (`0 1px 2px rgba(30,58,43,0.08), 0 8px 24px rgba(30,58,43,0.09)`):
  The only resting shadow. Separates a white surface from warm paper.
- **Card hover** (`0 2px 4px rgba(30,58,43,0.1), 0 14px 32px rgba(30,58,43,0.14)`):
  The single deepened variant, applied only to project cards on hover alongside a
  `-3px` lift.

## Shapes

Two geometries, cleanly divided by purpose.

**Pills** (`999px`) for anything enumerable and countable: stack tags, skill tags,
hero status tags, project status badges, and filter chips. **Soft rectangles**
(`10px`, the single `--radius` token) for anything that contains content: cards,
panels, forms, images, the resume frame, buttons. Two smaller radii exist as
one-offs — `8px` on nav links and form inputs, `6px` on the `CK` nav brand mark.

Borders are thin and deliberate: `1.5px` on buttons and form fields (so a filled
and an outline button occupy identical space), `1px` on hairline dividers, and the
2–4px structural greens described above.

**[PRINCIPLE]** The pill/rectangle split by function — countable things are pills,
containers are rectangles — is a clear rule that survives any palette change.

**[LEGACY]** Three radius values with only one tokenized. `8px` and `6px` are
hardcoded in `NavBar.css` and `Contact.css`.

## Components

### Buttons
- **Shape:** Soft rectangle (10px, `--radius`), `1.5px` transparent border so
  filled and outline variants occupy identical space.
- **Primary:** Forest fill, white text, `0.6rem 1.15rem` padding, weight 600 at
  `0.92rem`. Inline-flex with a `0.5rem` gap so an arrow or icon can sit beside
  the label.
- **Outline:** Transparent fill, forest text and border.
- **Hover:** Primary darkens forest → pine; outline fills with mist. Both at
  `0.15s ease`. Underline is explicitly suppressed on `.btn` even though buttons
  are usually anchors.
- **Disabled:** `opacity: 0.5`, `not-allowed` cursor. Defined in `Contact.css`
  rather than with the button. **[LEGACY]** — a global state living in a page
  stylesheet.
- **Mobile:** `min-height: 44px` below 680px; measured at 40px otherwise.

### Chips
- **Filter chips:** Pill, transparent fill, forest text, `1.5px` moss border.
  Hover shifts the border to forest; active fills forest with white text. This is
  the only three-state control on the site.
- **Tag pills:** Pill, mist fill, pine text, weight 500, no border. Used for
  project stacks (`0.74rem`), skill groups (`0.78rem`), and hero tags (mono,
  `0.75rem`). Non-interactive.
- **Status pills:** Pill, transparent fill, `1px` border, mono `0.68rem`, color
  matched to state — Live is forest on mist (the only filled status), In progress
  is brass, Private is moss. The comment in `ProjectCard.css` states the intent:
  Live reads as available now, and the others stay quieter so a private or
  in-flight project doesn't shout louder than a shipped one. **[PRINCIPLE]** —
  encoding availability in the loudness of the badge is a real idea worth keeping.

### Cards / Containers
- **Corner:** 10px, `overflow: hidden` so the image bleeds to the card edge.
- **Background:** Card white on warm paper.
- **Shadow:** The single ambient token; deepens on hover with a `-3px` translate.
- **Border:** None on the card itself. The 3px forest underline lives on the
  image.
- **Padding:** `1.15rem 1.25rem 1.35rem`, with a `0.6rem` flex gap between blocks.
- **Signature behavior:** `.pcard-actions` takes `margin-top: auto`, pinning
  buttons to the card bottom so every card in a stretched grid row aligns its
  actions regardless of text length. **[PRINCIPLE]** — a small, correct detail
  that any card system should keep.
- **Image:** `16/9`, `object-fit: cover`, `object-position: top` so screenshots
  show their headers rather than their centers. **[PRINCIPLE]**
- **Placeholder:** When a project has no screenshot, a `135deg` pine→forest
  gradient panel renders the title in mono inside curly braces, `aria-hidden`.
  **[BASELINE]**

### Inputs / Fields
- **Style:** Full width, paper fill (recessed into the page rather than raised),
  `1.5px` moss border, `8px` radius, `0.6rem 0.75rem` padding, body font at
  `0.95rem`.
- **Label:** Mono `0.78rem` moss, above the field.
- **Focus:** Border shifts to forest, native outline removed — *and* a `2px` brass
  `:focus-visible` ring is added back at `1px` offset. The CSS documents why: a
  border-color shift alone is easy to miss and would otherwise be the only cue.
  **[PRINCIPLE]** — never trade a focus ring for a border shift.
- **Error / Disabled:** No field-level error styling exists. Form errors surface as
  a single note below the form. **[LEGACY]** — no per-field validation state.

### Navigation
- **Bar:** Pine, sticky at `top: 0`, `z-index: 50`, `min-height: 64px`.
- **Brand:** Bitter 700 white at `1.1rem`, preceded by a `CK` monogram — mono
  `0.78rem` pine on mist, `6px` radius, `+0.05em` tracking. A small terminal-prompt
  object against the dark bar. **[BASELINE]**
- **Links:** White at 82% opacity, weight 500, `0.94rem`, `8px` radius. Hover
  brings full white on an 8%-white wash; active fills forest. Active state is
  driven by `NavLink` with `end` on the home route.
- **Mobile (≤680px):** Hamburger toggle at a true 44×44 with `aria-expanded` and a
  state-aware `aria-label`; links become an absolutely positioned pine drawer
  beneath the 64px bar, closed by a 3px forest bottom border. Every link closes the
  drawer on click. **[LEGACY]** — the drawer is CSS `display: none/flex` with no
  focus trap and no Escape handling.

### Footer
Pine ground, `margin-top: auto`. Mono meta at 55% white on the left, links at 85%
white on the right, collapsing to a wrapped row with 44px touch targets on phones.
Deliberately quiet — it repeats contact affordances rather than introducing
anything.

### Signature component: the mono eyebrow
`.eyebrow` — mono `0.8rem` moss with a brass `~/` from `::before`, `0.6rem` below.
It opens most pages and appears in variant form as the project category and the
contact label. It is the cheapest and most recognizable element in the system.
**[BASELINE]**

## Do's and Don'ts

### Do:
- **Do** keep mono for labels, metadata, and micro-copy only. `About.css` already
  documents the regression that happens when mono sets prose. **[PRINCIPLE]**
- **Do** raise touch targets with padding plus a compensating negative
  `margin-block`, so tappable area grows without moving the visual layout.
  **[PRINCIPLE]**
- **Do** give focus a real ring. Brass `2px` at `2px` offset globally, `1px` offset
  on form fields. A border-color change is not a focus state. **[PRINCIPLE]**
- **Do** let reading measure and leading scale with content length — 34rem intros,
  40rem bio, 44rem notes at 1.8, 46rem project pages at 1.7. **[PRINCIPLE]**
- **Do** pin card actions to the card bottom with `margin-top: auto` so grid rows
  align. **[PRINCIPLE]**
- **Do** encode project availability in badge loudness: the shipped thing reads
  loudest. **[PRINCIPLE]**
- **Do** honor `prefers-reduced-motion` — `index.css` kills all transitions,
  animations, and smooth scrolling under it. **[PRINCIPLE]**
- **Do** keep pills for countable things and soft rectangles for containers.
  **[PRINCIPLE]**

### Don't:
- **Don't** treat the forest-green palette, Bitter/IBM Plex, or the `~/` device as
  permanent. None of them appear in PRODUCT.md's Brand Commitments. They are the
  incumbent implementation and nothing more.
- **Don't** add a second warm accent alongside brass. Its rarity is the whole
  effect. **[PRINCIPLE]**
- **Don't** ground the page in pure white. White means "raised surface" in this
  system, and the shadow is too soft to carry the distinction alone. **[PRINCIPLE]**
- **Don't** add a third font. Three families across three roles is already the
  ceiling. **[PRINCIPLE]**
- **Don't** extend the current spacing, radius, or breakpoint values as if they
  were a system. They are hand-tuned per component and only partially tokenized.
  **[LEGACY]**
- **Don't** carry the four ad-hoc breakpoints (860 / 780 / 700 / 680) into a
  redesign. Define a real scale. **[LEGACY]**
- **Don't** assume dark mode exists. There is no `prefers-color-scheme` handling
  anywhere in the codebase; the document declares itself light-only with
  `<meta name="color-scheme" content="light">` so UA-painted controls stay light.
  **[LEGACY]**

## Unresolved

Recorded here as open items. Neither is addressed by this pass.

- **Meridian has no real screenshot.** `src/assets/images/Meridian.jpg` is a
  placeholder title card, imported in `projects.js` with a comment saying to swap
  it for a real screenshot when one exists. It is the only project image in the
  grid that is not evidence of running software, which matters more here than it
  would elsewhere: the card grid's implicit promise is that every tile is a
  screenshot of a real thing. Unresolved — do not fix as part of a design pass.
- **The old GitHub Pages URL still serves a stale mirror.**
  `chadkraus87.github.io/React-Portfolio-v2/` serves its last build and cannot
  redirect server-side. `index.html` carries a second Search Console verification
  token for that property, annotated as safe to delete only once the property is
  gone. Unresolved — a hosting and SEO decision, not a design one.

## Known gaps in this document

Recorded so a later pass does not mistake absence for completeness.

- Values were extracted from source CSS only. No browser was run and no computed
  styles were sampled, so anything the cascade resolves differently at runtime is
  not captured here.
- No contrast ratios were measured. Moss (`#6b8f71`) on warm paper is the pairing
  most likely to fall short at small mono sizes (0.68–0.74rem), and it carries most
  of the site's secondary text. Worth auditing before it is carried forward.
- No dark-mode, print, or forced-colors behavior is documented, because none is
  implemented.
