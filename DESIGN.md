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
  `exit`, `sound`; unknown input answers "No route to host").
- **Sound:** off by default. When on, pulling a unit plays a rail slide and latch,
  a signal plays two short tones. Synthesised with Web Audio; no audio files.
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
  unit pager.
- **Resume, Contact:** same header pattern; resume PDF in a bezel with the
  phone hand-off below 700px.
- **404:** "No route to host" with a curl transcript.

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

## Accessibility

Roving tabindex across units and ports; `aria-pressed` on units, ports, lens
and heat buttons; one `aria-live` region narrates room actions; the sheet is
`inert` when closed and returns focus to its trigger; console suggestions are a
real combobox and Tab never traps. `forced-colors` gets plain text for the
gradient name. Touch targets are 44px on coarse pointers. One `h1` per page and
an unbroken heading order.

## Do / Don't

- Do keep every number real and sourced (profile.js, projects.js, activity.json).
- Do put new tools through `toolsOf()` in `rackModel.js` so ports stay normalised.
- Don't add a third rack or a sixth unit; restructure `racks.js` instead.
- Don't tint text with heat colours, or signal status by colour alone.
- Don't link a project Chad has not supplied a link for.
