# Design System: Server Room

The portfolio is a lit server room. Chad's ten projects are units in two 3D
racks; a visitor pulls a unit out, patches into a tool, or types into the KVM
console. Everything below the room is the same hardware vocabulary at rest:
label tape, VFD readouts, patch-panel rows, monitors in bezels.

Adopted September 2026. It replaces C2 — Editorial Spatial. PRODUCT.md still
governs content: no fabricated claims, resume/site parity (NASM is the one
site-only exception), and no project links Chad has not supplied.

## Design thesis

- **The hero is the proof.** A recruiter's first viewport shows the name, the
  role, the headline ("Networks. Software. The body.") and all ten projects as
  labelled, status-lit units. Nothing needs a click to be understood.
- **Networks and software are one room.** Rack A01 is Software & AI (Builder
  lens), rack B01 is Networks & support (Operations lens). Shared tools are
  patch ports; a tool used in both racks gets a trunk cable through the
  overhead tray. TechOps sits in B01 and belongs to both lenses.
- **Training and nutrition are an identifier**, carried by "The body." and the
  bio. They never get a rack, region, or lens.
- **Real data or nothing.** Heat and sparklines are public GitHub commits over
  twelve weeks. A project with no public repo is hatched and says so.

## Palette: Thermal

Single dark theme (`color-scheme: dark`). Tokens live in `src/index.css`.

| Role | Token | Value |
| --- | --- | --- |
| Ground | `--bg` / `--bg2` | `#080605` / `#1E0E07` |
| Text / prose / muted | `--text` / `--prose` / `--muted` | `#F5EDE6` / `#E4D9CF` / `#A9978B` |
| Decorative rules | `--line` / `--line-2` | `#2C221D` / `#3B2F28` |
| Control boundary (3.9:1) | `--edge` | `#7A6A5E` |
| Accent / ink on accent | `--accent` / `--accent-ink` | `#FFB547` / `#1A0F03` |
| Signal ramp | `--r-net` `--r-build` `--r-body` `--signal` | `#FF6A2B` `#FFB547` `#FF3B4E` `#FFF4DC` |
| Status | `--live` `--private` `--danger` | `#7FD68A` `#E4DACF` `#FF8577` |
| Heat bands 0–4 | `--heat-0..4` | `#4A1B0C` `#8A2E10` `#CC4B18` `#FF8A2E` `#FFD38C` |
| Materials | `--steel-0..5`, `--tape`, `--vfd` | steel ramp, `#ECE4D3`, `#FFB547` |

Rules: `--line` never identifies a control on its own; a control's edge is
`--edge` or stronger. Status is always a word plus a colour. Heat is a vent
strip plus a number, never a tint over text.

**Patch panel** is the named alternate palette (swap values in the comment at
the top of `index.css`): `#0B0C0D` ground, `#F4C430` accent, cyan build signal.

### Light theme

Opt-in from the nav toggle, saved per browser, applied before first paint by
`public/theme.js` (a same-origin file, because the CSP forbids inline scripts).
Dark stays the default and the brand. `:root[data-theme="light"]` swaps the
reading tokens: ground `#F4F1EA`, surface `#FFFFFF`, text `#14110D`, muted
`#5B5248` (6.7:1), accent `#8F5A00` (5.2:1 as text, white on it 5.8:1), edge
`#857A6C` (3.8:1). Hardware never changes: the server room, monitors, unit
faceplates, the resume bezel and terminals re-declare the dark tokens, so the
racks, cables and readouts look the same in both themes. Reading surfaces use
`--surface`, `--surface-2` and `--field` rather than hard-coded colours.

## Typography

| Face | Token | Use |
| --- | --- | --- |
| Big Shoulders Display 600–900 | `--f-display` | Name, page and section titles, unit and project titles. Uppercase. |
| Saira (width 75–100) | `--f-ui` | Body, buttons (condensed 85%), label tape (78%). |
| Geist Mono 400–600 | `--f-mono` | Kickers, metadata, stack tags, terminal. |
| Doto 600–900 | `--f-vfd` | Front-panel readouts only (`.vfd`): status, U positions, counts. |

Loaded from Google Fonts in `index.html` with system fallbacks on every stack.
Body copy stays 15–17px at 1.6–1.75 line height and ~66ch measure.

## Primitives (global, `index.css`)

`.kicker` (mono eyebrow with a rule), `.page-title`, `.sec-title`, `.lede`,
`.btn` / `.btn-primary` (44px min), `.seg` (pressed state = inverted),
`.chip` + `.dot`, `.tape` (label-maker strip), `.vfd` (amber dot-matrix
readout), `.monitor` (bezel + glass for screenshots and demos), `.spark`,
`.nf-term`, `.skip-link`, `.visually-hidden`.

## The room (home hero)

Rendered once by `ServerRoom.jsx`; driven by `src/lib/serverRoom.js`.

- **Depth layers, back to front:** far hall (13 ghost racks, seeded LEDs),
  near hall (9), ceiling strip lights, haze, floor plane with reflections, cable
  tray, the two racks, canvas cables and signal pulses, dust motes in the light
  falloff, vignette.
- **Racks:** 14U. Units at U1–U10 (five per rack, a hard limit), patch panel at
  U13–14. Each unit: vent/heat strip, label tape, status VFD, drive bays, NIC
  LEDs keyed to tools, power LED, handle.
- **Interactions:** click or Enter pulls a unit out and opens the detail sheet;
  a patch port lights every unit that uses the tool; lens buttons dim the other
  rack; Commit heat swaps vents for the heat ramp with numbers; ⌘K / Ctrl K opens
  the KVM console (`signal`, `open`, `rack a|b|all`, `heat`, `clear`, `help`,
  `exit`, `sound`, `hire`; unknown input answers "No route to host"). `hire`
  opens a printable operator snapshot built from profile.js; printing shows only
  that sheet, black on white.
- **Shareable units:** pulling a unit writes `?unit=<slug>` into the address with
  replaceState (no navigation); loading that address pulls the unit out. The
  sheet has "Copy link to this unit"; case studies link back with "Show in the
  rack". Shared links unfurl with the project's own card via `middleware.js`.
- **First-visit tour:** a small card over the room's lower right offers a
  20-second tour once per browser. Four steps (pull a unit, fire a port, the
  `hire` command, done) advance every five seconds, or by Next under reduced
  motion. It never moves focus and can be ended at any step.
- **Sound:** off by default. When on, pulling a unit plays a rail slide and latch,
  a signal plays two short tones. Synthesised with Web Audio; no audio files.
- **Demo uptime:** a unit whose live demo stopped answering the daily check gets
  an amber, slowly blinking power light (steady under reduced motion), and its
  panel and case study show a danger-coloured "Live demo not answering since …"
  chip. Status words never change: uptime is a separate signal.
- **Build readout:** rack B01's base carries a VFD with the deployed commit and
  build date, injected at build time. The footer repeats it as text.
- **Scroll dive:** the hero is sticky over 185vh and the camera eases in from
  scroll progress. Pointer parallax is a few degrees at most.
- **Mobile (≤999px):** racks flatten and stack, the sheet becomes a bottom
  sheet, controls follow the racks.

## Other surfaces

- **Home below the room:** Projects index (two rack columns, U position VFDs),
  Operations (2,000+ figure, evidence rail, failure → mechanism log, thesis),
  Background (headshot, bio, experience, credentials, toolbox), colophon
  stories, next-step CTA.
- **Projects (`/portfolio`):** lens filter, then unit rows grouped under rack
  headers: faceplate, screenshot, title, summary, meta, stack, actions.
- **Case study (`/projects/<slug>`):** monitor (demo video when present),
  01 Input / 02 Process / 03 Output signal path with sparkline, sticky
  "Patched to" sidebar with peers, Field notes story when one exists, prev/next
  unit pager. "How it fits together" draws the project's `architecture` layers
  in order as surface cards joined by a 2px accent line (horizontal on desktop,
  vertical on phones). It shows structure only; every item comes from the
  project's own write-up.
- **Resume, Contact:** same header pattern; resume PDF in a bezel with the
  phone hand-off below 700px.
- **404:** "No route to host" with a curl transcript.
- **What changed (`/changes`):** month headings with the same 2px rule as other
  sections; one row per project with a VFD commit count and up to four commit
  highlights, each tagged with its type (feat, fix) in the accent mono.
- **Keyboard shortcuts:** a native `<dialog>` on `--surface`, keys in bordered
  `kbd`, console commands in mono. Opens with `?` or from the footer.
- **Print:** case studies print as one black-on-white column: nav, footer, pager
  and demo controls hidden; the demo becomes its screenshot; link targets print
  after the link text.
- **Uptime strip:** 30 cells, one per day to the build date: `--live` for no
  outage recorded, `--danger` for not answering, a hatch before the first check.
  The caption states the counts, so colour is never the only signal.
- **Demo status (`/status`):** one row per live demo under a 2px rule: title
  link, an Answering / Not answering chip, the uptime strip, then the demo link. A
  bordered summary line in mono (`--live`, or `--danger` when any demo is down).
  A "30 days / 90 days" segmented control above the list; at 90 days the cells
  close to a 1px gap and fill the column width. An incident note sits under its
  strip: the day in `--danger` mono caps, then the note in `--prose`.
- **Noted outage days:** a red uptime cell inside an incident gets a 4px `--text` bar
  along its bottom edge; the note itself is in the tooltip and listed below.
- **Interview mode:** reuses the tour panel and its four progress dots; the resume
  header gains a secondary "Walk through three projects" button.
- **Night shift:** hall surfaces at half brightness; units off shift lose their bay and
  power lights; on-shift units get a 1px accent edge and a soft amber glow. Text and
  labels never dim. A mono caps line under the lede names the mode.
- **Room controls on small screens:** one "ROOM CONTROLS" button in the control style,
  with a ▾/▴ marker, folds the lens, heat, sound and timeline rows away so the racks come
  first.
- **Rack timeline:** a mono "WEEK" label, a native range with `accent-color`, a bordered
  mono readout on the translucent control ground, and Replay styled like Commit heat.
  Off-week units lose their lights; on-week units get the night-shift accent edge; a
  down week turns the power light amber.
- **Search:** matched words are marked in the accent with `--accent-ink` text, and a
  result whose title doesn't show the match gets an elided snippet. Recent searches sit
  under the field as bordered mono chips. The shortcuts dialog with a 48px field; results in rows with a mono kind
  label, the title in `--text` and detail in `--prose`; the active row takes
  `--surface-2` and a 3px accent bar on its left edge.
- **Cable tracer:** two columns of outlined units in mono labels; this project and the
  lit ones take a 1.5px accent edge; cables are 2px accent curves that draw in over
  .45s (static under reduced motion). Hidden in print.
- **Interview pack and Now:** reading-column pages in the Accessibility layout: display
  caps section heads over the 2px rule, mono metadata, 32px link targets. The pack
  prints black on white with link targets spelled out.
- **Skip the demo:** hidden until focused, then an accent chip in the monitor's top
  left, like the page skip link.
- **Tool share cards:** "Projects using" in muted display caps over the tool name,
  the projects as accent-bulleted mono lines, and both racks with those units slid
  out and outlined in the accent.
- **Project filters:** the lens segmented control plus a "Uses" tool `<select>` on
  `--field` with an `--edge` border, and "Clear filters" once anything is set. An
  empty result says which lens and tool, with its own clear button.
- **Accessibility (`/accessibility`):** a single 880px reading column; section
  headings in the display face over the 2px rule; plain bulleted lists.
- **Data saver:** when the browser asks to save data, a demo shows its
  screenshot, the note says the video wasn't loaded, and "Load demo video" swaps
  it in on request.
- **Share cards:** `public/og/units/<slug>.jpg` draws the project's rack with its
  unit slid out 64px, outlined and lit in the accent, the other units dimmed.

## Motion

Route changes use view transitions: the old page dims, the new one wipes in from
the left behind a 2px signal trace under the nav. The nav itself does not move.

All animation sits inside `prefers-reduced-motion: no-preference`. Reduced
motion removes the scroll dive, boot sequence, blinking LEDs, signal travel,
motes, and demo autoplay (demos show their poster and a Play button). Demo
videos pause when scrolled out of view and always expose a visible
Pause/Play control. Canvas work runs on one rAF loop that stops when the room
is off-screen.

## Images and video

- Screenshots use the AVIF ladder (352/704/896/1216) from
  `scripts/gen-card-images.py`; sizes are `ROW_SIZES` and `DETAIL_SIZES` in
  `src/lib/cardImages.js`. Verify painted pixels, never `naturalWidth`.
- Demos: silent H.264 MP4, 1120px wide, 24fps, CRF 30, faststart, under
  ~500KB, in `public/demos/`. Every frame is privacy-reviewed; no browser chrome,
  extension banners, personal contact data, or credentials may appear.
- Demos are silent, so each carries `demoChapters`: timed captions over the video
  (toggle with "Captions") and a "What's on screen" list beneath it. Captions
  describe only what is visible.
- Every capture shows its date ("Screenshot from Sep 2026", "Recorded Sep 2026"),
  and a red note appears when it is older than the project's last update.

## Accessibility

Roving tabindex across units and ports; `aria-pressed` on units, ports, lens
and heat buttons; one `aria-live` region narrates room actions; the sheet is
`inert` when closed and returns focus to its trigger; console suggestions are a
real combobox and Tab never traps. `forced-colors` gets plain text for the
gradient name. Touch targets are 44px on coarse pointers. One `h1` per page and
an unbroken heading order. axe checks WCAG 2.2 AA on every route in both themes
in CI, alongside Lighthouse budgets, and screenshot comparisons against Linux
baselines catch unintended visual changes.

## Do / Don't

- Do keep every number real and sourced (profile.js, projects.js, activity.json).
- Do put new tools through `toolsOf()` in `rackModel.js` so ports stay normalised.
- Don't add a third rack or a sixth unit; restructure `racks.js` instead.
- Don't tint text with heat colours, or signal status by colour alone.
- Don't link a project Chad has not supplied a link for.
