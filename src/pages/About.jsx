import { Link } from 'react-router';
import { profile } from '../data/profile.js';
import { projects } from '../data/projects.js';
import { formatUpdated, statusModifier } from '../lib/projectMeta.js';
import { cardSrcSet, EVIDENCE_SIZES } from '../lib/cardImages.js';
import headshot from '../assets/images/headshot.jpg';
import './About.css';

// The homepage argues one thing before the visitor reads a paragraph: the
// failure patterns Chad has been paged for, and the mechanisms he builds
// because of them. Both columns are quoted from src/data — profile.js for the
// failure patterns, notes.js for the mechanisms. Nothing here is invented, and
// the relationship claimed is the one his own writing makes: a pattern and the
// principle applied against it, never "this incident caused this app".
const PAIRS = [
  {
    id: '01',
    fail: 'A check that lived in the client instead of the database.',
    fix: 'Row-level security in the database instead of checks in the client.',
    attr: 'PetCenza',
  },
  {
    id: '02',
    fail: 'Safety left as a property of instruction-following.',
    fix: 'The filter runs before the model. The unsafe option is absent rather than discouraged.',
    attr: 'CoachRhythm',
  },
  {
    id: '03',
    fail: 'A permission that was too broad.',
    fix: 'Deny-by-default connectors, and human confirmation before anything destructive.',
    attr: 'Jarvis',
  },
];

// Operations evidence. Every value is quoted from the Rockbot paragraph in
// profile.js. The figure keeps the source's level of ownership: a business case
// identified the devices; an upgrade program was built around it.
const RAIL = [
  {
    label: 'Escalation scope',
    value:
      'Tier 2/3 across networking, AV hardware, APIs, identity systems and SaaS platform behavior.',
  },
  {
    label: 'Triage + enablement',
    value:
      'Chairs weekly bug triage. Wrote the onboarding package new escalation engineers train from.',
  },
  { label: 'Shipped', value: 'Ten applications' },
];

// Selected evidence: the three projects named in the pairs above, so the hero's
// claim and the proof below reference the same work.
const EVIDENCE = ['petcenza', 'coachrhythm', 'jarvis'];

const FIELDS = {
  petcenza: {
    condition: 'A check that lived in the client instead of the database.',
    action: 'Row-level security in the database instead of checks in the client.',
    verify: 'Supabase (Postgres RLS) · PWA / Offline-first · Vitest + Playwright',
  },
  coachrhythm: {
    condition:
      'Telling the model about the injuries and asking it not to do that makes safety a property of instruction-following — and the failure is silent.',
    action:
      'The filter runs before the model. Exercises are screened against logged contraindications deterministically, and the model is handed an already-filtered pool.',
    verify:
      'A second deterministic pass checks movement balance, pull-to-push volume, recovery spacing, rep ranges and progression — with no model anywhere in the verification path.',
  },
  jarvis: {
    condition: 'A permission that was too broad.',
    action: 'Deny-by-default connectors, and human confirmation before anything destructive.',
    verify: 'Local-first · permission-gated · on-device voice',
  },
};

function Evidence({ slug, index }) {
  const project = projects.find((p) => p.slug === slug);
  if (!project) return null;

  const { title, image, projectLink, status, updated } = project;
  const fields = FIELDS[slug];
  // Private projects never render a link — see the policy in CLAUDE.md.
  const linked = Boolean(projectLink);

  return (
    <article className={`evi ${index % 2 === 1 ? 'evi--reverse' : ''}`}>
      <figure className="evi__figure">
        {image ? (
          <picture>
            <source type="image/avif" srcSet={cardSrcSet(image)} sizes={EVIDENCE_SIZES} />
            <img src={image} alt={`${title} screenshot`} loading="lazy" />
          </picture>
        ) : (
          <div className="evi__placeholder" aria-hidden="true">
            <span>{status || 'No screenshot'}</span>
          </div>
        )}
      </figure>

      <div className="evi__body">
        <span className="evi__num">{String(index + 1).padStart(2, '0')}</span>
        <h3 className="evi__title">
          {linked ? (
            <a href={projectLink} target="_blank" rel="noopener noreferrer">{title}</a>
          ) : (
            title
          )}
        </h3>

        <p className="evi__state">
          {status && (
            <span className={`state state--${statusModifier(status)}`}>{status}</span>
          )}
          {updated && <span className="state__date">{formatUpdated(updated)}</span>}
        </p>

        <dl className="fields">
          <dt>Condition</dt>
          <dd>{fields.condition}</dd>
          <dt>Action</dt>
          <dd>{fields.action}</dd>
          <dt>Verify</dt>
          <dd>{fields.verify}</dd>
        </dl>

        <Link to={`/projects/${slug}`} className="evi__more">Full write-up</Link>
      </div>
    </article>
  );
}

export default function About() {
  return (
    <>
      {/* Hero: identity, then the paired reasoning, then operations scale. */}
      <section className="hero">
        <div className="container">
          <div className="identity">
            <h1 className="identity__name">{profile.name}</h1>
            <p className="identity__role">{profile.title}</p>
          </div>

          {/* Stated once here on small screens; the column headers carry it on
              desktop, so it is not repeated inside every unit. */}
          <p className="pairs__mobile-head">
            What fails in the field <span aria-hidden="true">→</span> what I make structurally impossible
          </p>

          <div className="pairs">
            <div className="pairs__head" aria-hidden="true">
              <span className="pairs__num" />
              <span className="pairs__label">What fails in the field</span>
              <span className="pairs__label">What I make structurally impossible</span>
            </div>

            {PAIRS.map(({ id, fail, fix, attr }) => (
              <div className="pair" key={id}>
                <span className="pairs__num">{id}</span>
                <p className="pair__fail">{fail}</p>
                <div className="pair__fix">
                  <p>{fix}</p>
                  <span className="pair__attr">{attr}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rail">
            <div className="rail__cell rail__cell--figure">
              <span className="rail__figure">2,000+</span>
              <p className="rail__caption">
                End-of-life firmware devices identified in a business case that a customer
                upgrade program was built around.
              </p>
            </div>
            {RAIL.map(({ label, value }) => (
              <div className="rail__cell" key={label}>
                <span className="label">{label}</span>
                <span className="rail__value">{value}</span>
              </div>
            ))}
          </div>

          <p className="thesis">
            Decide what must never happen, then make it structurally impossible rather than
            instructed against.
          </p>
        </div>
      </section>

      {/* Selected evidence -------------------------------------------------- */}
      <section className="evidence">
        <div className="container">
          <h2 className="section-rule">
            <span className="section-rule__label">02 — Selected evidence</span>
          </h2>

          {EVIDENCE.map((slug, i) => (
            <Evidence key={slug} slug={slug} index={i} />
          ))}

          <p className="evidence__more">
            <Link to="/portfolio">All ten projects</Link>
          </p>
        </div>
      </section>

      {/* Background --------------------------------------------------------- */}
      <section className="background">
        <div className="container">
          <h2 className="section-rule">
            <span className="section-rule__label">03 — Background</span>
          </h2>

          <div className="bg-grid">
            <div className="bg-bio prose">
              {profile.about.map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>

            <aside className="bg-side">
              <img
                src={headshot}
                alt={`${profile.fullName} headshot`}
                className="bg-photo"
                width="640"
                height="640"
              />

              <h3 className="label bg-side__label">Certifications</h3>
              <ul className="bg-list">
                {profile.certifications.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>

              <h3 className="label bg-side__label">Toolbox</h3>
              {profile.skillGroups.map(({ label, items }) => (
                <div className="skill-group" key={label}>
                  <h4 className="skill-group__label">{label}</h4>
                  <p className="skill-group__items">{items.join(' · ')}</p>
                </div>
              ))}
            </aside>
          </div>

          <div className="bg-actions">
            <Link to="/resume" className="btn btn-primary">View resume</Link>
            <Link to="/contact" className="btn btn-outline">Get in touch</Link>
          </div>
        </div>
      </section>
    </>
  );
}
