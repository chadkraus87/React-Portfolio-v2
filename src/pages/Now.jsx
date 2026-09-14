import { Link } from 'react-router';
import { RACK_MODEL } from '../lib/rack.js';
import { latestFullWeeks } from '../lib/rackModel.js';
import { formatUpdated, formatDay } from '../lib/projectMeta.js';
import { now } from '../data/now.js';
import './Now.css';

const P = RACK_MODEL.projects;
const WEEK = latestFullWeeks(RACK_MODEL.activity, 1)[0];
const WEEK_COMMITS = WEEK
  ? P.map((p) => [p, p.act?.weeks[WEEK.k] ?? 0]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1] || a[0].i - b[0].i)
  : [];
const IN_PROGRESS = P.filter((p) => p.status === 'In progress');
const RECENT = [...P].sort((a, b) => b.updated.localeCompare(a.updated) || a.i - b.i).slice(0, 3);
const LIVE = P.filter((p) => p.projectLink);
const DOWN = LIVE.filter((p) => p.demoDown);

// What's moving now, from the same data as the rest of the site, plus an optional
// note Chad writes in src/data/now.js. Nothing here is filled in on his behalf.
export default function Now() {
  return (
    <section className="page">
      <div className="container now">
        <header className="page-head now-head">
          <p className="kicker">Now</p>
          <h1 className="page-title">Now</h1>
          <p className="lede">
            What’s moving at the moment, from the same data as the rest of the site: public commits, project status and
            the daily demo check.
          </p>
        </header>

        {now.note && (
          <section className="now-note" aria-labelledby="now-note-title">
            <h2 id="now-note-title">A note from Chad</h2>
            <p>{now.note}</p>
            {now.updated && <p className="now-date">Written {formatDay(now.updated)}</p>}
          </section>
        )}

        <section aria-labelledby="now-week">
          <h2 id="now-week">{WEEK ? `Week of ${formatDay(WEEK.start)}` : 'This week'}</h2>
          {WEEK_COMMITS.length ? (
            <ul className="now-list">
              {WEEK_COMMITS.map(([p, n]) => (
                <li key={p.slug}>
                  <Link viewTransition to={`/projects/${p.slug}`}>{p.title}</Link>
                  <span>{n} public commit{n === 1 ? '' : 's'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No public commits that week.</p>
          )}
          <p className="now-more">
            <Link viewTransition to="/changes">What changed, month by month</Link> · <a href="/digest.xml">Weekly digest (RSS)</a>
          </p>
        </section>

        <section aria-labelledby="now-building">
          <h2 id="now-building">In progress</h2>
          {IN_PROGRESS.length ? (
            <ul className="now-list">
              {IN_PROGRESS.map((p) => (
                <li key={p.slug}>
                  <Link viewTransition to={`/projects/${p.slug}`}>{p.title}</Link>
                  <span>{p.tagline}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nothing is marked in progress right now.</p>
          )}
        </section>

        <section aria-labelledby="now-updated">
          <h2 id="now-updated">Recently updated</h2>
          <ul className="now-list">
            {RECENT.map((p) => (
              <li key={p.slug}>
                <Link viewTransition to={`/projects/${p.slug}`}>{p.title}</Link>
                <span>Updated {formatUpdated(p.updated)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="now-demos">
          <h2 id="now-demos">Live demos</h2>
          <p>
            {DOWN.length ? `${DOWN.length} of ${LIVE.length} live demos are not answering.` : `All ${LIVE.length} live demos are answering the daily check.`}{' '}
            <Link viewTransition to="/status">See the uptime record</Link>
          </p>
        </section>
      </div>
    </section>
  );
}
