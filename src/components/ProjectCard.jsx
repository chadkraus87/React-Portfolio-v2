import { Link } from 'react-router';
import { formatUpdated, statusModifier } from '../lib/projectMeta.js';
import './ProjectCard.css';

// Renders one project from src/data/projects.js.
// Buttons hide themselves when a link is null, and a placeholder panel
// renders when there's no screenshot yet. The primary button says
// "View project" unless the project sets projectLinkLabel.
//
// The long-form `details` lives on the project's own page (/projects/<slug>)
// rather than in an inline toggle: it keeps the card short the same way, and
// the write-up gets a real indexable URL that can be linked on its own.
export default function ProjectCard({ project }) {
  const {
    slug,
    title,
    tagline,
    summary,
    details,
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
    <article className="pcard">
      {image ? (
        <img src={image} alt={`${title} screenshot`} className="pcard-img" loading="lazy" />
      ) : (
        <div className="pcard-img pcard-placeholder" aria-hidden="true">
          <span>{'{ '}{title}{' }'}</span>
        </div>
      )}

      <div className="pcard-body">
        <div className="pcard-meta">
          <span className="pcard-category">{category.toLowerCase()}</span>
          <span className="pcard-state">
            {status && (
              <span className={`pcard-status pcard-status--${statusModifier(status)}`}>
                {status}
              </span>
            )}
            {updated && <span className="pcard-updated">{formatUpdated(updated)}</span>}
          </span>
        </div>

        <h3 className="pcard-title">
          <Link to={`/projects/${slug}`}>{title}</Link>
        </h3>

        {tagline && <p className="pcard-tagline">{tagline}</p>}

        <p className="pcard-desc">{summary}</p>

        {details && (
          <Link to={`/projects/${slug}`} className="pcard-more-link">
            Full write-up <span aria-hidden="true">&rarr;</span>
          </Link>
        )}

        {stack?.length > 0 && (
          <ul className="pcard-stack">
            {stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        )}

        {(projectLink || repoLink) && (
          <div className="pcard-actions">
            {projectLink && (
              <a href={projectLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                {projectLinkLabel || 'View project'}
              </a>
            )}
            {repoLink && (
              <a href={repoLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                GitHub repo
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
