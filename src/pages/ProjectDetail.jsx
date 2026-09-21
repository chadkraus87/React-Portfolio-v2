import { useParams, Link } from 'react-router';
import Monitor from '../components/Monitor.jsx';
import Architecture from '../components/Architecture.jsx';
import ToolTrace from '../components/ToolTrace.jsx';
import Spark from '../components/Spark.jsx';
import UptimeStrip from '../components/UptimeStrip.jsx';
import { projectStories } from '../data/stories.js';
import lighthouse from '../data/lighthouse.json';
import { RACK_MODEL } from '../lib/rack.js';
import { activityRange } from '../lib/rackModel.js';
import { DETAIL_SIZES } from '../lib/cardImages.js';
import { formatUpdated, formatDay, STATUS_COLOR } from '../lib/projectMeta.js';
import NotFound from './NotFound.jsx';
import './ProjectDetail.css';

const RANGE = activityRange(RACK_MODEL.activity);

// Opens every collapsed section and loads the print copy of a demo's screenshot
// first, so the printed case study carries everything on the page.
const printCaseStudy = async () => {
  document.querySelectorAll('.cs details').forEach((d) => { d.open = true; });
  const shots = [...document.querySelectorAll('.cs .monitor-print')];
  shots.forEach((img) => { img.loading = 'eager'; });
  await Promise.all(shots.map((img) => (img.complete ? null : new Promise((done) => { img.onload = done; img.onerror = done; }))));
  window.print();
};
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
            {p.demoDown && <li className="chip chip-warn">Live demo not answering since {formatDay(p.demoDown)}</li>}
          </ul>
          <p className="cs-rack-link">
            <Link viewTransition to={`/?unit=${p.slug}`} className="btn">Show in the rack</Link>
            <Link viewTransition to={`/contact?project=${p.slug}`} className="btn">Ask about this project</Link>
            <button type="button" className="btn" onClick={printCaseStudy}>Print case study</button>
          </p>
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
              {lighthouse.sites?.[p.slug] && (
                <p className="cs-lh">
                  Lighthouse on {lighthouse.sites[p.slug].formFactor === 'mobile' ? 'mobile' : 'desktop'}, measured {formatDay(lighthouse.sites[p.slug].measured)}:{' '}
                  {lighthouse.sites[p.slug].performance} performance · {lighthouse.sites[p.slug].accessibility} accessibility ·{' '}
                  {lighthouse.sites[p.slug].bestPractices} best practices · {lighthouse.sites[p.slug].seo} SEO
                </p>
              )}
              <Spark act={p.act} maxWeek={RACK_MODEL.maxWeek} range={RANGE} />
              {p.projectLink && <UptimeStrip site={p.uptime} />}
            </li>
          </ol>

          <aside className="cs-side" aria-labelledby="cs-patched">
            <h2 id="cs-patched">Patched to</h2>
            <ToolTrace key={p.slug} project={p} />
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

        <Architecture project={p} />

        {p.verdict && (
          <section className="cs-verdict" aria-labelledby="cs-verdict-title">
            <p className="kicker">Verdict</p>
            <h2 id="cs-verdict-title">What I’d do differently</h2>
            <p>{p.verdict}</p>
          </section>
        )}

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
