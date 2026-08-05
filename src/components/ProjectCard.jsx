import './ProjectCard.css';

// Renders one project from src/data/projects.js.
// Buttons hide themselves when a link is null, and a placeholder panel
// renders when there's no screenshot yet. The primary button says
// "View project" unless the project sets projectLinkLabel.
//
// Cards show `summary` only. Anything in `details` sits behind a native
// <details> disclosure so one long writeup can't stretch its whole grid row.
export default function ProjectCard({ project }) {
  const {
    title,
    summary,
    details,
    stack,
    image,
    projectLink,
    projectLinkLabel,
    repoLink,
    status,
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
          {status && <span className="pcard-status">{status}</span>}
        </div>

        <h3 className="pcard-title">{title}</h3>
        <p className="pcard-desc">{summary}</p>

        {details && (
          <details className="pcard-more">
            <summary>
              <span className="pcard-more-label">More detail</span>
            </summary>
            <p className="pcard-more-body">{details}</p>
          </details>
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
