import { Link, useSearchParams } from 'react-router';
import UptimeStrip from '../components/UptimeStrip.jsx';
import { RACK_MODEL } from '../lib/rack.js';
import { formatDay, toolSlug } from '../lib/projectMeta.js';
import { incidentsFor } from '../lib/rackModel.js';
import { BUILD_TIME } from '../lib/build.js';
import { incidents } from '../data/incidents.js';
import './Status.css';

const LIVE = RACK_MODEL.projects.filter((p) => p.projectLink);
// Shared services: tools more than one live demo is built on. If one of these had an
// outage of its own, these are the demos that would feel it.
const SHARED = RACK_MODEL.tools
  .map((tool) => [tool, LIVE.filter((p) => p.tools.has(tool))])
  .filter(([, users]) => users.length > 1)
  .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
const UNLINKED = RACK_MODEL.projects.filter((p) => !p.projectLink);

// Every live demo's uptime record in one place, from the daily check
// (scripts/check-uptime.mjs), as of this build.
export default function Status() {
  const down = LIVE.filter((p) => p.demoDown);
  const [params, setParams] = useSearchParams();
  const days = params.get('days') === '90' ? 90 : 30;
  const setDays = (n) => setParams(n === 90 ? { days: '90' } : {}, { replace: true, preventScrollReset: true });
  return (
    <section className="page">
      <div className="container">
        <header className="page-head st-head">
          <p className="kicker">Status</p>
          <h1 className="page-title">Demo status</h1>
          <p className="lede">
            Whether each live demo answered the daily check, as of this build. A demo behind a sign-in still counts as
            answering, because the app is up behind it. When a demo was down, a note under its strip says why.
          </p>
          <p className={`st-summary${down.length ? ' is-down' : ''}`}>
            {down.length ? `${down.length} of ${LIVE.length} live demos not answering` : `All ${LIVE.length} live demos answering`}
          </p>
        </header>

        <div className="seg st-range" role="group" aria-label="Uptime history length">
          {[30, 90].map((n) => (
            <button type="button" key={n} aria-pressed={days === n} onClick={() => setDays(n)}>{n} days</button>
          ))}
        </div>

        <ul className="st-list">
          {LIVE.map((p) => {
            const notes = BUILD_TIME ? incidentsFor(incidents, p.slug, BUILD_TIME.slice(0, 10), days) : [];
            return (
            <li key={p.slug} className="st-row">
              <div className="st-row-head">
                <h2><Link viewTransition to={`/projects/${p.slug}`}>{p.title}</Link></h2>
                <span className={`chip${p.demoDown ? ' chip-warn' : ''}`}>
                  <span className="dot" style={{ color: p.demoDown ? 'var(--danger)' : 'var(--live)' }} />
                  {p.demoDown ? `Not answering since ${formatDay(p.demoDown)}` : 'Answering'}
                </span>
              </div>
              <UptimeStrip site={p.uptime} days={days} notes={notes} />
              {notes.map((i) => (
                <p key={i.from} className="st-incident">
                  <span>{formatDay(i.from)}</span>{i.note}
                  {i.issue && <a href={`https://github.com/chadkraus87/React-Portfolio-v2/issues/${i.issue}`} target="_blank" rel="noopener noreferrer">Issue #{i.issue}</a>}
                </p>
              ))}
              <a className="st-link" href={p.projectLink} target="_blank" rel="noopener noreferrer">
                {p.projectLinkLabel || 'Open the live demo'} ↗
              </a>
            </li>
            );
          })}
        </ul>

        <section className="st-blast" aria-labelledby="st-blast-title">
          <h2 id="st-blast-title">If a shared service went down</h2>
          <p>Each of these is used by more than one live demo, so an outage at their end would take all of them with it. Read from the stack listed on each case study.</p>
          <ul>
            {SHARED.map(([tool, users]) => (
              <li key={tool}>
                <Link viewTransition to={`/portfolio?tool=${toolSlug(tool)}`}>{tool}</Link>
                <span>{users.length} live demos: {users.map((p) => p.title).join(', ')}</span>
              </li>
            ))}
          </ul>
        </section>

        <p className="st-note">No public demo to check: {UNLINKED.map((p) => p.title).join(', ')}.</p>
      </div>
    </section>
  );
}
