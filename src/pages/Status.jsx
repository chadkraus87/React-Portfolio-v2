import { Link, useSearchParams } from 'react-router';
import UptimeStrip from '../components/UptimeStrip.jsx';
import { RACK_MODEL } from '../lib/rack.js';
import { formatDay } from '../lib/projectMeta.js';
import './Status.css';

const LIVE = RACK_MODEL.projects.filter((p) => p.projectLink);
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
            answering, because the app is up behind it.
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
          {LIVE.map((p) => (
            <li key={p.slug} className="st-row">
              <div className="st-row-head">
                <h2><Link viewTransition to={`/projects/${p.slug}`}>{p.title}</Link></h2>
                <span className={`chip${p.demoDown ? ' chip-warn' : ''}`}>
                  <span className="dot" style={{ color: p.demoDown ? 'var(--danger)' : 'var(--live)' }} />
                  {p.demoDown ? `Not answering since ${formatDay(p.demoDown)}` : 'Answering'}
                </span>
              </div>
              <UptimeStrip site={p.uptime} days={days} />
              <a className="st-link" href={p.projectLink} target="_blank" rel="noopener noreferrer">
                {p.projectLinkLabel || 'Open the live demo'} ↗
              </a>
            </li>
          ))}
        </ul>

        <p className="st-note">No public demo to check: {UNLINKED.map((p) => p.title).join(', ')}.</p>
      </div>
    </section>
  );
}
