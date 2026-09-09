import { Link } from 'react-router';
import { formatUpdated, statusModifier } from '../lib/projectMeta.js';
import { cardSrcSet, BAND_SIZES, HALF_SIZES, MINOR_SIZES } from '../lib/cardImages.js';
import './ProjectCard.css';

// Renders one project from src/data/projects.js in one of four compositional
// footprints, plus a coda used once at the end of the sequence.
//
// The DOM order is IDENTICAL for every footprint:
//   meta -> title -> screenshot -> tagline + summary + stack -> actions
// Footprints differ only in CSS grid placement, so the composition can vary
// widely while keyboard and screen-reader order never diverges from reading
// order. Art direction on the outside, one predictable skeleton inside.
//
// Actions hide themselves when a link is null — that is how the private-project
// policy is enforced. The long-form `details` lives at /projects/<slug>.

const SIZES = {
  band: BAND_SIZES,
  right: HALF_SIZES,
  left: HALF_SIZES,
  minor: MINOR_SIZES,
  coda: BAND_SIZES,
};

export default function ProjectCard({ project, footprint = 'right', index = 0 }) {
  const {
    slug,
    title,
    tagline,
    summary,
    stack,
    image,
    projectLink,
    projectLinkLabel,
    repoLink,
    status,
    updated,
    category,
  } = project;

  return (
    <article className={`pcard pcard--${footprint} rev`}>
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

      {/* h2, not h3: these are the only headings under the Portfolio page's
          h1, so h3 would skip a level. ProjectCard renders on Portfolio only. */}
      <h2 className="pcard-title">
        <Link to={`/projects/${slug}`}>{title}</Link>
      </h2>

      {image ? (
        <div className="pcard-shot">
          {/* AVIF variants sized for this footprint's slot; the original stays
              the fallback src. The aspect-ratio that prevents CLS lives on the
              <img> and is set per footprint in CSS. */}
          <picture>
            <source type="image/avif" srcSet={cardSrcSet(image)} sizes={SIZES[footprint]} />
            <img src={image} alt={`${title} screenshot`} loading="lazy" />
          </picture>
        </div>
      ) : (
        <div className="pcard-shot pcard-placeholder" aria-hidden="true">
          <span>{'{ '}{title}{' }'}</span>
        </div>
      )}

      <div className="pcard-text">
        {tagline && <p className="pcard-tagline">{tagline}</p>}
        <p className="pcard-desc">{summary}</p>
        {stack?.length > 0 && (
          <ul className="pcard-stack">
            {stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="pcard-actions">
        <Link to={`/projects/${slug}`} className="pcard-more-link">
          Full write-up &rarr;
        </Link>
        {projectLink && (
          <a href={projectLink} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            {projectLinkLabel || 'View project'}
          </a>
        )}
        {repoLink && (
          <a href={repoLink} className="btn btn-outline" target="_blank" rel="noopener noreferrer">
            GitHub repo
          </a>
        )}
      </div>
    </article>
  );
}
