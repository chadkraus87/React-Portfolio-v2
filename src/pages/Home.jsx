import { Link } from 'react-router';
import ServerRoom from '../components/ServerRoom.jsx';
import { profile } from '../data/profile.js';
import { lenses } from '../data/racks.js';
import { siteStories } from '../data/stories.js';
import { RACK_MODEL } from '../lib/rack.js';
import { formatUpdated } from '../lib/projectMeta.js';
import headshot from '../assets/images/headshot.jpg';
import './Home.css';

// Failure patterns from the field, each paired with the mechanism built against
// it. Copy carried over unchanged from the previous home page.
const PAIRS = [
  { id: '01', fail: 'A check that lived in the client instead of the database.', fix: 'Row-level security in the database instead of checks in the client.', attr: 'PetCenza' },
  { id: '02', fail: 'Safety left as a property of instruction-following.', fix: 'The filter runs before the model. The unsafe option is absent rather than discouraged.', attr: 'CoachRhythm' },
  { id: '03', fail: 'A permission that was too broad.', fix: 'Deny-by-default connectors, and human confirmation before anything destructive.', attr: 'Jarvis' },
];

// Operations evidence. Every value is quoted from the Rockbot paragraph in profile.js.
const RAIL = [
  { label: 'Escalation scope', value: 'Tier 2/3 across networking, AV hardware, APIs, identity systems and SaaS platform behavior.' },
  { label: 'Triage + enablement', value: 'Chairs weekly bug triage. Wrote the onboarding package new escalation engineers train from.' },
  { label: 'Shipped', value: 'Ten applications' },
];

export default function Home() {
  return (
    <>
      <ServerRoom />

      <section className="home-sec" id="projects" aria-labelledby="projects-title">
        <div className="container">
          <header className="sec-head">
            <p className="kicker">Index</p>
            <h2 className="sec-title" id="projects-title">Projects</h2>
            <p className="lede">The ten units in the two racks above, in rack order. Each one opens its own case study.</p>
          </header>
          <div className="ix-grid">
            {RACK_MODEL.racks.map((rack) => (
              <div className="ix-rack" key={rack.id}>
                <h3 className="ix-head"><span>{rack.name} · {lenses[rack.lens].name}</span><span className="ix-code">{rack.code}</span></h3>
                <ul className="ix-list">
                  {rack.units.map((p) => (
                    <li key={p.slug}>
                      <Link to={`/projects/${p.slug}`} className="ix-link">
                        <span className="ix-title">{p.title}</span>
                        <span className="vfd">{p.u}</span>
                      </Link>
                      <span className="ix-meta">
                        {p.status} · Updated {formatUpdated(p.updated)} · {p.act ? `${p.act.total} public commits` : 'No public repo'} · {p.lensNames.join(' + ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="home-more"><Link to="/portfolio" className="btn">Browse every project</Link></p>
        </div>
      </section>

      <section className="home-sec ops" id="operations" aria-labelledby="ops-title">
        <div className="container">
          <header className="sec-head">
            <p className="kicker">The other half</p>
            <h2 className="sec-title" id="ops-title">Operations</h2>
          </header>
          <div className="ops-grid">
            <div className="ops-figure">
              <span className="ops-num">2,000+</span>
              <p>End-of-life firmware devices identified in a business case that a customer upgrade program was built around.</p>
            </div>
            <dl className="ops-rail">
              {RAIL.map(({ label, value }) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          </div>
          <div className="log">
            <p className="log-head"><span>What fails in the field</span><span aria-hidden="true">→</span><span>what I make structurally impossible</span></p>
            <ol className="log-list">
              {PAIRS.map(({ id, fail, fix, attr }) => (
                <li key={id}>
                  <span className="vfd log-id">{id}</span>
                  <p className="log-fail">{fail}</p>
                  <p className="log-fix"><span aria-hidden="true">↳ </span>{fix}</p>
                  <span className="tape log-attr">{attr}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="thesis">Decide what must never happen, then make it structurally impossible rather than instructed against.</p>
        </div>
      </section>

      <section className="home-sec" id="background" aria-labelledby="bg-title">
        <div className="container">
          <header className="sec-head">
            <p className="kicker">Background</p>
            <h2 className="sec-title" id="bg-title">The operator</h2>
          </header>
          <div className="bg-grid">
            <figure className="bg-photo">
              <img src={headshot} alt={`${profile.fullName} headshot`} width="640" height="640" loading="lazy" />
            </figure>
            <div className="bg-bio">
              {profile.about.map((para) => <p key={para.slice(0, 40)}>{para}</p>)}
            </div>
          </div>
          <div className="rec-grid">
            <section className="rec" aria-labelledby="exp-title">
              <h3 id="exp-title">Experience</h3>
              <ul>{profile.experience.map((e) => <li key={e.title}><strong>{e.title}</strong><span>{e.org} · {e.dates}</span></li>)}</ul>
            </section>
            <section className="rec" aria-labelledby="cert-title">
              <h3 id="cert-title">Credentials</h3>
              <ul>{profile.certifications.map((c) => <li key={c.name}><strong>{c.name}</strong><span>{c.meta}</span></li>)}</ul>
            </section>
          </div>
          <section className="toolbox" aria-labelledby="tools-title">
            <h3 id="tools-title">Toolbox</h3>
            <div className="tool-groups">
              {profile.skillGroups.map(({ label, items }) => (
                <div key={label}>
                  <h4>{label}</h4>
                  <ul className="labels">{items.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="home-sec" id="built" aria-labelledby="built-title">
        <div className="container">
          <header className="sec-head">
            <p className="kicker">Colophon</p>
            <h2 className="sec-title" id="built-title">How this site was built</h2>
            <p className="lede">Built with Claude Code. Two things that broke along the way, and what changed because of them.</p>
          </header>
          <div className="built-grid">
            {siteStories.map((story) => (
              <article className="story" key={story.id}>
                <h3>{story.title}</h3>
                {story.body.map((para) => <p key={para.slice(0, 40)}>{para}</p>)}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta" aria-labelledby="cta-title">
        <div className="container cta-inner">
          <h2 className="sec-title" id="cta-title">Next step</h2>
          <div className="cta-actions">
            <Link to="/resume" className="btn btn-primary">View resume</Link>
            <Link to="/contact" className="btn">Get in touch</Link>
          </div>
        </div>
      </section>
    </>
  );
}
