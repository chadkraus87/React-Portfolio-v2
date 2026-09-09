import { Link } from 'react-router';
import { profile } from '../data/profile.js';
import { projects } from '../data/projects.js';
import { formatUpdated, statusModifier } from '../lib/projectMeta.js';
import { cardSrcSet, BAND_SIZES, HALF_SIZES, HERO_SIZES } from '../lib/cardImages.js';
import { useReveal } from '../lib/reveal.js';
import headshot from '../assets/images/headshot.jpg';
// The evidence entries render in ProjectCard's footprints, so this page depends
// on that stylesheet directly rather than on bundling order.
import '../components/ProjectCard.css';
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
//
// Each entry is laid out in one of the SAME footprints /portfolio uses, so the
// homepage previews the system instead of running a second visual language.
// F1 opens full-bleed, then F3 and F2 mirror each other. F4 (minor) is left out
// deliberately: nothing in the selected evidence should read as de-emphasised,
// and skipping it keeps this from replaying the portfolio's own sequence.
const EVIDENCE = [
  { slug: 'petcenza', footprint: 'band' },
  { slug: 'coachrhythm', footprint: 'left' },
  { slug: 'jarvis', footprint: 'right' },
];
const EVIDENCE_SIZES_BY_FOOTPRINT = { band: BAND_SIZES, left: HALF_SIZES, right: HALF_SIZES };

// The hero splits profile.title at its em dash rather than restating it:
// "Network IT Specialist at Rockbot" becomes the eyebrow, the rest the role
// line. One source, two positions.
const [HERO_EYEBROW, HERO_ROLE] = (() => {
  const [head, ...rest] = profile.title.split('—');
  return [head.trim(), rest.join('—').trim()];
})();

// "Chadwick (Chad) Kraus" -> two display lines. Derived, never hardcoded.
const NAME_LINES = (() => {
  const i = profile.name.lastIndexOf(' ');
  return i === -1 ? [profile.name, ''] : [profile.name.slice(0, i), profile.name.slice(i + 1)];
})();

// The hero carries one piece of real product evidence. Packet & Pine is a
// shipped project whose on-screen numbers are unmistakably game state, so
// nothing in it can be misread as a production or customer metric.
const HERO_PROJECT = 'packet-and-pine';

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

function Evidence({ slug, footprint, index }) {
  const project = projects.find((p) => p.slug === slug);
  if (!project) return null;

  const { title, image, projectLink, status, updated, category } = project;
  const fields = FIELDS[slug];
  // Private projects never render a link — see the policy in CLAUDE.md.
  const linked = Boolean(projectLink);

  // Reuses ProjectCard's footprint grid rather than defining a second one:
  // the same five areas (meta > title > shot > text > more) in the same DOM
  // order, with the Condition/Action/Verify list occupying the text area.
  return (
    <article className={`pcard pcard--${footprint} evi rev`}>
      <div className="pcard-meta">
        <span className="pcard-idx">{String(index + 1).padStart(2, '0')}</span>
        <span className="pcard-category">{category}</span>
        <span className="pcard-state">
          {status && (
            <span className={`pcard-status pcard-status--${statusModifier(status)}`}>
              {status}
            </span>
          )}
          {/* The gap between these two is decorative CSS; assistive tech reads
              the text nodes, which would run together as "LiveAug 2026". This
              separator is out of the flex flow, so it adds no gap. */}
          {status && updated && <span className="visually-hidden">{', '}</span>}
          {updated && <span className="pcard-updated">{formatUpdated(updated)}</span>}
        </span>
      </div>

      <h3 className="pcard-title">
        {linked ? (
          <a href={projectLink} target="_blank" rel="noopener noreferrer">{title}</a>
        ) : (
          title
        )}
      </h3>

      {image ? (
        <div className="pcard-shot">
          <picture>
            <source
              type="image/avif"
              srcSet={cardSrcSet(image)}
              sizes={EVIDENCE_SIZES_BY_FOOTPRINT[footprint]}
            />
            <img src={image} alt={`${title} screenshot`} loading="lazy" />
          </picture>
        </div>
      ) : (
        <div className="pcard-shot pcard-placeholder" aria-hidden="true">
          <span>{status || 'No screenshot'}</span>
        </div>
      )}

      <div className="pcard-text">
        <dl className="fields">
          <dt>Condition</dt>
          <dd>{fields.condition}</dd>
          <dt>Action</dt>
          <dd>{fields.action}</dd>
          <dt>Verify</dt>
          <dd>{fields.verify}</dd>
        </dl>
      </div>

      <div className="pcard-actions">
        <Link to={`/projects/${slug}`} className="pcard-more-link">
          Full write-up &rarr;
        </Link>
      </div>
    </article>
  );
}

export default function About() {
  useReveal();
  const heroProject = projects.find((p) => p.slug === HERO_PROJECT);

  return (
    <>
      {/* Hero: identity, then the paired reasoning, then operations scale. */}
      <section className="hero">
        <div className="container">
          <p className="hero__eyebrow rev" style={{ '--i': 0 }}>{HERO_EYEBROW}</p>

          <h1 className="identity__name rev" style={{ '--i': 1 }}>
            <span className="l1">{NAME_LINES[0]}</span>
            <span className="l2">{NAME_LINES[1]}</span>
          </h1>

          <div className="hero__grid">
            <div className="hero__col">
              <p className="identity__role rev" style={{ '--i': 2 }}>{HERO_ROLE}</p>

              {/* Composes the left column with the page's own structure rather
                  than with invented copy. Doubles as in-page navigation. */}
              <dl className="hero__index rev" style={{ '--i': 3 }}>
                <div><dt>01</dt><dd><a href="#work">Selected work</a></dd></div>
                <div><dt>02</dt><dd><a href="#background">Background</a></dd></div>
                <div><dt>03</dt><dd><Link to="/notes">Writing</Link></dd></div>
              </dl>
            </div>

            {heroProject?.image && (
              <figure className="hero__figure rev" style={{ '--i': 2 }}>
                <picture>
                  <source type="image/avif" srcSet={cardSrcSet(heroProject.image)} sizes={HERO_SIZES} />
                  <img
                    src={heroProject.image}
                    alt={`${heroProject.title} screenshot`}
                    width="1400"
                    height="875"
                    fetchPriority="high"
                  />
                </picture>
                <figcaption className="hero__tag">
                  <b>{heroProject.title}</b> · {heroProject.tagline} · {heroProject.status}
                </figcaption>
              </figure>
            )}
          </div>

          <p className="hero__foot rev" style={{ '--i': 4 }}>
            <span className="hero__foot-lead">Ten shipped applications</span>
            <a className="hero__jump" href="#work">See the work &darr;</a>
          </p>

          {/* One standing statement of the relationship, at every width. It
              already contains both former column headings verbatim, so the
              two-column header row it replaces added nothing but a table. */}
          <p className="pairs__head">
            What fails in the field <span aria-hidden="true">→</span> what I make structurally impossible
          </p>

          {/* Each pair is one unit: the condition set at display scale, the
              mechanism dropped and offset beneath it behind a rule. The offset
              widens across the three, so the group has a rhythm instead of
              three identical rows. --o carries that step. */}
          <div className="pairs">
            {PAIRS.map(({ id, fail, fix, attr }, i) => (
              <div className="pair" key={id} style={{ '--o': i }}>
                <span className="pairs__num">{id}</span>
                <p className="pair__fail">{fail}</p>
                <div className="pair__fix">
                  <p>{fix}</p>
                  <span className="pair__attr">{attr}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Operations evidence. The figure is set as editorial display type
              with its sentence running beneath it — deliberately not a metric
              tile in a row of metric tiles. */}
          <div className="rail">
            <div className="rail__lead">
              <span className="rail__figure">2,000+</span>
              <p className="rail__caption">
                End-of-life firmware devices identified in a business case that a customer
                upgrade program was built around.
              </p>
            </div>
            <dl className="rail__list">
              {RAIL.map(({ label, value }) => (
                <div className="rail__row" key={label}>
                  <dt className="label">{label}</dt>
                  <dd className="rail__value">{value}</dd>
                </div>
              ))}
            </dl>
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
          <h2 className="section-rule rev" id="work">
            <span className="section-rule__label">01 — Selected work</span>
          </h2>

          {EVIDENCE.map(({ slug, footprint }, i) => (
            <Evidence key={slug} slug={slug} footprint={footprint} index={i} />
          ))}

          <p className="evidence__more">
            <Link to="/portfolio">All ten projects</Link>
          </p>
        </div>
      </section>

      {/* Background --------------------------------------------------------- */}
      <section className="background">
        <div className="container">
          <h2 className="section-rule rev" id="background">
            <span className="section-rule__label">02 — Background</span>
          </h2>

          {/* Portrait leads at real scale and bleeds through the left gutter;
              the bio sits in the wide column beside it. Credentials and the
              toolbox then run full width as hairline structure rather than as
              a sidebar appendix stacked under the photo. */}
          <div className="bg-grid">
            <figure className="bg-portrait">
              <img
                src={headshot}
                alt={`${profile.fullName} headshot`}
                width="640"
                height="640"
              />
            </figure>

            <div className="bg-bio prose">
              {profile.about.map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>
          </div>

          <div className="bg-record">
            <section className="bg-record__block">
              <h3 className="bg-record__label">Certifications</h3>
              <ul className="bg-list">
                {profile.certifications.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>

            <section className="bg-record__block bg-record__block--wide">
              <h3 className="bg-record__label">Toolbox</h3>
              <div className="skill-grid">
                {profile.skillGroups.map(({ label, items }) => (
                  <div className="skill-group" key={label}>
                    <h4 className="skill-group__label">{label}</h4>
                    <p className="skill-group__items">{items.join(' · ')}</p>
                  </div>
                ))}
              </div>
            </section>
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
