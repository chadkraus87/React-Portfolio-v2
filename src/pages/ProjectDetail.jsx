import { useParams, Link } from 'react-router';
import { projects } from '../data/projects.js';
import NotFound from './NotFound.jsx';
import './ProjectDetail.css';

// One project's own page at /projects/<slug>. Holds the long-form `details`
// that used to sit in an inline toggle on the card, so each write-up gets a
// real URL that can be linked and indexed on its own.
//
// Routes are prerendered — when you add a project, add its slug to the
// `projects` array in scripts/prerender.mjs too.
export default function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);

  // Unknown slug falls through to the same 404 as any other bad path.
  if (!project) return <NotFound />;

  const {
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
    category,
  } = project;

  return (
    <section className="page">
      <div className="container pdetail">
        <Link to="/portfolio" className="pdetail-back">
          <span aria-hidden="true">&larr;</span> All projects
        </Link>

        <div className="pdetail-head">
          <span className="eyebrow">{category.toLowerCase()}</span>
          <h1 className="page-title">{title}</h1>
          {tagline && <p className="pdetail-tagline">{tagline}</p>}
          {status && <span className="pcard-status">{status}</span>}
        </div>

        {image && (
          <img src={image} alt={`${title} screenshot`} className="pdetail-img" />
        )}

        <div className="pdetail-body">
          <p className="pdetail-summary">{summary}</p>
          {details && <p className="pdetail-details">{details}</p>}
        </div>

        {stack?.length > 0 && (
          <div className="pdetail-section">
            <h2 className="pdetail-h2">Built with</h2>
            <ul className="pcard-stack">
              {stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </div>
        )}

        {(projectLink || repoLink) && (
          <div className="pcard-actions pdetail-actions">
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

        {!projectLink && !repoLink && (
          <p className="pdetail-note">
            This project isn&rsquo;t publicly linked — it runs on private infrastructure.
          </p>
        )}
      </div>
    </section>
  );
}
