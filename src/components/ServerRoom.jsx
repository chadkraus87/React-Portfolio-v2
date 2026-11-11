import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { profile } from '../data/profile.js';
import { lenses } from '../data/racks.js';
import { RACK_MODEL } from '../lib/rack.js';
import { RACK_U, MAX_UNITS, HEAT_BANDS, heatBand, blinkOf, activityRange } from '../lib/rackModel.js';
import { STATUS_VFD, formatUpdated, formatDay } from '../lib/projectMeta.js';
import { cardSrcSet } from '../lib/cardImages.js';
import { mountServerRoom } from '../lib/serverRoom.js';
import { BUILD_STAMP } from '../lib/build.js';
import audience from '../data/audience.json';
import resumePdf from '../assets/files/Chad_Kraus_Resume.pdf';
import './ServerRoom.css';


// The decorative data hall behind the two racks. Seeded, so the room is the same
// on every load. No labels and no data: it is atmosphere, not evidence.
function makeHall(count, seed) {
  let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const colors = ['var(--live)', 'var(--accent)', 'var(--r-net)', 'var(--live)'];
  return Array.from({ length: count }, () => Array.from({ length: 3 + Math.floor(rnd() * 4) }, () => ({
    '--x': `${(12 + rnd() * 70).toFixed(1)}%`,
    '--y': `${(8 + rnd() * 84).toFixed(1)}%`,
    '--c': colors[Math.floor(rnd() * colors.length)],
    '--d': `${(0.8 + rnd() * 3).toFixed(2)}s`,
    '--dl': `-${(rnd() * 3).toFixed(2)}s`,
  })));
}
const HALLS = [['far', makeHall(13, 1337)], ['near', makeHall(9, 42)]];
const RAIL = Array.from({ length: RACK_U }, (_, k) => RACK_U - k);
const RANGE = activityRange(RACK_MODEL.activity);
// The most recent week anyone committed: the night shift lights that week's units, so a
// quiet week never opens the room dark.
const SHIFT_WEEK = Math.max(0, ...RACK_MODEL.projects.map((p) => p.act?.weeks.findLastIndex((n) => n > 0) ?? -1));
const WEEK_COUNT = Math.max(1, ...Object.values(RACK_MODEL.activity.repos).map((r) => r.weeks.length));
// Public commits per week across every tracked repo, for the timeline's sparkline.
const WEEK_TOTALS = Array.from({ length: WEEK_COUNT }, (_, k) =>
  Object.values(RACK_MODEL.activity.repos).reduce((sum, r) => sum + (r.weeks[k] ?? 0), 0));
const WEEK_PEAK = Math.max(1, ...WEEK_TOTALS);
const WEEK_START = (k) => new Date(Date.parse(`${RACK_MODEL.activity.from}T00:00:00Z`) + k * 7 * 86_400_000).toISOString().slice(0, 10);

function Rail() {
  return (
    <div className="rail" aria-hidden="true">
      {RAIL.map((n, k) => <span key={n} style={{ top: `calc(var(--u) * ${k} + var(--u) / 2)` }}>{n}</span>)}
    </div>
  );
}

function Unit({ p, first, rack }) {
  const band = heatBand(p, RACK_MODEL.maxCommits);
  const blink = blinkOf(p);
  const pwr = p.status === 'Live' ? 'pwr-live' : p.status === 'In progress' ? 'pwr-prog' : 'pwr-priv';
  const style = { '--n': p.i };
  if (blink) style['--blink'] = blink;
  if (band !== null) style['--heat'] = `var(--heat-${band})`;
  const rest = `${p.status}, updated ${formatUpdated(p.updated)}, rack ${rack.code} ${p.u}${p.demoDown ? ', live demo not answering' : ''}`;
  const heat = p.act ? `${p.act.total} · ${WEEK_COUNT}W` : 'NO REPO';
  const label = `${p.title}, ${rest}`;
  // Commit heat swaps the status readout for `heat`, so serverRoom.js swaps the name to
  // match: it must lead with the words on the faceplate (WCAG 2.5.3, label in name). The
  // parenthesis says the count in full, and label-in-name matching ignores parentheticals.
  const heatLabel = p.act
    ? `${p.title}, ${heat} (${p.act.total} public commit${p.act.total === 1 ? '' : 's'} in ${WEEK_COUNT} weeks), ${rest}`
    : `${p.title}, no repo, ${rest}`;
  return (
    <button
      type="button"
      className={`unit${p.act ? '' : ' nodata'}${blink ? ' active' : ''}${p.demoDown ? ' down' : ''}${p.act?.weeks[SHIFT_WEEK] > 0 ? ' on-shift' : ''}`}
      data-i={p.i}
      aria-pressed="false"
      tabIndex={first ? 0 : -1}
      style={style}
      aria-label={label}
      data-label={label}
      data-heat-label={heatLabel}
    >
      <span className="lid" aria-hidden="true" />
      <span className="face" aria-hidden="true">
        <span className="ear" />
        <span className="vent"><span className="heat" /></span>
        <span className="tape">{p.title}</span>
        {/* The face is a grid, so this space never renders; it keeps the title and the
            readout as separate words ("Jarvis Private", not "JarvisPrivate") for find,
            copy and WCAG 2.5.3 label-in-name checks. */}
        {' '}
        <span className="vfd">
          <span className="v-status">{STATUS_VFD[p.status] ?? p.status}</span>
          <span className="v-heat">{heat}</span>
        </span>
        <span className="row2">
          <span className="bays"><i /><i /><i /><i /></span>
          <span className="nics">{p.ports.map((t) => <i key={t} data-tool={t} />)}</span>
          <span className={`pwr ${pwr}`} />
        </span>
        <span className="handle" />
        <span className="ear end" />
      </span>
    </button>
  );
}

function Rack({ rack }) {
  return (
    <div className="sr-rack" data-rack={rack.id} role="group" aria-label={`Rack ${rack.code}, ${rack.name}, ${rack.units.length} projects`}>
      <div className="cap cap-top" aria-hidden="true">
        <span className="stencil">{rack.code}</span>
        <span className="rack-name">{rack.name}</span>
      </div>
      <div className="frame">
        <Rail />
        <div className="bay">
          <div className="patch" role="group" aria-label={`Rack ${rack.code} patch panel, ${rack.patchU}`}>
            {rack.tools.map((t, k) => (
              <button
                type="button"
                className="pport"
                key={t}
                data-rack={rack.id}
                data-tool={t}
                aria-pressed="false"
                tabIndex={k === 0 ? 0 : -1}
                aria-label={`${t} port, shared by ${RACK_MODEL.counts.get(t)} projects. Fire a signal`}
              >
                <span className="jack" aria-hidden="true" />
                <span className="plabel" aria-hidden="true">{t}</span>
              </button>
            ))}
          </div>
          <div className="blank" aria-hidden="true" />
          {rack.units.map((p, k) => <Unit key={p.slug} p={p} first={k === 0} rack={rack} />)}
          {/* A rack with fewer than five projects keeps its full 14U: each empty 2U slot
              below the last unit gets two 1U blank panels, as a real rack would. */}
          {Array.from({ length: (MAX_UNITS - rack.units.length) * 2 }, (_, k) => <div className="blank" key={`fill-${k}`} aria-hidden="true" />)}
          <div className="blank" aria-hidden="true" />
        </div>
        <Rail />
        <div className="mgr" data-mgr={rack.id} aria-hidden="true" />
      </div>
      <div className="cap cap-bottom" aria-hidden="true">
        {rack.id === RACK_MODEL.racks.at(-1).id && BUILD_STAMP && <span className="vfd cap-build">{BUILD_STAMP}</span>}
      </div>
      <div className="side r" aria-hidden="true" />
      <div className="side l" aria-hidden="true" />
      <div className="roof" aria-hidden="true" />
    </div>
  );
}

export default function ServerRoom() {
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // Mount once. The markup below never re-renders; src/lib/serverRoom.js owns it from here.
  useEffect(() => mountServerRoom(rootRef.current, {
    model: RACK_MODEL,
    lenses,
    navigate: (to) => navigateRef.current(to, { viewTransition: true }),
    srcSetFor: cardSrcSet,
    formatUpdated,
    audience,
    snapshot: {
      name: profile.fullName,
      title: profile.title,
      tagline: profile.tagline,
      location: profile.location,
      email: profile.email,
      linkedin: profile.linkedin,
      github: profile.github,
      experience: profile.experience,
      certifications: profile.certifications,
      skillGroups: profile.skillGroups,
      resumeUrl: resumePdf,
    },
    // Anonymous GoatCounter events, no cookies. count.js ignores localhost.
    onEvent: (name) => window.goatcounter?.count?.({ path: `event/${name}`, title: name, event: true }),
  }), []);

  return (
    <div className="sr" ref={rootRef}>
      <section className="sr-hero" aria-labelledby="sr-name">
        <div className="sr-intro">
          <p className="kicker">{profile.role}</p>
          {/* One name, so it is read once. The full "Chadwick (Chad) Kraus" is in the title. */}
          <h1 id="sr-name" className="sr-name">Chad Kraus</h1>
          <p className="sr-headline">{profile.tagline}</p>
          <ul className="sr-proof">
            {profile.proof.map((item) => <li key={item}>{item}</li>)}
          </ul>
          {/* A plain link, not a router Link: the room reads ?tour=hiring when it loads,
              so the tour needs a real navigation even from the home page itself. */}
          <p className="sr-cta">
            <Link viewTransition to="/resume" className="btn btn-primary">View resume</Link>
            <a href="/?tour=hiring" className="btn">Walk through three projects</a>
          </p>
          <p className="sr-shift">Night shift: only units with the latest public commits are lit.</p>
        </div>

        <canvas className="sr-motes" aria-hidden="true" />
        <div className="sr-room">
          <div className="sr-aisle">
            <div className="sr-ceiling" aria-hidden="true" />
            {HALLS.map(([depth, ghosts]) => (
              <div key={depth} className={`sr-hall sr-hall-${depth}`} aria-hidden="true">
                {ghosts.map((leds, g) => (
                  <span className="sr-ghost" key={g}>{leds.map((style, l) => <i key={l} style={style} />)}</span>
                ))}
              </div>
            ))}
            <div className="sr-haze" aria-hidden="true"><i /><i /><i /></div>
            <div className="sr-floor" aria-hidden="true" />
            <div className="sr-tray" aria-hidden="true" />
            {RACK_MODEL.racks.map((rack) => <Rack key={rack.id} rack={rack} />)}
          </div>
          <canvas className="sr-cables" aria-hidden="true" />
        </div>

        <div className="sr-controls">
          <button type="button" className="sr-controls-toggle" aria-expanded="false" aria-controls="sr-controls-body">Room controls</button>
          <div className="sr-controls-body" id="sr-controls-body">
          <div className="sr-row">
            <div className="seg" role="group" aria-label="Lens">
              <button type="button" data-lens-btn="all" aria-pressed="true">Both racks</button>
              {Object.entries(lenses).map(([key, lens]) => (
                <button type="button" key={key} data-lens-btn={key} aria-pressed="false">{lens.name}</button>
              ))}
            </div>
            <button type="button" className="sr-heat" aria-pressed="false"><span className="sw" aria-hidden="true" />Commit heat</button>
            <button type="button" className="sr-sound" aria-pressed="false"><span className="spk" aria-hidden="true" />Sound</button>
          </div>
          <div className="sr-row sr-timeline">
            <label className="sr-week" htmlFor="sr-week">Week</label>
            <span className="sr-week-scrub">
              <span className="sr-week-spark" aria-hidden="true">
                {WEEK_TOTALS.map((n, k) => (
                  <i
                  key={k}
                  style={{ '--h': `${Math.round((n / WEEK_PEAK) * 100)}%` }}
                  data-week={k}
                  title={`Week of ${formatDay(WEEK_START(k))}: ${n} public commit${n === 1 ? '' : 's'}`}
                />
                ))}
              </span>
              <input id="sr-week" className="sr-week-range" type="range" min="0" max={WEEK_COUNT - 1} step="1" defaultValue={WEEK_COUNT - 1} />
            </span>
            <output className="sr-week-out" htmlFor="sr-week">Latest week</output>
            <button type="button" className="sr-replay" aria-pressed="false">Replay</button>
          </div>
          <div className="sr-legend" hidden>
            <span>Public commits · {RANGE}</span>
            <span className="ramp">
              {HEAT_BANDS.map((low, k) => (
                <span key={low} style={{ '--c': `var(--heat-${k})` }}>{Math.round(low * RACK_MODEL.maxCommits)}+</span>
              ))}
            </span>
            <span className="nodata-key"><i aria-hidden="true" />No public repo</span>
          </div>
          </div>
        </div>

        <div className="sr-kvm">
          <div className="sr-kvm-screen" id="sr-kvm-screen" hidden>
            <div className="sr-kvm-log" aria-live="polite" />
            <div className="sr-kvm-line">
              <label className="sr-prompt" htmlFor="sr-kvm-q">chad@rack:~$</label>
              <input id="sr-kvm-q" className="sr-kvm-q" type="text" autoComplete="off" spellCheck="false" role="combobox" aria-expanded="true" aria-controls="sr-kvm-sugs" aria-autocomplete="list" />
            </div>
            <ul className="sr-kvm-sugs" id="sr-kvm-sugs" role="listbox" aria-label="Suggestions" />
            <p className="sr-kvm-help">Tab completes · ↑ ↓ choose · Enter runs · Esc closes</p>
          </div>
          <button type="button" className="sr-kvm-toggle" aria-expanded="false" aria-controls="sr-kvm-screen">
            <span>Console</span><span className="grip" aria-hidden="true" /><kbd className="sr-kbd">⌘K</kbd>
          </button>
        </div>

        <p className="sr-cue" aria-hidden="true">Scroll to walk in</p>

        <div className="sr-tour" role="region" aria-label="Guided tour" hidden>
          <p className="sr-tour-step" aria-live="polite">New here? The room has a 20-second tour.</p>
          <p className="sr-tour-proof" hidden />
          <div className="sr-tour-actions">
            <button type="button" className="btn btn-primary" data-tour="next">Take the tour</button>
            <button type="button" className="btn" data-tour="end">No thanks</button>
          </div>
          <div className="sr-tour-dots" aria-hidden="true"><i /><i /><i /><i /></div>
        </div>

        <aside className="sr-sheet" aria-labelledby="sr-sheet-title" aria-hidden="true" inert>
          <div className="sr-sheet-bar">
            <span className="sr-sheet-where" />
            <button type="button" className="sr-sheet-close" aria-label="Close details">×</button>
          </div>
          <div className="sr-sheet-body" />
        </aside>
        <p className="visually-hidden sr-live" aria-live="polite" />
      </section>
    </div>
  );
}
