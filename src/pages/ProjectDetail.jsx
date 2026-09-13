import { useParams, Link } from 'react-router';
import Monitor from '../components/Monitor.jsx';
import Spark from '../components/Spark.jsx';
import { projectStories } from '../data/stories.js';
import { RACK_MODEL } from '../lib/rack.js';
import { activityRange } from '../lib/rackModel.js';
import { DETAIL_SIZES } from '../lib/cardImages.js';
import { formatUpdated, STATUS_COLOR } from '../lib/projectMeta.js';
import NotFound from './NotFound.jsx';
import './ProjectDetail.css';

const RANGE = activityRange(RACK_MODEL.activity);
const ALL = RACK_MODEL.projects;

// One project's case study at /projects/<slug>, laid out as the same signal path
// the rack's detail sheet uses: what it answers, how it's built, and the proof.
export default function ProjectDetail() {
  const { slug } = useParams();
  const p = ALL.find((x) => x.slug === slug);
  if (!p) return <NotFound />;

  const rack = RACK_MODEL.racks.find((r) => r.id === p.rack);
  const story = projectStories[slug];
  const peers = ALL.filter((o) => o !== p && o.ports.some((t) => p.tools.has(t)));
  const prev = ALL[(p.i - 1 + ALL.length) % ALL.length];
  const next = ALL[(p.i + 1) % ALL.length];

  return (
    <article className="page cs">
      <div className="container">
        <Link viewTransition to="/portfolio" className="cs-back"><span aria-hidden="true">←</span> All projects</Link>

        <header className="cs-head">
          <p className="kicker">Rack {rack.code} · {p.u} · {rack.name}</p>
          <h1 className="page-title">{p.title}</h1>
          <p className="cs-tag">{p.tagline}</p>
          <ul className="cs-chips">
            <li className="chip"><span className="dot" style={{ color: STATUS_COLOR[p.status] }} />{p.status}</li>
            <li className="chip">Updated {formatUpdated(p.updated)}</li>
            <li className="chip">{p.act ? `${p.act.total} public commits · 12 wk` : 'No public repo'}</li>
            <li className="chip">{p.lensNames.join(' + ')} lens</li>
          </ul>
        </header>

        <Monitor project={p} sizes={DETAIL_SIZES} />

        <div className="cs-grid">
          <ol className="cs-path">
            <li>
              <span className="cs-step">01 · Input</span>
              <h2>What it answers</h2>
              <p>{p.summary}</p>
            </li>
            <li>
              <span className="cs-step">02 · Process</span>
              <h2>How it’s built</h2>
              {p.details && <p>{p.details}</p>}
              <ul className="cs-stack">{p.stack.map((tech) => <li key={tech}>{tech}</li>)}</ul>
            </li>
            <li>
              <span className="cs-step">03 · Output</span>
              <h2>Proof</h2>
              {p.projectLink || p.repoLink ? (
                <div className="cs-actions">
                  {p.projectLink && <a href={p.projectLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">{p.projectLinkLabel || 'View project'} ↗</a>}
                  {p.repoLink && <a href={p.repoLink} target="_blank" rel="noopener noreferrer" className="btn">GitHub repo ↗</a>}
                </div>
              ) : (
                <p className="cs-note">{p.linkNote || 'This project isn’t publicly linked — it runs on private infrastructure.'}</p>
              )}
              <Spark act={p.act} maxWeek={RACK_MODEL.maxWeek} range={RANGE} />
            </li>
          </ol>

          <aside className="cs-side" aria-labelledby="cs-patched">
            <h2 id="cs-patched">Patched to</h2>
            <ul className="cs-tools">
              {p.ports.map((t) => (
                <li key={t}><span>{t}</span><span className="vfd" aria-label={`shared by ${RACK_MODEL.counts.get(t)} projects`}>{RACK_MODEL.counts.get(t)}</span></li>
              ))}
            </ul>
            <p>Tools this project shares with others on the site. The number is how many projects use it.</p>
            {peers.length > 0 && (
              <>
                <h2>Shares a tool with</h2>
                <ul className="cs-peers">
                  {peers.map((o) => <li key={o.slug}><Link viewTransition to={`/projects/${o.slug}`}>{o.title}</Link></li>)}
                </ul>
              </>
            )}
          </aside>
        </div>

        {story && (
          <section className="cs-story" aria-labelledby="cs-story-title">
            <p className="kicker">Field notes</p>
            <h2 id="cs-story-title">{story.title}</h2>
            {story.body.map((para) => <p key={para.slice(0, 40)}>{para}</p>)}
          </section>
        )}

        <nav className="cs-pager" aria-label="More projects">
          <Link viewTransition to={`/projects/${prev.slug}`}><span>← Previous unit</span><strong>{prev.title}</strong></Link>
          <Link viewTransition to={`/projects/${next.slug}`}><span>Next unit →</span><strong>{next.title}</strong></Link>
        </nav>
      </div>
    </article>
  );
}
